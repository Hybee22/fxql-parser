# FXQL Parser Service

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description

Foreign Exchange Query Language (FXQL) Parser implementation using NestJS. This service parses FXQL statements and stores exchange rate information for Bureau De Change (BDC) operations.

## FXQL Statement Specification

### Basic Structure

```
CURR1-CURR2 {
 BUY {AMOUNT}
 SELL {AMOUNT}
 CAP {AMOUNT}
}
```

### Rules and Constraints

- **CURR1** (Source Currency):
  - Must be exactly 3 uppercase characters
  - Valid: USD, GBP, EUR
  - Invalid: usd, USDT, US
- **CURR2** (Destination Currency):
  - Must be exactly 3 uppercase characters
  - Same rules as CURR1
- **BUY**:
  - Numeric amount in CURR2 per unit of CURR1
  - Valid: 300, 450.43, 0.04590
  - Invalid: abda, -138, 0..12039
- **SELL**:
  - Numeric amount in CURR2 per unit of CURR1
  - Same validation rules as BUY
- **CAP**:
  - Maximum transaction amount in CURR1
  - Must be a whole number
  - Can be 0 (indicating no cap)
  - Invalid: negative numbers, decimals

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- Yarn package manager

## Project Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd fxql-parser
```

2. Install dependencies:

```bash
yarn install
```

3. Configure environment variables:

```bash
cp .env.example .env
# Update .env with your database credentials
```

4. Create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE fxql_db;

# Exit psql
\q
```

5. Run database migrations:

```bash
# Run migrations
yarn migration:run

# If you need to revert migrations
yarn migration:revert
```

## Database Migrations

### Generate a new migration

```bash
yarn migration:generate src/database/migrations/MigrationName
```

### Create a blank migration

```bash
yarn migration:create src/database/migrations/MigrationName
```

### Run pending migrations

```bash
yarn migration:run
```

### Revert last migration

```bash
yarn migration:revert
```

## Running the Application

```bash
# Development mode
yarn start:dev

# Production mode
yarn start:prod
```

## API Endpoints

### Parse FXQL Statement

```bash
POST /fxql/parse
Content-Type: application/json

{
  "statement": "USD-EUR { BUY 0.85 SELL 0.87 CAP 10000 }"
}
```

## Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov
```

## Development

### Branch Naming Convention

- Feature: `feature/`
- Bugfix: `bugfix/`
- Hotfix: `hotfix/`
- Release: `release/`

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

## Environment Variables

| Variable          | Description       | Default   |
| ----------------- | ----------------- | --------- |
| DATABASE_HOST     | PostgreSQL host   | localhost |
| DATABASE_PORT     | PostgreSQL port   | 5432      |
| DATABASE_USERNAME | Database username | -         |
| DATABASE_PASSWORD | Database password | -         |
| DATABASE_NAME     | Database name     | fxql_db   |

## Error Handling

The service provides detailed error messages for invalid FXQL statements, including:

- Invalid currency formats
- Invalid numeric values
- Syntax errors
- Business rule violations

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

This project is [MIT licensed](LICENSE).

## Documentation
For detailed documentation, visit [FXQL Parser Documentation](https://fxql-parser-production.up.railway.app/docs).
