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
- Attributs PHP 8 uniquement — pas de config YAML/XML.

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

## Environnement

Configuration dans `.env` — ne jamais committer `.env.local`.

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | `postgresql://app:password@127.0.0.1:5432/focus_stack` |
