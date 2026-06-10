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

Le token est valide **3600 secondes (1 heure)** — configurable via `token_ttl` dans `config/packages/lexik_jwt_authentication.yaml`.

Réponses d'erreur :

| Code | Condition |
|------|-----------|
| `401` | Identifiants invalides (email introuvable ou mot de passe incorrect) |

> Géré par Symfony Security (`json_login`) — aucun controller custom nécessaire.

## Environnement

Configuration dans `.env` — ne jamais committer `.env.local`.

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | `postgresql://app:password@127.0.0.1:5432/focus_stack` |
| `JWT_SECRET_KEY` | `%kernel.project_dir%/config/jwt/private.pem` |
| `JWT_PUBLIC_KEY` | `%kernel.project_dir%/config/jwt/public.pem` |
| `JWT_PASSPHRASE` | *(généré à l'installation)* |

Les clés JWT sont générées localement avec `php bin/console lexik:jwt:generate-keypair` — ne jamais committer `config/jwt/`.
