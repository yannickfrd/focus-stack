Read this README in English: [README.md](./README.md)

← [Retour au README racine](../README-FR.md)

# Focus Stack — Backend

API Symfony 8.0 (PHP ≥ 8.4, Doctrine ORM, PostgreSQL) suivant l'architecture hexagonale.

## Stack technique

| | |
|---|---|
| Framework | Symfony 8.0 |
| Langage | PHP ≥ 8.4 |
| ORM | Doctrine ORM 3 |
| Base de données | PostgreSQL 16 |
| Sérialisation | Symfony Serializer |
| Validation | Symfony Validator |
| CORS | NelmioCorsBundle |
| UUID | Symfony UID |
| Authentification | Symfony Security + LexikJWTAuthenticationBundle |
| Tests | PHPUnit 13 |

## Architecture

```
src/
├── Core/
│   ├── Domain/
│   │   ├── Entity/          # Entités POPO — aucun import Doctrine
│   │   ├── Repository/      # Interfaces repository
│   │   └── Service/         # Interfaces de service (ex. générateur UUID)
│   └── Application/
│       ├── Request/         # Objets de requête applicatifs (purs, sans Symfony)
│       └── UseCase/         # Use cases (orchestrent le domaine via les interfaces)
├── Infrastructure/
│   ├── Service/             # Implémentations concrètes des services
│   └── Persistence/Doctrine/
│       ├── Entity/          # Entités Doctrine (#[ORM\Entity])
│       ├── Repository/      # Implémentations des repositories Doctrine
│       ├── Adapter/         # Adaptateurs Domaine ↔ Doctrine
│       └── Mapper/          # Mappers d'objets Domaine ↔ Doctrine
└── UserInterface/
    ├── Controller/          # Contrôleurs JSON (JsonResponse, pas de préfixe de route)
    ├── DTO/                 # DTO de requête (ajoutent #[Assert\*] aux Application Requests)
    ├── Presenter/           # Formateurs de réponse
    └── EventSubscriber/     # Gestion globale des exceptions
```

**Règles clés :**
- Les entités `Core/Domain/` sont des POPO purs — jamais d'import Doctrine.
- L'injection de dépendance utilise les interfaces Domain, pas les implémentations Infrastructure.
- Attributs PHP 8 pour le routing et la validation — YAML uniquement pour la sécurité et la config des bundles.

## Commandes

Depuis `focus-stack/backend/` :

| Cible | Description |
|-------|-------------|
| `make install` | `composer install` |
| `make start` | Démarre le serveur Symfony (`http://localhost:8000`) |
| `make stop` | Arrête le serveur Symfony |
| `make db-create` | Crée la base de données (première fois uniquement) |
| `make migrate` | Joue les migrations en attente |
| `make migration-diff` | Génère une migration depuis les entités |
| `make migration-status` | Affiche l'état des migrations |
| `make cache-clear` | Vide le cache Symfony |
| `make test` | Lance les tests PHPUnit |

## Endpoints API

| Méthode | Chemin | Description |
|---------|--------|-------------|
| `POST` | `/register` | Créer un compte utilisateur |
| `POST` | `/login` | S'authentifier et recevoir un token JWT |
| `POST` | `/logout` | Invalider la session (le client supprime le token) |
| `POST` | `/token/refresh` | Échanger un refresh token contre un nouveau JWT + nouveau refresh token |
| `GET` | `/tasks` | Lister les tâches de l'utilisateur connecté (triées par position) |
| `POST` | `/tasks` | Créer une tâche |
| `PATCH` | `/tasks/{id}` | Modifier n'importe quel champ (titre, description, priorité, estimation, done, scheduledFor) |
| `PUT` | `/tasks/reorder` | Enregistrer l'ordre (liste d'ids ordonnés) |
| `DELETE` | `/tasks/{id}` | Supprimer une tâche |
| `POST` | `/focus-times` | Enregistrer une session de focus complétée |
| `GET` | `/focus-times` | Lister toutes les sessions de focus de l'utilisateur connecté |

### POST /register

Corps de la requête :
```json
{
  "email": "utilisateur@exemple.com",
  "password": "motdepasse"
}
```

Réponse `204 No Content` (corps vide)

Réponses d'erreur :

| Code | Condition |
|------|-----------|
| `400` | Validation échouée (champ vide, format email invalide, mot de passe trop court) |
| `409` | Email déjà enregistré |

### POST /login

Corps de la requête :
```json
{
  "email": "utilisateur@exemple.com",
  "password": "motdepasse"
}
```

Réponse `200 OK` :
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "user": {
    "id": "uuid",
    "email": "utilisateur@exemple.com"
  }
}
```

Un cookie HttpOnly `refresh_token` (`SameSite=Lax`) est également posé dans la réponse — valide **30 jours**.

Le JWT est valide **3600 secondes (1 heure)** — configurable via `token_ttl` dans `config/packages/lexik_jwt_authentication.yaml`.

Réponses d'erreur :

| Code | Condition |
|------|-----------|
| `401` | Identifiants invalides (email introuvable ou mot de passe incorrect) |

> Géré par Symfony Security (`json_login`) — aucun controller custom nécessaire.

### POST /logout

Nécessite un JWT valide dans le header `Authorization: Bearer <token>`.

Réponse `204 No Content` (corps vide)

Réponses d'erreur :

| Code | Condition |
|------|-----------|
| `401` | Token JWT absent ou invalide |

> Le token n'est pas invalidé côté serveur (JWT stateless). Le client est responsable de le supprimer.

### POST /token/refresh

Pas de corps de requête — le refresh token est lu depuis le cookie HttpOnly `refresh_token` posé au login.

Réponse `200 OK` :
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
}
```

Un nouveau cookie HttpOnly `refresh_token` est posé dans la réponse (rotation). Les refresh tokens sont valides **30 jours**.

Réponses d'erreur :

| Code | Condition |
|------|-----------|
| `401` | Cookie absent, refresh token introuvable, expiré, ou utilisateur associé supprimé |

### GET /tasks

Nécessite un JWT valide dans le header `Authorization: Bearer <token>`.

Réponse `200 OK` :
```json
[
  {
    "id": 1,
    "title": "Terminer la doc API",
    "description": "...",
    "priority": "high",
    "done": false,
    "scheduledFor": "today",
    "estimatedTime": "1h 30m",
    "createdAt": "2026-06-15T09:00:00+00:00"
  }
]
```

Réponses d'erreur :

| Code | Condition |
|------|-----------|
| `401` | Token JWT absent ou invalide |

### POST /tasks

Nécessite un JWT valide.

Corps de la requête :
```json
{
  "title": "string",
  "description": "string|null",
  "priority": "high|middle|low",
  "scheduledFor": "today|tomorrow|null",
  "estimatedTime": "1h 30m|2h|45m|null"
}
```

Réponse `201 Created` — objet tâche standard (voir GET /tasks).

Réponses d'erreur :

| Code | Condition |
|------|-----------|
| `400` | Validation échouée (titre vide, priorité ou scheduledFor invalide) |
| `401` | Token JWT absent ou invalide |

### PATCH /tasks/{id}

Nécessite un JWT valide. Remplace tous les champs de la tâche — envoyer l'état complet.

- `title`, `priority`, `done` — obligatoires
- `description`, `estimatedTime`, `scheduledFor` — nullable, `null` efface le champ

Corps de la requête :
```json
{
  "title": "string",
  "description": "string|null",
  "priority": "high|middle|low",
  "estimatedTime": "1h 30m|2h|45m|null",
  "done": true,
  "scheduledFor": "today|tomorrow|null"
}
```

Réponse `200 OK` — objet tâche standard.

Réponses d'erreur :

| Code | Condition |
|------|-----------|
| `400` | Validation échouée |
| `401` | Token JWT absent ou invalide |
| `404` | Tâche introuvable ou n'appartient pas à l'utilisateur connecté |

### PUT /tasks/reorder

Nécessite un JWT valide.

Corps de la requête :
```json
{
  "ids": [3, 1, 5, 2, 4]
}
```

Réponse `204 No Content`

Réponses d'erreur :

| Code | Condition |
|------|-----------|
| `400` | Validation échouée (ids vide, valeurs non entières) |
| `401` | Token JWT absent ou invalide |
| `404` | Un des ids n'appartient pas à l'utilisateur connecté |

### DELETE /tasks/{id}

Nécessite un JWT valide. Pas de corps de requête.

Réponse `204 No Content`

Réponses d'erreur :

| Code | Condition |
|------|-----------|
| `401` | Token JWT absent ou invalide |
| `404` | Tâche introuvable ou n'appartient pas à l'utilisateur connecté |

### POST /focus-times

Nécessite un JWT valide. Appelé quand le timer de focus atteint zéro.

Corps de la requête :
```json
{
  "duration": 25,
  "taskId": 123
}
```

- `duration` — obligatoire, entier en minutes, 1–480
- `taskId` — optionnel, omettre ou mettre `null` si aucune tâche sélectionnée

Réponse `201 Created` :
```json
{
  "id": 1,
  "taskId": 123,
  "duration": 25,
  "completedAt": "2026-06-17T10:30:00+00:00"
}
```

Réponses d'erreur :

| Code | Condition |
|------|-----------|
| `400` | Validation échouée (duration manquant, hors plage, taskId négatif) |
| `401` | Token JWT absent ou invalide |

### GET /focus-times

Nécessite un JWT valide. Retourne les sessions triées de la plus récente à la plus ancienne.

Réponse `200 OK` :
```json
[
  {
    "id": 1,
    "taskId": 123,
    "duration": 25,
    "completedAt": "2026-06-17T10:30:00+00:00"
  }
]
```

Réponses d'erreur :

| Code | Condition |
|------|-----------|
| `401` | Token JWT absent ou invalide |

## Environnement

Configuration dans `.env` — ne jamais committer `.env.local`.

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | `postgresql://app:password@127.0.0.1:5432/focus_stack` |
| `CORS_ALLOW_ORIGIN` | `http://localhost:3000` — à surcharger dans `.env.local` pour d'autres origines |
| `JWT_SECRET_KEY` | `%kernel.project_dir%/config/jwt/private.pem` |
| `JWT_PUBLIC_KEY` | `%kernel.project_dir%/config/jwt/public.pem` |
| `JWT_PASSPHRASE` | *(généré à l'installation)* |

Les clés JWT sont générées localement avec `php bin/console lexik:jwt:generate-keypair` — ne jamais committer `config/jwt/`.
