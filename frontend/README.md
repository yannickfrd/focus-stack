# Focus Stack — Frontend

Next.js 16 application (React 19, TypeScript, Tailwind CSS v4) for the Focus Stack productivity app.

## Quick start

```bash
# From focus-stack/ root (recommended)
make dev

# Or directly from focus-stack/frontend/
make dev    # http://localhost:3000
```

## Available commands

| Command | Description |
|---------|-------------|
| `make install` | `npm install` |
| `make dev` | Start Next.js dev server |
| `make build` | Production build |
| `make start` | Start production server |
| `make lint` | Run ESLint |

## Architecture

Hexagonal architecture in TypeScript:

```
src/
├── app/                   # Next.js App Router (pages, layouts)
├── Core/
│   ├── Domain/
│   │   ├── Entities/      # Domain entities (pure TypeScript classes)
│   │   └── Ports/         # Repository interfaces, auth token port
│   └── Application/
│       ├── UseCases/      # Use cases (orchestrate domain via ports)
│       └── Requests/      # Request objects
├── Infrastructure/
│   ├── Http/              # API adapters (fetch-based)
│   ├── Storage/           # Cookie adapter for auth token
│   └── Di/                # Awilix DI container
└── UserInterface/
    ├── Components/        # React components
    └── Hooks/             # Custom hooks (React Query)
```

**Key dependencies:**
- [Awilix](https://github.com/jeffijoe/awilix) — dependency injection container
- [TanStack React Query v4](https://tanstack.com/query/v4) — server state management
- [React Hook Form](https://react-hook-form.com/) — form handling
- [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) — testing

## Backend API

The frontend communicates with the Symfony backend at `http://127.0.0.1:8000`. See the [root README](../README.md) for all API endpoints.
