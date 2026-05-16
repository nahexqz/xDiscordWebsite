# Makefile — Legendary Community
# Usage: make <command>

.PHONY: help install dev build db-setup db-seed db-reset docker-up docker-down docker-logs clean

# Colors
GREEN  := \033[0;32m
YELLOW := \033[0;33m
NC     := \033[0m

help: ## Show this help message
	@echo "$(GREEN)Legendary Community — Available Commands$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'

install: ## Install all dependencies
	cd apps/web && npm install
	cd apps/bot && npm install
	@echo "$(GREEN)✅ All dependencies installed$(NC)"

dev: ## Start development servers (web + bot)
	@echo "$(GREEN)Starting development servers...$(NC)"
	cd apps/web && npm run dev &
	cd apps/bot && npm run dev &
	@wait

dev-web: ## Start only the web app
	cd apps/web && npm run dev

dev-bot: ## Start only the Discord bot
	cd apps/bot && npm run dev

build: ## Build all apps for production
	cd apps/web && npm run build
	cd apps/bot && npm run build

db-setup: ## Run migrations and seed the database
	cd apps/web && npx prisma generate
	cd apps/web && npx prisma migrate dev --name init
	cd apps/web && npx tsx prisma/seed.ts
	@echo "$(GREEN)✅ Database setup complete$(NC)"

db-migrate: ## Run Prisma migrations
	cd apps/web && npx prisma migrate dev

db-seed: ## Seed the database with sample data
	cd apps/web && npx tsx prisma/seed.ts

db-reset: ## Reset database (WARNING: destroys all data)
	@echo "$(YELLOW)⚠️  WARNING: This will destroy all data!$(NC)"
	cd apps/web && npx prisma migrate reset --force
	cd apps/web && npx tsx prisma/seed.ts

db-studio: ## Open Prisma Studio in browser
	cd apps/web && npx prisma studio

docker-up: ## Start Docker containers (development)
	docker-compose up -d
	@echo "$(GREEN)✅ Docker containers started$(NC)"

docker-up-prod: ## Start Docker containers (production)
	docker-compose -f docker-compose.prod.yml up -d --build
	@echo "$(GREEN)✅ Production Docker containers started$(NC)"

docker-down: ## Stop Docker containers
	docker-compose down

docker-logs: ## Tail Docker logs
	docker-compose logs -f

docker-build: ## Rebuild Docker containers
	docker-compose up -d --build

docker-db-migrate: ## Run migrations inside Docker
	docker-compose exec web npx prisma migrate deploy
	docker-compose exec web npx tsx prisma/seed.ts

stripe-listen: ## Start Stripe webhook forwarding for local dev
	stripe listen --forward-to localhost:3000/api/stripe/webhook

lint: ## Run ESLint
	cd apps/web && npm run lint

type-check: ## Run TypeScript type checking
	cd apps/web && npx tsc --noEmit

clean: ## Remove node_modules and build artifacts
	rm -rf apps/web/node_modules apps/web/.next apps/web/dist
	rm -rf apps/bot/node_modules apps/bot/dist
	@echo "$(GREEN)✅ Cleaned build artifacts$(NC)"

logs-web: ## Show web app Docker logs
	docker-compose logs -f web

logs-bot: ## Show bot Docker logs
	docker-compose logs -f bot

logs-db: ## Show database Docker logs
	docker-compose logs -f postgres

backup-db: ## Backup PostgreSQL database
	@mkdir -p backups
	docker-compose exec postgres pg_dump -U postgres legendary_community > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✅ Database backed up to backups/$(NC)"
