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
| Auth | Symfony Security + LexikJWTAuthenticationBundle |
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
- PHP 8 attributes for routing and validation — YAML only for security and bundle config.

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
| `POST` | `/login` | Authenticate and receive a JWT token |
| `POST` | `/logout` | Invalidate session (client discards token) |
| `POST` | `/token/refresh` | Exchange a refresh token for a new JWT + new refresh token |

### POST /register

Request body:
```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

Response `204 No Content` (empty body)

Error responses:

| Code | Condition |
|------|-----------|
| `400` | Validation failed (blank field, invalid email format, password too short) |
| `409` | Email already registered |

### POST /login

Request body:
```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

Response `200 OK`:
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "refresh_token": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

JWT is valid for **3600 seconds (1 hour)** — configurable via `token_ttl` in `config/packages/lexik_jwt_authentication.yaml`.

Error responses:

| Code | Condition |
|------|-----------|
| `401` | Invalid credentials (email not found or wrong password) |

> Handled by Symfony Security (`json_login`) — no custom controller needed.

### POST /logout

Requires a valid JWT in the `Authorization: Bearer <token>` header.

Response `204 No Content` (empty body)

Error responses:

| Code | Condition |
|------|-----------|
| `401` | Missing or invalid JWT token |

> The token is not server-side invalidated (stateless JWT). The client is responsible for discarding it.

### POST /token/refresh

Request body:
```json
{
  "refresh_token": "550e8400-e29b-41d4-a716-446655440000"
}
```

Response `200 OK`:
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "refresh_token": "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
}
```

The old refresh token is **invalidated** and a new one is issued (rotation). Refresh tokens are valid for **30 days**.

Error responses:

| Code | Condition |
|------|-----------|
| `400` | Missing or blank `refresh_token` field |
| `401` | Refresh token not found, expired, or associated user deleted |

## Environment

Configuration in `.env` — never commit `.env.local`.

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://app:password@127.0.0.1:5432/focus_stack` |
| `JWT_SECRET_KEY` | `%kernel.project_dir%/config/jwt/private.pem` |
| `JWT_PUBLIC_KEY` | `%kernel.project_dir%/config/jwt/public.pem` |
| `JWT_PASSPHRASE` | *(generated on install)* |

JWT keys are generated locally with `php bin/console lexik:jwt:generate-keypair` — never commit `config/jwt/`.
