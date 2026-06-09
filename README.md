Lire ce README en français : [README-FR.md](./README-FR.md)

# Focus Stack

A fullstack productivity application for tracking focus time and managing tasks — built with a hexagonal architecture on both frontend and backend.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Backend | Symfony 8.0, PHP ≥ 8.4, Doctrine ORM |
| Database | PostgreSQL 16 (Docker) |

→ Details: [backend/README.md](./backend/README.md) · [frontend/README.md](./frontend/README.md)

## Quick Start

### Prerequisites

- Docker & Docker Compose
- PHP ≥ 8.4 + Composer
- Node.js ≥ 20 + npm
- [Symfony CLI](https://symfony.com/download)

Everything is driven by **Make**. A root Makefile at `focus-stack/` delegates to the `backend/` and `frontend/` sub-Makefiles.

> `make` must be installed (`brew install make` on macOS, `choco install make` on Windows, or via WSL).

### First install

```bash
make install   # starts Docker, installs deps, creates DB, runs migrations
```

### Daily use

```bash
make dev       # starts DB + Symfony server + Next.js dev server
make stop      # stops all servers and the database container
```

### Root commands

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

## Architecture

**Hexagonal architecture** is applied on both sides:

- **Domain** — pure business logic, no framework dependency (POPO on the backend, plain TypeScript classes on the frontend).
- **Application** — use cases that orchestrate the domain through repository interfaces.
- **Infrastructure** — concrete implementations (Doctrine repositories, HTTP adapters) injected via interfaces.
- **UserInterface** — HTTP controllers (backend) and React components / hooks (frontend).

### Why a monorepo?

Frontend and backend live in the same repository. This is not the most common setup in production — both could easily be separate repos — but for a portfolio project it makes sense: a single `git clone` gives you the full stack, the setup instructions stay in one place, and anyone reviewing the code gets a complete picture without juggling multiple repositories.

### Why hexagonal architecture here?

Honestly, it isn't required for a project of this scale. A standard MVC approach would have been perfectly sufficient — simpler to set up and easier to onboard new contributors.

The choice is deliberate: this project is a **portfolio piece**, intended to demonstrate proficiency with advanced architectural patterns. The goal is to show how to structure a codebase that could scale cleanly — strict separation of concerns, framework-agnostic domain logic, and dependency inversion throughout — not to over-engineer a to-do app.
