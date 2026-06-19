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
│       ├── Request/         # Application request objects (pure, no Symfony)
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
    ├── DTO/                 # Request DTOs (extend Application Requests, add #[Assert\*])
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
| `make start` | Start Symfony dev server (`http://localhost:8000`) |
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
| `GET` | `/tasks` | List authenticated user's tasks (ordered by position) |
| `POST` | `/tasks` | Create a task |
| `PATCH` | `/tasks/{id}` | Update any task field (title, description, priority, estimatedTime, done, scheduledFor) |
| `PUT` | `/tasks/reorder` | Persist task order (ordered id list) |
| `DELETE` | `/tasks/{id}` | Delete a task |
| `POST` | `/focus-times` | Record a completed focus session |
| `GET` | `/focus-times` | List all focus sessions for the authenticated user |

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
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

A `refresh_token` HttpOnly cookie (`SameSite=Lax`) is also set in the response — valid for **30 days**.

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

No request body — the refresh token is read from the `refresh_token` HttpOnly cookie set at login.

Response `200 OK`:
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
}
```

A new `refresh_token` HttpOnly cookie is set in the response (rotation). Refresh tokens are valid for **30 days**.

Error responses:

| Code | Condition |
|------|-----------|
| `401` | Refresh token cookie absent, not found, expired, or associated user deleted |

### GET /tasks

Requires a valid JWT in the `Authorization: Bearer <token>` header.

Response `200 OK`:
```json
[
  {
    "id": 1,
    "title": "Finish API docs",
    "description": "...",
    "priority": "high",
    "done": false,
    "scheduledFor": "today",
    "estimatedTime": "1h 30m",
    "createdAt": "2026-06-15T09:00:00+00:00"
  }
]
```

Error responses:

| Code | Condition |
|------|-----------|
| `401` | Missing or invalid JWT token |

### POST /tasks

Requires a valid JWT in the `Authorization: Bearer <token>` header.

Request body:
```json
{
  "title": "string",
  "description": "string|null",
  "priority": "high|middle|low",
  "scheduledFor": "today|tomorrow|null",
  "estimatedTime": "1h 30m|2h|45m|null"
}
```

Response `201 Created`:
```json
{
  "id": 1,
  "title": "New Task",
  "description": null,
  "priority": "middle",
  "done": false,
  "scheduledFor": "today",
  "estimatedTime": null,
  "createdAt": "2026-06-15T09:00:00+00:00"
}
```

Error responses:

| Code | Condition |
|------|-----------|
| `400` | Validation failed (blank title, invalid priority or scheduledFor) |
| `401` | Missing or invalid JWT token |

### PATCH /tasks/{id}

Requires a valid JWT. Replaces all task fields — send the full current state of the task.

- `title`, `priority`, `done` — required
- `description`, `estimatedTime`, `scheduledFor` — nullable, `null` clears the field

Request body:
```json
{
  "title": "string",
  "description": "string|null",
  "priority": "high|middle|low",
  "estimatedTime": "1h 30m|2h|45m|null",
  "done": true,
  "scheduledFor": "today|tomorrow|null"
}
```

Response `200 OK` — standard task object (see GET /tasks).

Error responses:

| Code | Condition |
|------|-----------|
| `400` | Validation failed |
| `401` | Missing or invalid JWT token |
| `404` | Task not found or does not belong to the authenticated user |

### PUT /tasks/reorder

Requires a valid JWT.

Request body:
```json
{
  "ids": [3, 1, 5, 2, 4]
}
```

Response `204 No Content`

Error responses:

| Code | Condition |
|------|-----------|
| `400` | Validation failed (empty ids, non-integer values) |
| `401` | Missing or invalid JWT token |
| `404` | One of the ids does not belong to the authenticated user |

### DELETE /tasks/{id}

Requires a valid JWT. No request body.

Response `204 No Content`

Error responses:

| Code | Condition |
|------|-----------|
| `401` | Missing or invalid JWT token |
| `404` | Task not found or does not belong to the authenticated user |

### POST /focus-times

Requires a valid JWT. Called when the focus timer reaches zero.

Request body:
```json
{
  "duration": 25,
  "taskId": 123
}
```

- `duration` — required, integer in minutes, 1–480
- `taskId` — optional, omit or set to `null` if no task was selected

Response `201 Created`:
```json
{
  "id": 1,
  "taskId": 123,
  "duration": 25,
  "completedAt": "2026-06-17T10:30:00+00:00"
}
```

Error responses:

| Code | Condition |
|------|-----------|
| `400` | Validation failed (missing duration, duration out of range, negative taskId) |
| `401` | Missing or invalid JWT token |

### GET /focus-times

Requires a valid JWT. Returns sessions ordered by most recent first.

Response `200 OK`:
```json
[
  {
    "id": 1,
    "taskId": 123,
    "duration": 25,
    "completedAt": "2026-06-17T10:30:00+00:00"
  }
]
```

Error responses:

| Code | Condition |
|------|-----------|
| `401` | Missing or invalid JWT token |

## Environment

Configuration in `.env` — never commit `.env.local`.

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://app:password@127.0.0.1:5432/focus_stack` |
| `CORS_ALLOW_ORIGIN` | `http://localhost:3000` — override in `.env.local` for other origins |
| `JWT_SECRET_KEY` | `%kernel.project_dir%/config/jwt/private.pem` |
| `JWT_PUBLIC_KEY` | `%kernel.project_dir%/config/jwt/public.pem` |
| `JWT_PASSPHRASE` | *(generated on install)* |

JWT keys are generated locally with `php bin/console lexik:jwt:generate-keypair` — never commit `config/jwt/`.
