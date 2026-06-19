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
| Conteneur DI | Awilix (mode PROXY) |
| État serveur | TanStack React Query v4 |
| Formulaires | React Hook Form |
| Icônes | Lucide React |
| Tests | Vitest + React Testing Library |

## Architecture

```
src/
├── app/                        # Next.js App Router (pages, layouts, providers)
├── Core/
│   ├── Domain/
│   │   ├── Entities/           # Entités métier (TypeScript pur)
│   │   │   ├── Task/           # Task, Priority
│   │   │   ├── FocusTime/      # FocusTime
│   │   │   └── User/           # User
│   │   └── Ports/              # Interfaces de port
│   │       ├── Auth/           # TokenRefreshPort
│   │       ├── Task/           # TaskPort (getAll, create, update, reorder, remove)
│   │       ├── FocusTime/      # FocusTimePort (create, list)
│   │       └── User/           # UserLoginPort, UserLogoutPort, UserRegisterPort
│   └── Application/
│       ├── UseCases/           # Use cases (orchestrent le domaine via les ports)
│       │   ├── Auth/           # RefreshTokenUseCase
│       │   ├── Task/           # GetTasks, CreateTask, UpdateTask, ReorderTasks, DeleteTask
│       │   ├── FocusTime/      # CreateFocusTime, ListFocusTimes
│       │   └── User/           # LoginUser, LogoutUser, RegisterUser
│       └── Requests/           # Objets de requête
├── Infrastructure/
│   ├── Http/                   # Adaptateurs API fetch (héritent d'AbstractHttpGateway)
│   │   ├── Auth/               # TokenRefreshHttpGateway
│   │   ├── Task/               # TaskHttpGateway
│   │   ├── FocusTime/          # FocusTimeHttpGateway
│   │   └── User/               # UserLoginHttpGateway, …
│   ├── Storage/                # InMemoryTokenStore (JWT access token)
│   └── Di/                     # Conteneur Awilix (mode PROXY)
└── UserInterface/
    ├── Components/             # Composants React réutilisables
    │   ├── Common/             # ConfirmDialog
    │   ├── Layout/             # Sidebar
    │   └── Task/               # TaskItem, TaskSidebar, TaskTable, TimeEstimatePicker
    ├── Screens/                # Composants de page (un par route)
    │   ├── Dashboard/          # DashboardScreen
    │   ├── Task/               # TasksScreen
    │   └── Focus/              # FocusScreen
    └── Hooks/
        ├── Task/               # useTasks, useTaskFilters
        ├── Focus/              # useFocusTimer, useFocusTime, useFocusConfig
        └── User/               # useLoginUser, useLogoutUser, useRegisterUser
```

**Règles clés :**
- `Core/Domain/` contient uniquement du TypeScript pur — pas de React, pas de Next.js.
- Les use cases reçoivent leurs dépendances par déstructuration `({ dep })` (requis par le mode PROXY d'Awilix).
- Les hooks React Query sont dans `UserInterface/Hooks/` et appellent les use cases, pas les endpoints directement.
- Les valeurs de priorité sont mappées dans `TaskHttpGateway` : `haute ↔ high`, `moyenne ↔ middle`, `basse ↔ low`.

## Commandes

Depuis `focus-stack/frontend/` :

| Cible | Description |
|-------|-------------|
| `make install` | `npm install` |
| `make dev` | Démarre le serveur de dev Next.js (`http://localhost:3000`) |
| `make build` | Build de production |
| `make start` | Démarre le serveur de production |
| `make lint` | Lance ESLint |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Tableau de bord — tâches du jour + analytique (protégé) |
| `/tasks` | Liste complète des tâches — aujourd'hui, demain, toutes (protégé) |
| `/focus` | Minuteur focus — choisir une tâche, une durée, lancer une session de type Pomodoro (protégé) |
| `/login` | Connexion — `POST /login` → JWT stocké en mémoire, refresh token en cookie HttpOnly |
| `/register` | Inscription — `POST /register` → redirection vers `/login` |

## Fonctionnalités

### Gestion des tâches
- **Sidebar** — panneau droit toggleable, réorganisation par drag-and-drop, édition inline (titre, description, priorité, estimation), délai de 5 secondes avant déplacement dans la section "accomplies", délai de 3 secondes avant déplacement dans la section "demain".
- **Sections de la sidebar** — tâches du jour / tâches de demain (séparateur "Demain") / tâches accomplies (séparateur "Accomplies").
- **Tableaux** — colonnes triables (titre, priorité, estimation, date de création, statut), recherche globale, filtre par statut (toutes / en cours / terminées).
- **Actions** — créer, modifier, cocher, reporter à demain (toggleable), réordonner, supprimer. Cocher et reporter utilisent `PATCH /tasks/{id}` avec la valeur explicite — pas d'endpoints dédiés.
- **Mises à jour optimistes** — toutes les mutations mettent à jour le cache React Query immédiatement ; le serveur confirme en arrière-plan. En cas d'erreur, le cache revient à l'état précédent.

### Flux d'authentification
À chaque chargement de page, `Providers` appelle `POST /token/refresh` avant de rendre les enfants. Un écran de chargement est affiché pendant cette phase. En cas de succès, le nouveau JWT est stocké en mémoire et le rendu se poursuit. En cas d'échec (pas de cookie de refresh valide), les enfants sont tout de même rendus — les appels API non authentifiés reçoivent un `401` et redirigent vers `/login`.

### Proxy API
Tous les appels API transitent par `src/proxy.ts` (convention proxy Next.js 16). Les requêtes avec `Accept: application/json` sont réécrites côté serveur vers `http://127.0.0.1:8000`. Cela garantit que les cookies sont toujours sur le même origin, évitant les problèmes `SameSite=Lax` cross-origin.

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Base URL de l'API côté client (laisser vide pour utiliser le proxy) |
| `BACKEND_URL` | URL du backend utilisée par le proxy côté serveur (défaut : `http://127.0.0.1:8000`) |
