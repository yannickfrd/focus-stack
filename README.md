Lire ce README en français : [README-FR.md](./README-FR.md)

# Focus Stack

A fullstack productivity application for tracking focus time and managing tasks — built with a hexagonal architecture on both frontend and backend.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Backend | Symfony 8.0, PHP ≥ 8.4, Doctrine ORM |
| Database | PostgreSQL 16 (Docker) |
| DI (frontend) | Awilix |
| Server state | TanStack React Query v4 |
| Forms | React Hook Form |
| Testing | PHPUnit 13 (backend), Vitest + React Testing Library (frontend) |

## Project Structure

```
focus-stack/
├── docker-compose.yml   # PostgreSQL 16
├── frontend/            # Next.js App Router
│   └── src/
│       ├── Core/
│       │   ├── Domain/
│       │   │   ├── Entities/    # Domain entities
│       │   │   └── Ports/       # Repository interfaces, auth token port
│       │   └── Application/
│       │       ├── UseCases/    # Use cases
│       │       └── Requests/    # Request objects
│       ├── Infrastructure/
│       │   ├── Http/            # API adapters (fetch)
│       │   ├── Storage/         # Cookie adapter (auth token)
│       │   └── Di/              # Awilix container
│       └── UserInterface/
│           ├── Components/      # React components
│           └── Hooks/           # Custom hooks (React Query)
└── backend/             # Symfony 8.0
    └── src/
        ├── Core/
        │   ├── Domain/
        │   │   ├── Entity/      # POPO entities
        │   │   ├── Repository/  # Repository interfaces
        │   │   └── Service/     # Service interfaces (UUID generator)
        │   └── Application/
        │       └── UseCase/     # Use cases
        ├── Infrastructure/
        │   ├── Service/         # Concrete services (UUID)
        │   └── Persistence/Doctrine/
        │       ├── Entity/      # Doctrine entities
        │       ├── Repository/  # Doctrine implementations
        │       ├── Adapter/     # Repository adapters (Domain ↔ Doctrine)
        │       └── Mapper/      # Domain ↔ Doctrine mappers
        └── UserInterface/
            ├── Controller/      # JSON controllers
            ├── DTO/             # Request DTOs
            ├── Presenter/       # Response formatting
            └── EventSubscriber/ # Global exception handling
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- PHP ≥ 8.4 + Composer
- Node.js ≥ 20 + npm
- [Symfony CLI](https://symfony.com/download)

Everything is driven by **Make**. A root Makefile at `focus-stack/` delegates to the `backend/` and `frontend/` sub-Makefiles.

### First install (one command)

```bash
make install   # starts Docker, installs deps, creates DB, runs migrations
```

### Daily use

```bash
make dev       # starts DB + Symfony server + Next.js dev server
make stop      # stops all servers and the database container
```

### Explore available targets

```bash
make help              # root targets
make -C backend help   # backend-only targets
make -C frontend help  # frontend-only targets
```

You can also run any sub-Makefile target from the root with the `backend-` / `frontend-` prefix:

```bash
make backend-migrate
make backend-migration-diff
make frontend-build
make frontend-lint
```

> `make` must be installed (`brew install make` on macOS, `choco install make` on Windows, or via WSL).

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

## Available Commands

### Root (`focus-stack/`)

| Target | Description |
|--------|-------------|
| `make install` | Full first-time setup (DB + deps + migrations) |
| `make dev` | Start the full stack |
| `make stop` | Stop all servers and the DB |
| `make db-up` | Start the PostgreSQL container |
| `make db-down` | Stop the PostgreSQL container |
| `make db-reset` | Wipe and restart the database |
| `make backend-<target>` | Run any backend target from the root |
| `make frontend-<target>` | Run any frontend target from the root |

### Backend (`focus-stack/backend/`)

| Target | Description |
|--------|-------------|
| `make install` | `composer install` |
| `make start` | Start the Symfony dev server |
| `make stop` | Stop the Symfony dev server |
| `make db-create` | Create the database (first run only) |
| `make migrate` | Run pending migrations |
| `make migration-diff` | Generate a migration from entity changes |
| `make migration-status` | Show migration status |
| `make cache-clear` | Clear the Symfony cache |
| `make test` | Run PHPUnit tests |

### Frontend (`focus-stack/frontend/`)

| Target | Description |
|--------|-------------|
| `make install` | `npm install` |
| `make dev` | Start the Next.js dev server |
| `make build` | Production build |
| `make start` | Start the production server |
| `make lint` | Run ESLint |

## Architecture Notes

**Hexagonal architecture** is applied on both sides:

- **Domain** layer contains pure business logic with no framework dependency (POPO on the backend, plain TypeScript classes on the frontend).
- **Application** layer holds use cases that orchestrate the domain through repository interfaces.
- **Infrastructure** layer provides concrete implementations (Doctrine repositories, HTTP adapters) injected via interfaces — never imported directly by the domain or application layers.
- **UserInterface** layer exposes HTTP controllers (backend) and React components / hooks (frontend).

The frontend uses **Awilix** as a DI container to wire use cases and repository adapters at startup, and **TanStack React Query** for server state management.

### Why a monorepo?

Frontend and backend live in the same repository. This is not the most common setup in production — both could easily be separate repos — but for a portfolio project it makes sense: a single `git clone` gives you the full stack, the setup instructions stay in one place, and anyone reviewing the code gets a complete picture without juggling multiple repositories.

### Why hexagonal architecture here?

Honestly, it isn't required for a project of this scale. A standard MVC approach would have been perfectly sufficient — simpler to set up and easier to onboard new contributors.

The choice is deliberate: this project is a **portfolio piece**, intended to demonstrate proficiency with advanced architectural patterns. The goal is to show how to structure a codebase that could scale cleanly — strict separation of concerns, framework-agnostic domain logic, and dependency inversion throughout — not to over-engineer a to-do app.
