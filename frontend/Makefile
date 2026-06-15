.DEFAULT_GOAL := help

##@ Dependencies
install: ## Install Node dependencies
	npm install

##@ Development
dev: ## Start the Next.js dev server (http://localhost:3000)
	npm run dev

##@ Production
build: ## Build for production
	npm run build

start: ## Start the production server
	npm run start

##@ Code quality
lint: ## Run ESLint
	npm run lint

##@ Help
help:
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Dependencies"
	@echo "  install              npm install"
	@echo ""
	@echo "Development"
	@echo "  dev                  Start the Next.js dev server (http://localhost:3000)"
	@echo ""
	@echo "Production"
	@echo "  build                Build for production"
	@echo "  start                Start the production server"
	@echo ""
	@echo "Code quality"
	@echo "  lint                 Run ESLint"

.PHONY: install dev build start lint help
