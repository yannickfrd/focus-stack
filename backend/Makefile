.DEFAULT_GOAL := help

##@ Dependencies
install: ## Install PHP dependencies
	composer install

##@ Server
start: ## Start the Symfony dev server (http://127.0.0.1:8000)
	symfony serve --no-tls

stop: ## Stop the Symfony dev server
	symfony server:stop

##@ Database
db-create: ## Create the database (first run only)
	php bin/console doctrine:database:create

migrate: ## Run pending migrations
	php bin/console doctrine:migrations:migrate --no-interaction

migration-diff: ## Generate a migration from entity changes
	php bin/console doctrine:migrations:diff

migration-status: ## Show migration status
	php bin/console doctrine:migrations:status

##@ Utilities
cache-clear: ## Clear the Symfony cache
	php bin/console cache:clear

test: ## Run PHPUnit tests
	vendor/bin/phpunit

##@ Help
help:
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Dependencies"
	@echo "  install              composer install"
	@echo ""
	@echo "Server"
	@echo "  start                Start the Symfony dev server (http://127.0.0.1:8000)"
	@echo "  stop                 Stop the Symfony dev server"
	@echo ""
	@echo "Database"
	@echo "  db-create            Create the database (first run only)"
	@echo "  migrate              Run pending migrations"
	@echo "  migration-diff       Generate a migration from entity changes"
	@echo "  migration-status     Show migration status"
	@echo ""
	@echo "Utilities"
	@echo "  cache-clear          Clear the Symfony cache"
	@echo "  test                 Run PHPUnit tests"

.PHONY: install start stop db-create migrate migration-diff migration-status cache-clear test help
