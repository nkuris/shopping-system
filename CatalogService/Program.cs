using CatalogService.Data;
using CatalogService.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});
builder.Services.AddEndpointsApiExplorer();

// Configure DbContext with transient error resiliency
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"), sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure(maxRetryCount: 5, maxRetryDelay: TimeSpan.FromSeconds(5), errorNumbersToAdd: null);
    }));

// Register Service Layer Dependency
builder.Services.AddScoped<ICatalogService, CatalogServiceImplementation>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClient", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

// Apply pending EF Core migrations at startup (safe for dev/test).
// Retry connecting to the DB until it's ready; useful when SQL Server runs in a separate container.
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("CatalogService");
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Configurable via environment variables; defaults are conservative for container startup.
        var maxRetries = int.TryParse(Environment.GetEnvironmentVariable("DB_MIGRATION_RETRIES"), out var r) ? r : 30;
        var delaySeconds = int.TryParse(Environment.GetEnvironmentVariable("DB_MIGRATION_DELAY_SECONDS"), out var d) ? d : 2;

        for (var attempt = 1; attempt <= maxRetries; attempt++)
        {
            try
            {
                logger.LogInformation("Attempting database connection (attempt {Attempt}/{Max})...", attempt, maxRetries);
                if (await db.Database.CanConnectAsync())
                {
                    logger.LogInformation("Database is available. Applying migrations...");
                    db.Database.Migrate();
                    logger.LogInformation("Database migrations applied successfully.");
                    break;
                }
                else
                {
                    logger.LogWarning("Database not ready yet (attempt {Attempt}/{Max}).", attempt, maxRetries);
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Exception while trying to connect/migrate DB on attempt {Attempt}/{Max}.", attempt, maxRetries);
            }

            if (attempt == maxRetries)
            {
                logger.LogError("Exceeded maximum DB migration attempts ({Max}). Migrations were not applied.", maxRetries);
            }
            else
            {
                await Task.Delay(TimeSpan.FromSeconds(delaySeconds));
            }
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while migrating or initializing the database.");
        // don't rethrow; let the app attempt to start and report errors
    }
}

app.UseCors("AllowClient");
app.UseAuthorization();
app.MapControllers();

app.Run();
