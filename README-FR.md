Read this README in English: [README.md](./README.md)

# Focus Stack

Application fullstack de productivité pour suivre son temps de concentration et gérer ses tâches — construite avec une architecture hexagonale côté frontend et backend.

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Backend | Symfony 8.0, PHP ≥ 8.4, Doctrine ORM |
| Base de données | PostgreSQL 16 (Docker) |
| DI (frontend) | Awilix |
| État serveur | TanStack React Query v4 |
| Formulaires | React Hook Form |
| Tests | PHPUnit 13 (backend), Vitest + React Testing Library (frontend) |

## Structure du projet

```
focus-stack/
├── docker-compose.yml   # PostgreSQL 16
├── frontend/            # Next.js App Router
│   └── src/
│       ├── Core/
│       │   ├── Domain/
│       │   │   ├── Entities/    # Entités métier
│       │   │   └── Ports/       # Interfaces repository, port token auth
│       │   └── Application/
│       │       ├── UseCases/    # Use cases
│       │       └── Requests/    # Objets de requête
│       ├── Infrastructure/
│       │   ├── Http/            # Adaptateurs API (fetch)
│       │   ├── Storage/         # Adaptateur cookie (token auth)
│       │   └── Di/              # Conteneur Awilix
│       └── UserInterface/
│           ├── Components/      # Composants React
│           └── Hooks/           # Hooks personnalisés (React Query)
└── backend/             # Symfony 8.0
    └── src/
        ├── Core/
        │   ├── Domain/
        │   │   ├── Entity/      # Entités POPO
        │   │   ├── Repository/  # Interfaces repository
        │   │   └── Service/     # Interfaces de service (générateur UUID)
        │   └── Application/
        │       └── UseCase/     # Use cases
        ├── Infrastructure/
        │   ├── Service/         # Services concrets (UUID)
        │   └── Persistence/Doctrine/
        │       ├── Entity/      # Entités Doctrine
        │       ├── Repository/  # Implémentations Doctrine
        │       ├── Adapter/     # Adaptateurs repository (Domaine ↔ Doctrine)
        │       └── Mapper/      # Mappers Domaine ↔ Doctrine
        └── UserInterface/
            ├── Controller/      # Contrôleurs JSON
            ├── DTO/             # DTO de requête
            ├── Presenter/       # Formatage des réponses
            └── EventSubscriber/ # Gestion globale des exceptions
```

## Démarrage rapide

### Prérequis

- Docker & Docker Compose
- PHP ≥ 8.4 + Composer
- Node.js ≥ 20 + npm
- [Symfony CLI](https://symfony.com/download)

Tout est piloté par **Make**. Un Makefile racine dans `focus-stack/` délègue aux sous-Makefiles `backend/` et `frontend/`.

### Première installation (une seule commande)

```bash
make install   # démarre Docker, installe les dépendances, crée la BDD et joue les migrations
```

### Utilisation quotidienne

```bash
make dev       # démarre la BDD + le serveur Symfony + le serveur de dev Next.js
make stop      # arrête tous les serveurs et le conteneur Docker
```

### Explorer les cibles disponibles

```bash
make help              # cibles racine
make -C backend help   # cibles backend uniquement
make -C frontend help  # cibles frontend uniquement
```

Vous pouvez aussi lancer n'importe quelle cible depuis la racine avec le préfixe `backend-` / `frontend-` :

```bash
make backend-migrate
make backend-migration-diff
make frontend-build
make frontend-lint
```

> `make` doit être installé (`brew install make` sur macOS, `choco install make` sur Windows, ou via WSL).

## Endpoints API

| Méthode | Chemin | Description |
|---------|--------|-------------|
| `POST` | `/register` | Créer un compte utilisateur |

### POST /register

Corps de la requête :
```json
{
  "email": "utilisateur@exemple.com",
  "password": "motdepasse"
}
```

Réponse `201 Created` :
```json
{
  "id": "uuid",
  "email": "utilisateur@exemple.com"
}
```

## Commandes disponibles

### Racine (`focus-stack/`)

| Cible | Description |
|-------|-------------|
| `make install` | Installation complète (BDD + dépendances + migrations) |
| `make dev` | Démarre toute la stack |
| `make stop` | Arrête tous les serveurs et la BDD |
| `make db-up` | Démarre le conteneur PostgreSQL |
| `make db-down` | Arrête le conteneur PostgreSQL |
| `make db-reset` | Remet la base à zéro (supprime toutes les données) |
| `make backend-<cible>` | Lance n'importe quelle cible backend depuis la racine |
| `make frontend-<cible>` | Lance n'importe quelle cible frontend depuis la racine |

### Backend (`focus-stack/backend/`)

| Cible | Description |
|-------|-------------|
| `make install` | `composer install` |
| `make start` | Démarre le serveur Symfony |
| `make stop` | Arrête le serveur Symfony |
| `make db-create` | Crée la base de données (première fois uniquement) |
| `make migrate` | Joue les migrations en attente |
| `make migration-diff` | Génère une migration depuis les entités |
| `make migration-status` | Affiche l'état des migrations |
| `make cache-clear` | Vide le cache Symfony |
| `make test` | Lance les tests PHPUnit |

### Frontend (`focus-stack/frontend/`)

| Cible | Description |
|-------|-------------|
| `make install` | `npm install` |
| `make dev` | Démarre le serveur de dev Next.js |
| `make build` | Build de production |
| `make start` | Démarre le serveur de production |
| `make lint` | Lance ESLint |

## Notes d'architecture

L'**architecture hexagonale** est appliquée des deux côtés :

- La couche **Domain** contient la logique métier pure sans dépendance framework (POPO côté backend, classes TypeScript simples côté frontend).
- La couche **Application** contient les use cases qui orchestrent le domaine via des interfaces repository.
- La couche **Infrastructure** fournit les implémentations concrètes (repositories Doctrine, adaptateurs HTTP) injectées via les interfaces — jamais importées directement par les couches Domain ou Application.
- La couche **UserInterface** expose les contrôleurs HTTP (backend) et les composants React / hooks (frontend).

Le frontend utilise **Awilix** comme conteneur d'injection de dépendances pour câbler les use cases et les adaptateurs au démarrage, et **TanStack React Query** pour la gestion de l'état serveur.

### Pourquoi un monorepo ?

Le frontend et le backend cohabitent dans le même dépôt. Ce n'est pas le setup le plus courant en production — les deux pourraient très bien vivre dans des dépôts séparés — mais pour un projet de portfolio ça a du sens : un seul `git clone` donne accès à la stack complète, les instructions d'installation restent au même endroit, et quiconque parcourt le code obtient une vue d'ensemble sans jongler entre plusieurs dépôts.

### Pourquoi l'architecture hexagonale ici ?

Honnêtement, elle n'est pas nécessaire pour un projet de cette taille. Une approche MVC classique aurait largement suffi — plus simple à mettre en place et plus accessible pour de nouveaux contributeurs.

Ce choix est intentionnel : ce projet est un **projet de portfolio**, conçu pour démontrer la maîtrise de patterns architecturaux avancés. L'objectif est de montrer comment structurer une base de code qui pourrait évoluer proprement — séparation stricte des responsabilités, logique métier indépendante du framework, inversion de dépendances à tous les niveaux — et non de sur-ingénierer une application de gestion de tâches.
