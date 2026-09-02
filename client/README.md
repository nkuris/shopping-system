# Shopping System - Client (React + TypeScript + Vite)

This README supplements the project-level documentation and explains how to run the client portion of the Shopping System repository.

## Project composition

- **client**: React + TypeScript app built with Vite (this folder).
- **CatalogService**: ASP.NET Web API (.NET 10) providing product & category data (CatalogService folder).
- **OrderService**: Node/TypeScript service for order-related work (OrderService folder).

## Prerequisites

- **.NET 10 SDK** (required to build and run CatalogService)
- **Node.js** (recommended `>= 18`) and **npm** or **yarn** (required for client and OrderService)
- A **SQL Server** instance accessible to CatalogService. **LocalDB** is used by default in development (see connection string below).
- Optional: **Docker** (if you prefer running SQL Server in a container)

## Repository structure (relevant folders)

- **/client** — React application (this folder)
- **/CatalogService** — ASP.NET Core Web API (uses EF Core; migrations are included)
- **/OrderService** — Node/TypeScript service (npm scripts available)

## Configuration

- CatalogService expects a connection string named `"DefaultConnection"` in `CatalogService/appsettings.json`. The default development value is:

  ```
  Server=(localdb)\\mssqllocaldb;Database=ShoppingCatalogDb;Trusted_Connection=True;MultipleActiveResultSets=true
  ```

  You can override this by setting the environment variable `ASPNETCORE_ENVIRONMENT=Development` and editing the `appsettings.Development.json` or by setting the environment variable `DOTNET_ConnectionStrings__DefaultConnection` (or using other host configuration methods).

  Example SQL Server connection string (full SQL Server instance):

  ```
  Server=localhost,1433;Database=ShoppingCatalogDb;User Id=sa;Password=YourStrong!Passw0rd;MultipleActiveResultSets=true
  ```

## Running the system locally (recommended dev flow)

1. **Start CatalogService (API)**
   - From the repository root:
     ```
     dotnet restore
     dotnet run --project CatalogService
     ```

   - The CatalogService project applies EF Core migrations automatically at startup (see `CatalogService/Program.cs`). Ensure the configured SQL Server is reachable before starting if using a remote/container instance.

   - Default local URLs (see `CatalogService/Properties/launchSettings.json`):
     ```
     http://localhost:5245
     https://localhost:7189
     ```

2. **Start OrderService (if needed)**
   - `cd OrderService`
   - `npm install`
   - `npm run dev`

3. **Start the client**
   - `cd client`
   - `npm install`
   - `npm run dev`

   - The Vite dev server will start (by default on `http://localhost:5173`) and the client will call the backend CatalogService endpoints. If you need to change API base URLs, update your environment/config in the client code.

## Database and migrations

- Migrations are included in `CatalogService/Migrations`. The API will attempt to create the target database and apply migrations at startup. If you prefer to apply migrations manually:

  ```
  cd CatalogService
  dotnet ef database update
  ```

  (Ensure the `dotnet-ef` tool is available or use the global tool: `dotnet tool install --global dotnet-ef`)

## Running with Docker (optional)

- You can run SQL Server in Docker and point CatalogService at it. Example Docker command for SQL Server (Linux/WSL/Windows Docker):

  ```
  docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong!Passw0rd" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest
  ```

  Then update CatalogService connection string to: `Server=host.docker.internal,1433;Database=ShoppingCatalogDb;User Id=sa;Password=YourStrong!Passw0rd;`

## Build and production notes

- Build the client for production:
  ```
  cd client
  npm run build
  ```

- Build and publish CatalogService:
  ```
  dotnet publish -c Release --output ./publish CatalogService
  ```

## Tips and troubleshooting

- If migrations fail at startup, check the configured connection string and ensure the SQL Server user has permissions to create databases.
- If the client cannot reach the API, verify CORS configuration in CatalogService (it exposes a permissive policy named `"AllowClient"` for development).
- If you change ports or hostnames, update the client API base URLs accordingly.

## Contributing

- Follow the repository coding conventions. Frontend uses TypeScript + React; backend uses .NET 10 and Entity Framework Core.

## License

- This repository does not include a license file. Add one if you intend to open-source the project.

## More information

- See individual project folders for more details and per-service README files (where present).
