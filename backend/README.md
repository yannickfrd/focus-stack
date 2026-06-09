Lire ce README en français : [README-FR.md](./README-FR.md)

← [Back to root README](../README.md)

# Focus Stack — Backend

Symfony 8.0 API (PHP ≥ 8.4, Doctrine ORM, PostgreSQL) following hexagonal architecture.

## Tech Stack

| | |
|---|---|
| Framework | Symfony 8.0 |
| Language | PHP ≥ 8.4 |
| ORM | Doctrine ORM 3 |
| Database | PostgreSQL 16 |
| Serialization | Symfony Serializer |
| Validation | Symfony Validator |
| CORS | NelmioCorsBundle |
| UUID | Symfony UID |
| Testing | PHPUnit 13 |

## Architecture

```
src/
├── Core/
│   ├── Domain/
│   │   ├── Entity/          # POPO entities — no Doctrine import
│   │   ├── Repository/      # Repository interfaces
│   │   └── Service/         # Service interfaces (e.g. UUID generator)
│   └── Application/
│       └── UseCase/         # Use cases (orchestrate domain via interfaces)
├── Infrastructure/
│   ├── Service/             # Concrete service implementations
│   └── Persistence/Doctrine/
│       ├── Entity/          # Doctrine ORM entities (#[ORM\Entity])
│       ├── Repository/      # Doctrine repository implementations
│       ├── Adapter/         # Adapters bridging Domain ↔ Doctrine
│       └── Mapper/          # Domain ↔ Doctrine object mappers
└── UserInterface/
    ├── Controller/          # JSON controllers (JsonResponse, no route prefix)
    ├── DTO/                 # Request DTOs
    ├── Presenter/           # Response formatters
    └── EventSubscriber/     # Global exception handling
```

**Key rules:**
- `Core/Domain/` entities are pure POPOs — never import Doctrine there.
- Dependency injection uses Domain interfaces, not Infrastructure implementations.
- PHP 8 attributes only — no YAML/XML config.

## Commands

From `focus-stack/backend/`:

| Target | Description |
|--------|-------------|
| `make install` | `composer install` |
| `make start` | Start Symfony dev server (`http://127.0.0.1:8000`) |
| `make stop` | Stop Symfony dev server |
| `make db-create` | Create the database (first run only) |
| `make migrate` | Run pending Doctrine migrations |
| `make migration-diff` | Generate a migration from entity changes |
| `make migration-status` | Show migration status |
| `make cache-clear` | Clear the Symfony cache |
| `make test` | Run PHPUnit tests |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/register` | Register a new user |

### POST /register

Request body:
```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

Response `201 Created`:
```json
{
  "id": "uuid",
  "email": "user@example.com"
}
```

## Environment

Configuration in `.env` — never commit `.env.local`.

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://app:password@127.0.0.1:5432/focus_stack` |
