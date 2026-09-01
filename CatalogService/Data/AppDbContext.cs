using CatalogService.Models;
using Microsoft.EntityFrameworkCore;

namespace CatalogService.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Seed Categories
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "חלב וגבינות" },
            new Category { Id = 2, Name = "בשר" }
        );

        // Seed Products based on specification
        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 1, Name = "קוטג'", CategoryId = 1 },
            new Product { Id = 2, Name = "חלב 3%", CategoryId = 1 },
            new Product { Id = 3, Name = "שמנת חמוצה", CategoryId = 1 },
            new Product { Id = 4, Name = "נקניקיות", CategoryId = 2 },
            new Product { Id = 5, Name = "שוקיים", CategoryId = 2 },
            new Product { Id = 6, Name = "סלמון", CategoryId = 2 }
        );
    }
}