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
    ├── DTO/                 # DTO de requête
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
| `make start` | Démarre le serveur Symfony (`http://127.0.0.1:8000`) |
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
  "refresh_token": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": "uuid",
    "email": "utilisateur@exemple.com"
  }
}
```

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

Corps de la requête :
```json
{
  "refresh_token": "550e8400-e29b-41d4-a716-446655440000"
}
```

Réponse `200 OK` :
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "refresh_token": "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
}
```

L'ancien refresh token est **invalidé** et un nouveau est émis (rotation). Les refresh tokens sont valides **30 jours**.

Réponses d'erreur :

| Code | Condition |
|------|-----------|
| `400` | Champ `refresh_token` absent ou vide |
| `401` | Refresh token introuvable, expiré, ou utilisateur associé supprimé |

## Environnement

Configuration dans `.env` — ne jamais committer `.env.local`.

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | `postgresql://app:password@127.0.0.1:5432/focus_stack` |
| `JWT_SECRET_KEY` | `%kernel.project_dir%/config/jwt/private.pem` |
| `JWT_PUBLIC_KEY` | `%kernel.project_dir%/config/jwt/public.pem` |
| `JWT_PASSPHRASE` | *(généré à l'installation)* |

Les clés JWT sont générées localement avec `php bin/console lexik:jwt:generate-keypair` — ne jamais committer `config/jwt/`.
