# Shopping System — Local Development

This repository contains multiple services for the Shopping System. The recommended way to start and run everything locally is with Docker Compose.

Prerequisites
- Docker Desktop (with WSL 2 backend on Windows)
- Docker Compose (CLI v2 or compatible)
- .NET 10 SDK (only required if you want to build/run services locally outside containers)

Quick start (PowerShell)
1. Clone the repo:
   git clone https://github.com/nkuris/shopping-system.git
   cd shopping-system

2. (Optional) Copy example env file and edit if needed:
   cp .env.example .env

3. Start the stack:
   docker compose up --build -d

4. Verify the Catalog service:
   Invoke-RestMethod http://localhost:5000/api/categories
   # or curl http://localhost:5000/api/categories

What we configured for reliable first-run
- A SQL Server container is defined in docker-compose.yml and uses a development SA password (BlueMonday2@). This is for local development only — do not use in production.
- A TCP-based healthcheck for SQL Server so compose can detect readiness.
- A one-shot sqlserver-setup service runs sqlcmd to execute mssql/init/init.sql which ensures the CatalogDb database exists before services start.
- CatalogService contains a startup migration loop. The app will retry DB connection and apply EF Core migrations. Retry behavior is configurable with env vars (defaults provided in docker-compose):
  - DB_MIGRATION_RETRIES (default 30)
  - DB_MIGRATION_DELAY_SECONDS (default 2)

Useful commands
- View logs: docker compose logs -f catalogservice
- View all service status: docker compose ps
- Tear down and remove volumes: docker compose down -v

Troubleshooting
- Docker not running or insufficient resources (increase RAM/CPU in Docker Desktop)
- Port conflicts: ensure 1433/5000/3000 are free or change mappings in docker-compose.yml
- If migrations fail, inspect catalogservice logs and sqlserver-setup logs for errors

CI and reproducibility recommendations
- Commit EF Core migrations to the repo so containers can apply them at startup
- Add a CI job that builds the solution, starts the compose stack, runs smoke tests against endpoints, then tears down the stack

Security note
- The provided SA password is for local development only. Use secure secrets and non-privileged accounts in staging and production.

Files of interest
- docker-compose.yml — compose stack and env defaults
- mssql/init/init.sql — one-shot SQL init script
- CatalogService/Program.cs — migration retry logic
- scripts/start.ps1, scripts/stop.ps1 (not present by default) — consider adding for convenience

If you want, I can add start/stop scripts and a simple smoke-test script and a GitHub Actions workflow to validate a clean clone automatically.
