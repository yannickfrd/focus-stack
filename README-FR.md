Read this README in English: [README.md](./README.md)

# Focus Stack

Application fullstack de productivité pour suivre son temps de concentration et gérer ses tâches — construite avec une architecture hexagonale côté frontend et backend.

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Backend | Symfony 8.0, PHP ≥ 8.4, Doctrine ORM |
| Base de données | PostgreSQL 16 (Docker) |

→ Détails : [backend/README-FR.md](./backend/README-FR.md) · [frontend/README-FR.md](./frontend/README-FR.md)

## Démarrage rapide

### Prérequis

- Docker & Docker Compose
- PHP ≥ 8.4 + Composer
- Node.js ≥ 20 + npm
- [Symfony CLI](https://symfony.com/download)

Tout est piloté par **Make**. Un Makefile racine dans `focus-stack/` délègue aux sous-Makefiles `backend/` et `frontend/`.

> `make` doit être installé (`brew install make` sur macOS, `choco install make` sur Windows, ou via WSL).

### Première installation

```bash
make install   # démarre Docker, installe les dépendances, crée la BDD et joue les migrations
```

### Utilisation quotidienne

```bash
make dev       # démarre la BDD + le serveur Symfony + le serveur de dev Next.js
make stop      # arrête tous les serveurs et le conteneur Docker
```

### Commandes racine

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

## Fonctionnalités

| Route | Description |
|-------|-------------|
| `/login` | Connexion email + mot de passe, JWT + refresh token |
| `/register` | Création de compte |
| `/` | Tableau de bord — tâches du jour, analytique, sidebar de tâches rapide |
| `/tasks` | Liste complète des tâches — aujourd'hui, demain, toutes |

**Gestion des tâches** — créer, éditer inline, cocher, reporter à demain, réordonner par drag-and-drop, supprimer. Tableaux triables avec recherche et filtre par statut.

**Auth** — JWT access token (1h) stocké en mémoire, refresh token (30 jours) en cookie HttpOnly. Renouvellement transparent à chaque chargement de page via `Providers`.

## Architecture

L'**architecture hexagonale** est appliquée des deux côtés :

- **Domain** — logique métier pure, sans dépendance framework (POPO côté backend, TypeScript pur côté frontend).
- **Application** — use cases qui orchestrent le domaine via des interfaces de port.
- **Infrastructure** — implémentations concrètes (repositories Doctrine, adaptateurs HTTP) injectées via les interfaces.
- **UserInterface** — contrôleurs HTTP (backend) et composants React / hooks (frontend).

### Pourquoi un monorepo ?

Le frontend et le backend cohabitent dans le même dépôt. Ce n'est pas le setup le plus courant en production — les deux pourraient très bien vivre dans des dépôts séparés — mais pour un projet de portfolio ça a du sens : un seul `git clone` donne accès à la stack complète, les instructions d'installation restent au même endroit, et quiconque parcourt le code obtient une vue d'ensemble sans jongler entre plusieurs dépôts.

### Pourquoi l'architecture hexagonale ici ?

Honnêtement, elle n'est pas nécessaire pour un projet de cette taille. Une approche MVC classique aurait largement suffi — plus simple à mettre en place et plus accessible pour de nouveaux contributeurs.

Ce choix est intentionnel : ce projet est un **projet de portfolio**, conçu pour démontrer la maîtrise de patterns architecturaux avancés. L'objectif est de montrer comment structurer une base de code qui pourrait évoluer proprement — séparation stricte des responsabilités, logique métier indépendante du framework, inversion de dépendances à tous les niveaux — et non de sur-ingénierer une application de gestion de tâches.
