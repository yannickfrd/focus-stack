.DEFAULT_GOAL := help

##@ First install
install: db-up ## Install all dependencies and initialise the database
	$(MAKE) -C backend install
	$(MAKE) -C frontend install
	$(MAKE) -C backend db-create
	$(MAKE) -C backend migrate

##@ Development
dev: db-up ## Start the full stack (DB + backend + frontend dev server)
ifeq ($(OS),Windows_NT)
	cmd.exe /c start "Symfony Backend" cmd /k "cd backend && symfony serve --no-tls"
else
	($(MAKE) -C backend start) &
endif
	$(MAKE) -C frontend dev

stop: ## Stop all running servers
	$(MAKE) -C backend stop
	docker compose down

##@ Database
db-up: ## Start the PostgreSQL container
	docker compose up -d

db-down: ## Stop the PostgreSQL container
	docker compose down

db-reset: ## Wipe and restart the database (destroys all data)
	docker compose down -v
	docker compose up -d

##@ Backend
backend-%: ## Run a backend target  (e.g. make backend-migrate)
	$(MAKE) -C backend $*

##@ Frontend
frontend-%: ## Run a frontend target  (e.g. make frontend-build)
	$(MAKE) -C frontend $*

##@ Help
help:
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "First install"
	@echo "  install              Install all dependencies and initialise the database"
	@echo ""
	@echo "Development"
	@echo "  dev                  Start the full stack (DB + backend + frontend dev server)"
	@echo "  stop                 Stop all running servers"
	@echo ""
	@echo "Database"
	@echo "  db-up                Start the PostgreSQL container"
	@echo "  db-down              Stop the PostgreSQL container"
	@echo "  db-reset             Wipe and restart the database (destroys all data)"
	@echo ""
	@echo "Backend (shortcuts from root)"
	@echo "  backend-<target>     Run any backend target  (e.g. make backend-migrate)"
	@echo ""
	@echo "Frontend (shortcuts from root)"
	@echo "  frontend-<target>    Run any frontend target  (e.g. make frontend-build)"

.PHONY: install dev stop db-up db-down db-reset help
