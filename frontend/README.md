Lire ce README en français : [README-FR.md](./README-FR.md)

← [Back to root README](../README.md)

# Focus Stack — Frontend

Next.js 16 application (React 19, TypeScript, Tailwind CSS v4) following hexagonal architecture.

## Tech Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| DI container | Awilix |
| Server state | TanStack React Query v4 |
| Forms | React Hook Form |
| Icons | Lucide React |
| Testing | Vitest + React Testing Library |

## Architecture

```
src/
├── app/                     # Next.js App Router (pages, layouts, providers)
├── Core/
│   ├── Domain/
│   │   ├── Entities/        # Domain entities (pure TypeScript classes)
│   │   └── Ports/           # Repository interfaces, auth token port
│   └── Application/
│       ├── UseCases/        # Use cases (orchestrate domain via ports)
│       └── Requests/        # Request objects
├── Infrastructure/
│   ├── Http/                # API adapters (fetch-based)
│   ├── Storage/             # Cookie adapter for auth token
│   └── Di/                  # Awilix DI container setup
└── UserInterface/
    ├── Components/          # React components
    └── Hooks/               # Custom hooks (React Query)
```

**Key rules:**
- `Core/Domain/` contains only plain TypeScript — no React, no Next.js.
- Use cases receive dependencies via constructor (injected by Awilix).
- React Query hooks live in `UserInterface/Hooks/` and call use cases, not API endpoints directly.

## Commands

From `focus-stack/frontend/`:

| Target | Description |
|--------|-------------|
| `make install` | `npm install` |
| `make dev` | Start Next.js dev server (`http://localhost:3000`) |
| `make build` | Production build |
| `make start` | Start production server |
| `make lint` | Run ESLint |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Tableau de bord (protégé) |
| `/login` | Connexion — `POST /login` → JWT + refresh token stockés en cookie |
| `/register` | Inscription — `POST /register` → redirection vers `/login` |

Toute route non publique redirige vers `/login` si aucun cookie de session n'est présent.

## Comportements transversaux

**Déconnexion** — un bouton "Se déconnecter" est visible dans la sidebar sur toutes les pages protégées. Il appelle `POST /logout`, efface le cookie `session` et le cookie `refresh_token`, puis redirige vers `/login`.

**Renouvellement automatique du token** — lorsqu'une requête authentifiée reçoit un `401`, le client tente silencieusement un `POST /token/refresh`. En cas de succès, les deux cookies sont renouvelés et la requête initiale est rejouée. En cas d'échec, les cookies sont effacés et l'utilisateur est redirigé vers `/login`.

## Backend API

The frontend communicates with the Symfony backend at `http://127.0.0.1:8000`.  
See [backend/README.md](../backend/README.md) for all API endpoints.
