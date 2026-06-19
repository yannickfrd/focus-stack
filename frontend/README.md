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
│   │   │   ├── FocusTime/      # FocusTime
│   │   │   └── User/           # User
│   │   └── Ports/              # Port interfaces
│   │       ├── Auth/           # TokenRefreshPort
│   │       ├── Task/           # TaskPort (getAll, create, update, reorder, remove)
│   │       ├── FocusTime/      # FocusTimePort (create, list)
│   │       └── User/           # UserLoginPort, UserLogoutPort, UserRegisterPort
│   └── Application/
│       ├── UseCases/           # Use cases (orchestrate domain via ports)
│       │   ├── Auth/           # RefreshTokenUseCase
│       │   ├── Task/           # GetTasks, CreateTask, UpdateTask, ReorderTasks, DeleteTask
│       │   ├── FocusTime/      # CreateFocusTime, ListFocusTimes
│       │   └── User/           # LoginUser, LogoutUser, RegisterUser
│       └── Requests/           # Request value objects
├── Infrastructure/
│   ├── Http/                   # Fetch-based API adapters (extend AbstractHttpGateway)
│   │   ├── Auth/               # TokenRefreshHttpGateway
│   │   ├── Task/               # TaskHttpGateway
│   │   ├── FocusTime/          # FocusTimeHttpGateway
│   │   └── User/               # UserLoginHttpGateway, …
│   ├── Storage/                # InMemoryTokenStore (JWT access token)
│   └── Di/                     # Awilix container (PROXY injection mode)
└── UserInterface/
    ├── Components/             # Reusable React components
    │   ├── Common/             # ConfirmDialog
    │   ├── Layout/             # Sidebar
    │   └── Task/               # TaskItem, TaskSidebar, TaskTable, TimeEstimatePicker
    ├── Screens/                # Page-level components (one per route)
    │   ├── Dashboard/          # DashboardScreen
    │   ├── Task/               # TasksScreen
    │   └── Focus/              # FocusScreen
    └── Hooks/
        ├── Task/               # useTasks, useTaskFilters
        ├── Focus/              # useFocusTimer, useFocusTime, useFocusConfig
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
| `/focus` | Focus timer — select a task, choose duration, run a Pomodoro-style session (protected) |
| `/login` | Login — `POST /login` → JWT stored in memory, refresh token in HttpOnly cookie |
| `/register` | Register — `POST /register` → redirect to `/login` |

## Features

### Task management
- **Sidebar** — toggleable right panel, drag-and-drop reordering, inline editing (title, description, priority, estimated time), 5-second delay before completed tasks move to the done section, 3-second delay before postponed tasks move to the tomorrow section.
- **Sidebar sections** — today's tasks / tomorrow's tasks (separator "Demain") / done tasks (separator "Accomplies").
- **Tables** — sortable columns (title, priority, estimated time, created date, status), global search, status filter (all / in progress / done).
- **Actions** — create, update, toggle done, postpone to tomorrow (toggleable), reorder, delete. Toggle and postpone use `PATCH /tasks/{id}` with explicit field values — no dedicated endpoints.
- **Optimistic updates** — all mutations update the React Query cache immediately; the server confirms in the background. On error, the cache reverts to the previous state.

### Auth flow
On every page load, `Providers` calls `POST /token/refresh` before rendering any children. A loading screen is shown during this phase. On success, the new JWT is stored in memory and rendering proceeds. On failure (no valid refresh cookie), children are still rendered — unauthenticated API calls receive a `401` and redirect to `/login`.

### API proxy
All API calls go through `src/proxy.ts` (Next.js 16 proxy convention). Requests with `Accept: application/json` are rewritten server-side to `http://127.0.0.1:8000`. This ensures cookies are always same-origin, avoiding `SameSite=Lax` cross-origin issues regardless of how the app is accessed.

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | API base URL used by the frontend (leave empty to use the proxy) |
| `BACKEND_URL` | Backend URL used by the proxy server-side (default: `http://127.0.0.1:8000`) |
