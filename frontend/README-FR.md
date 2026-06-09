Read this README in English: [README.md](./README.md)

← [Retour au README racine](../README-FR.md)

# Focus Stack — Frontend

Application Next.js 16 (React 19, TypeScript, Tailwind CSS v4) suivant l'architecture hexagonale.

## Stack technique

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Langage | TypeScript (strict) |
| Styles | Tailwind CSS v4 |
| Conteneur DI | Awilix |
| État serveur | TanStack React Query v4 |
| Formulaires | React Hook Form |
| Icônes | Lucide React |
| Tests | Vitest + React Testing Library |

## Architecture

```
src/
├── app/                     # Next.js App Router (pages, layouts, providers)
├── Core/
│   ├── Domain/
│   │   ├── Entities/        # Entités métier (classes TypeScript pures)
│   │   └── Ports/           # Interfaces repository, port token auth
│   └── Application/
│       ├── UseCases/        # Use cases (orchestrent le domaine via les ports)
│       └── Requests/        # Objets de requête
├── Infrastructure/
│   ├── Http/                # Adaptateurs API (fetch)
│   ├── Storage/             # Adaptateur cookie pour le token auth
│   └── Di/                  # Conteneur Awilix
└── UserInterface/
    ├── Components/          # Composants React
    └── Hooks/               # Hooks personnalisés (React Query)
```

**Règles clés :**
- `Core/Domain/` contient uniquement du TypeScript pur — pas de React, pas de Next.js.
- Les use cases reçoivent leurs dépendances par constructeur (injectées par Awilix).
- Les hooks React Query sont dans `UserInterface/Hooks/` et appellent les use cases, pas les endpoints API directement.

## Commandes

Depuis `focus-stack/frontend/` :

| Cible | Description |
|-------|-------------|
| `make install` | `npm install` |
| `make dev` | Démarre le serveur de dev Next.js (`http://localhost:3000`) |
| `make build` | Build de production |
| `make start` | Démarre le serveur de production |
| `make lint` | Lance ESLint |

## API Backend

Le frontend communique avec l'API Symfony sur `http://127.0.0.1:8000`.  
Voir [backend/README-FR.md](../backend/README-FR.md) pour tous les endpoints.
