-- Ensure the CatalogDb database exists before the application attempts migrations
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'CatalogDb')
BEGIN
	CREATE DATABASE [CatalogDb];
END
GO

-- You can add additional initialization or seed data here if desired.
-- Keep this script minimal since EF Core migrations will create schema/tables.
