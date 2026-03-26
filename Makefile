# Alfred Notification Service - NestJS Makefile

DOCKER_IMAGE = alfred-notification
DOCKER_TAG = latest

.PHONY: help install dev build start test test-e2e lint format \
        migration-generate migration-run migration-revert \
        seed seed-force seed-revert \
        docker-build docker-build-nc docker-clean prod-deploy

help:
	@echo "======================================"
	@echo "Alfred Notification Service - NestJS"
	@echo "======================================"
	@echo ""
	@echo "📦 Dependencies:"
	@echo "  make install              Install dependencies"
	@echo ""
	@echo "🏗️  Build & Run:"
	@echo "  make dev                  Start dev server (debug + watch)"
	@echo "  make build                Build for production"
	@echo "  make start                Start production server"
	@echo ""
	@echo "🗃️  Database (TypeORM):"
	@echo "  make migration-generate NAME=<name>  Generate migration"
	@echo "  make migration-run                   Run all pending migrations"
	@echo "  make migration-revert                Revert last migration"
	@echo ""
	@echo "🌱 Seeding:"
	@echo "  make seed                            Run pending seeds"
	@echo "  make seed-force                      Force re-run all seeds"
	@echo "  make seed-revert                     Revert all seeds (calls down())"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  make test                 Run unit tests"
	@echo "  make test-watch           Run unit tests in watch mode"
	@echo "  make test-cov             Run unit tests with coverage"
	@echo "  make test-e2e             Run end-to-end tests"
	@echo ""
	@echo "🧹 Code Quality:"
	@echo "  make lint                 Run ESLint with auto-fix"
	@echo "  make format               Run Prettier"
	@echo ""
	@echo "🐳 Docker:"
	@echo "  make docker-build         Build Docker image"
	@echo "  make docker-build-nc      Build Docker image (no cache)"
	@echo "  make docker-clean         Remove old images"
	@echo ""
	@echo "🚀 Production:"
	@echo "  make prod-deploy          Build image for production deployment"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	pnpm install
	@echo "✅ Dependencies installed!"

# Start development server
dev:
	@echo "🚀 Starting development server..."
	pnpm dev

# Build for production
build:
	@echo "🔨 Building for production..."
	pnpm build
	@echo "✅ Build complete!"

# Start production server
start:
	@echo "▶️  Starting production server..."
	pnpm start:prod

# ============================================
# Database Migrations (TypeORM)
# ============================================

migration-generate:
	@if [ -z "$(NAME)" ]; then echo "❌ Usage: make migration-generate NAME=<migration_name>"; exit 1; fi
	@echo "📝 Generating migration: $(NAME)"
	pnpm run typeorm -- migration:generate -d src/data-source.ts src/migrations/$(NAME)
	@echo "✅ Migration generated!"

migration-run:
	@echo "🔄 Running pending migrations..."
	pnpm run migration:run
	@echo "✅ Migrations complete!"

migration-revert:
	@echo "⏪ Reverting last migration..."
	pnpm run migration:revert
	@echo "✅ Migration reverted!"

# ============================================
# Database Seeding
# ============================================

seed:
	@echo "🌱 Running pending seeds..."
	pnpm run seed
	@echo "✅ Seed complete!"

seed-force:
	@echo "🌱 Force running all seeds..."
	pnpm run seed:force
	@echo "✅ Force seed complete!"

seed-revert:
	@echo "⏪ Reverting seeds..."
	pnpm run seed:revert
	@echo "✅ Seed revert complete!"
	@echo "✅ Migration reverted!"

# ============================================
# Testing
# ============================================

test:
	@echo "🧪 Running unit tests..."
	pnpm test
	@echo "✅ Tests complete!"

test-watch:
	@echo "👀 Running tests in watch mode..."
	pnpm test:watch

test-cov:
	@echo "📊 Running tests with coverage..."
	pnpm test:cov

test-e2e:
	@echo "🧪 Running end-to-end tests..."
	pnpm test:e2e
	@echo "✅ E2E tests complete!"

# ============================================
# Code Quality
# ============================================

lint:
	@echo "🔍 Running ESLint..."
	pnpm lint
	@echo "✅ Lint complete!"

format:
	@echo "✨ Formatting code..."
	pnpm format
	@echo "✅ Format complete!"

# ============================================
# Docker
# ============================================

docker-build:
	@echo "🐳 Building Docker image: $(DOCKER_IMAGE):$(DOCKER_TAG)..."
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .
	@echo "✅ Docker image built: $(DOCKER_IMAGE):$(DOCKER_TAG)"

docker-build-nc:
	@echo "🐳 Building Docker image (no cache): $(DOCKER_IMAGE):$(DOCKER_TAG)..."
	docker build --no-cache -t $(DOCKER_IMAGE):$(DOCKER_TAG) .
	@echo "✅ Docker image built: $(DOCKER_IMAGE):$(DOCKER_TAG)"

docker-clean:
	@echo "🧹 Cleaning Docker images..."
	@docker rmi $(DOCKER_IMAGE):$(DOCKER_TAG) 2>/dev/null || true
	@docker system prune -f
	@echo "✅ Cleanup complete!"

# Production: build image then redirect to alfred-infra
prod-deploy: docker-build-nc
	@echo "🚀 Docker image built. To deploy, run:"
	@echo "  cd ../alfred-infra && make prod-deploy"
	@echo "✅ Image ready for deployment!"
