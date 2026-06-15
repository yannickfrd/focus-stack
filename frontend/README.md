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
| DI container | Awilix (PROXY mode) |
| Server state | TanStack React Query v4 |
| Forms | React Hook Form |
| Icons | Lucide React |
| Testing | Vitest + React Testing Library |

## Architecture

```
src/
├── app/                        # Next.js App Router (pages, layouts, providers)
├── Core/
│   ├── Domain/
│   │   ├── Entities/           # Domain entities (pure TypeScript)
│   │   │   ├── Task/           # Task, Priority
│   │   │   └── User/           # User
│   │   └── Ports/              # Port interfaces
│   │       ├── Task/           # TaskPort (getAll, create, update, toggle, postpone, reorder, remove)
│   │       └── User/           # UserLoginPort, UserLogoutPort, UserRegisterPort
│   └── Application/
│       ├── UseCases/           # Use cases (orchestrate domain via ports)
│       │   ├── Auth/           # RefreshTokenUseCase
│       │   ├── Task/           # GetTasks, CreateTask, UpdateTask, Toggle, Postpone, Reorder, Delete
│       │   └── User/           # LoginUser, LogoutUser, RegisterUser
│       └── Requests/           # Request value objects
├── Infrastructure/
│   ├── Http/                   # Fetch-based API adapters (extend AbstractHttpGateway)
│   │   ├── Auth/               # TokenRefreshHttpGateway
│   │   ├── Task/               # TaskHttpGateway (priority mapping FR ↔ EN)
│   │   └── User/               # UserLoginHttpGateway, …
│   ├── Storage/                # InMemoryTokenStore (JWT access token)
│   └── Di/                     # Awilix container (PROXY injection mode)
└── UserInterface/
    ├── Components/             # React components
    │   ├── Dashboard/          # DashboardClient
    │   ├── Layout/             # Sidebar
    │   └── Task/               # TaskItem, TaskSidebar, TaskTable, TasksPageClient
    └── Hooks/
        ├── Task/               # useTasks (React Query)
        └── User/               # useLoginUser, useLogoutUser, useRegisterUser
```

**Key rules:**
- `Core/Domain/` contains only plain TypeScript — no React, no Next.js, no Doctrine.
- Use cases receive dependencies via constructor destructuring `({ dep })` (required by Awilix PROXY mode).
- React Query hooks live in `UserInterface/Hooks/` and call use cases, not API endpoints directly.
- Priority values are mapped in `TaskHttpGateway`: `haute ↔ high`, `moyenne ↔ middle`, `basse ↔ low`.

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
| `/` | Dashboard — today's tasks + analytics (protected) |
| `/tasks` | Full task list — today, tomorrow, all (protected) |
| `/login` | Login — `POST /api/login` → JWT stored in memory, refresh token in HttpOnly cookie |
| `/register` | Register — `POST /api/register` → redirect to `/login` |

## Features

### Task management
- **Sidebar** — toggleable right panel, drag-and-drop reordering, inline editing (title, description, priority, estimated time), 5-second delay before moving completed tasks to the done section.
- **Tables** — sortable columns (title, priority, estimated time, created date, status), global search, status filter (all / in progress / done).
- **Actions** — create, update, toggle done, postpone to tomorrow, reorder, delete.

### Auth flow
On every page load, `Providers` calls `POST /api/token/refresh` before rendering any children. A loading screen is shown during this phase. On success, the new JWT is stored in memory and rendering proceeds. On failure (no valid refresh cookie), children are still rendered — unauthenticated API calls receive a `401` and redirect to `/login`.

### API proxy
All API calls go through Next.js rewrites (`/api/*` → `http://127.0.0.1:8000/*`). This ensures cookies are always same-origin, avoiding `SameSite=Strict` cross-origin issues regardless of how the app is accessed (`localhost` or `127.0.0.1`).

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | API base URL used by the frontend (set to `/api` to use the built-in proxy) |
| `BACKEND_URL` | Backend URL used by Next.js rewrites server-side (default: `http://127.0.0.1:8000`) |
