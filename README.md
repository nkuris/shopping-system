# Shopping System

This repository contains a small shopping system used for a take-home assignment. It includes three components and a Docker Compose setup so the whole system can be run locally.

Supported platforms: Windows (PowerShell), Docker Desktop with Compose v2+.

---

## Quick start (download & run with Docker)

1. Clone the repository:

   ```powershell
   git clone https://github.com/nkuris/shopping-system.git
   cd shopping-system
   ```

2. Start everything with Docker Compose (build images on first run):

   ```powershell
   docker compose up --build --detach
   ```

3. Check that services are running:

   ```powershell
   docker compose ps
   docker compose logs -f --tail 100
   ```

4. Open the client in your browser:

   - http://localhost:3000 — React SPA (Shopping list + Order summary)

5. Test API endpoints from host (examples):

   - CatalogService (categories):
	 ```powershell
	 curl http://localhost:5000/api/categories
	 ```

   - OrderService (submit order):
	 ```powershell
	 curl -X POST http://localhost:5001/api/orders -H "Content-Type: application/json" -d '{"fullName":"Test","address":"Addr","email":"t@e.com","items":[{"productId":1,"productName":"X","quantity":1}]}'
	 ```

6. Inspect MongoDB (orders stored here):

   ```powershell
   docker exec -it shopping-system-mongo-1 mongosh --eval 'use shopping_orders_db; db.orders.find().pretty()'
   ```

7. Stop and remove the stack

   ```powershell
   docker compose down
   ```

---

## Project architecture

The solution is composed of three independent services plus a docker-compose file to orchestrate them.

- `CatalogService` (C#, .NET 10)
  - ASP.NET Core Web API
  - Entity Framework Core with SQL Server provider
  - Exposes `/api/categories` which returns categories with products
  - Uses EF Core migrations to create the CatalogDb and seed data
  - Port: 5000 (mapped to container port 80)

- `OrderService` (Node.js + TypeScript)
  - Express API using TypeScript
  - Mongoose for MongoDB persistence
  - Exposes `/api/orders` to receive and save orders
  - Port: 5001

- `client` (React + Redux Toolkit + Vite)
  - Two screens: Shopping list and Order summary
  - Stores cart in Redux Toolkit slice
  - Posts orders to OrderService
  - Port: 3000

Services are connected by Docker Compose and use the Docker network to talk to each other.

---

## Validations

- Client-side (React):
  - Required fields: full name, address, email
  - Email format validation
  - Cart must contain at least one item
  - Per-field inline messages and an error summary
  - Submit button disabled while request in progress
  - Friendly success toast on completion

- Server-side (OrderService):
  - Validates payload shape in the POST handler (fullName/address/email/items)
  - Verifies email pattern, items array structure, and quantity as positive integer
  - Returns HTTP 400 with `{ message, errors: string[] }` on validation failure
  - Mongoose schema includes email regex and quantity >= 1

- Server-side (CatalogService):
  - Uses EF Core and migrations to create DB and seeded categories/products
  - Configured to ignore JSON reference cycles when serializing entities

---

## Docker Compose

- Single `docker-compose.yml` builds/starts:
  - `sqlserver` (mcr.microsoft.com/mssql/server)
  - `mongo` (mongo:6)
  - `catalogservice` (built from `CatalogService/Dockerfile`)
  - `orderservice` (built from `OrderService/Dockerfile`)
  - `client` (built from `client/Dockerfile`)

Important environment values are set in the compose file (SA password, MONGO_URI). If you change the SA password, you must remove the SQL Server volume before recreating the container (volume contains DB files). Example:

```powershell
docker compose down
docker volume rm shopping-system_sqlserver-data
docker compose up --build
```

---

## Troubleshooting & verification

- If CatalogService fails to connect to SQL Server due to TLS or cert issues, the compose file sets `TrustServerCertificate=True` for local development.
- Check logs:
  ```powershell
  docker compose logs -f catalogservice
  docker compose logs -f orderservice
  docker compose logs -f mongo
  ```
- Verify orders in MongoDB:
  ```powershell
  docker exec -it shopping-system-mongo-1 mongosh --eval 'use shopping_orders_db; db.orders.find().pretty()'
  ```

---

## How to validate the repository download & run (simulating the examiner)

1. On a fresh machine with Docker Desktop installed:
   - Clone the repository.
   - Run `docker compose up --build --detach`.
   - Wait until containers are created and healthy (`docker compose ps`).
   - Use the curl commands above to verify `/api/categories` returns data and POST to `/api/orders` returns 201.
   - Open the client at http://localhost:3000 and perform the UI flow (add items, continue, submit).

2. If any of those steps fail, gather logs (commands above) and check that Docker has sufficient resources (SQL Server needs ~2GB), and verify volumes were not left from a previous run with a different SA password.

---

If you want, I can also:
- Add a `README` section with a one-click script to run the compose stack or a `docker-compose.override.yml` for development (bind mounts, live reload).
- Add a CI workflow to build images and run a smoke test.
