.PHONY: help build start stop restart logs clean backup restore

# Default target
help:
	@echo "TriExpert Services - Docker Compose Commands"
	@echo ""
	@echo "Available commands:"
	@echo "  make setup      - Initial setup (copy .env, generate secrets)"
	@echo "  make build      - Build all Docker images"
	@echo "  make start      - Start all services"
	@echo "  make stop       - Stop all services"
	@echo "  make restart    - Restart all services"
	@echo "  make logs       - View logs from all services"
	@echo "  make status     - Show status of all services"
	@echo "  make clean      - Stop and remove containers"
	@echo "  make clean-all  - Stop and remove containers + volumes (WARNING: deletes data)"
	@echo "  make backup     - Backup database and storage"
	@echo "  make restore    - Restore from backup"
	@echo "  make shell-db   - Open PostgreSQL shell"
	@echo "  make shell-app  - Open frontend container shell"
	@echo ""

# Initial setup
setup:
	@echo "Setting up TriExpert Services..."
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "Created .env file from .env.example"; \
		echo ""; \
		echo "⚠️  IMPORTANT: Edit .env and set the following:"; \
		echo "  - POSTGRES_PASSWORD"; \
		echo "  - JWT_SECRET (run: openssl rand -base64 32)"; \
		echo "  - SECRET_KEY_BASE (run: openssl rand -base64 32)"; \
		echo "  - N8N_BASIC_AUTH_PASSWORD"; \
		echo "  - SMTP_* settings"; \
	else \
		echo ".env file already exists"; \
	fi

# Build images
build:
	@echo "Building Docker images..."
	docker-compose build

# Start services
start:
	@echo "Starting all services..."
	docker-compose up -d
	@echo ""
	@echo "Services started! Access points:"
	@echo "  Frontend:        http://localhost"
	@echo "  Supabase Studio: http://localhost:3001"
	@echo "  Supabase API:    http://localhost:8000"
	@echo "  n8n:             http://localhost:5678"
	@echo ""
	@echo "Run 'make logs' to view logs"

# Stop services
stop:
	@echo "Stopping all services..."
	docker-compose stop

# Restart services
restart:
	@echo "Restarting all services..."
	docker-compose restart

# View logs
logs:
	docker-compose logs -f

# Show status
status:
	@echo "Service Status:"
	@docker-compose ps
	@echo ""
	@echo "Resource Usage:"
	@docker stats --no-stream

# Clean containers
clean:
	@echo "Stopping and removing containers..."
	docker-compose down

# Clean everything including volumes
clean-all:
	@echo "⚠️  WARNING: This will delete all data!"
	@read -p "Are you sure? (yes/no): \" confirm; \
	if [ "$$confirm" = "yes" ]; then \
		docker-compose down -v; \
		echo "All containers and volumes removed"; \
	else \
		echo "Cancelled"; \
	fi

# Backup database
backup:
	@echo "Creating backup..."
	@mkdir -p backups
	@docker-compose exec -T postgres pg_dump -U postgres postgres > backups/db-backup-$$(date +%Y%m%d-%H%M%S).sql
	@docker run --rm -v triexpert-storage-data:/data -v $$(pwd)/backups:/backup ubuntu tar czf /backup/storage-backup-$$(date +%Y%m%d-%H%M%S).tar.gz /data
	@docker run --rm -v triexpert-n8n-data:/data -v $$(pwd)/backups:/backup ubuntu tar czf /backup/n8n-backup-$$(date +%Y%m%d-%H%M%S).tar.gz /data
	@echo "Backup completed in backups/ directory"

# Restore from backup
restore:
	@echo "Available backups:"
	@ls -lh backups/
	@echo ""
	@read -p "Enter database backup filename: \" db_file; \
	cat backups/$$db_file | docker-compose exec -T postgres psql -U postgres postgres
	@echo "Database restored"

# Database shell
shell-db:
	docker-compose exec postgres psql -U postgres postgres

# Frontend shell
shell-app:
	docker-compose exec triexpert-frontend sh

# Update frontend only
update-frontend:
	@echo "Updating frontend..."
	docker-compose build triexpert-frontend
	docker-compose up -d triexpert-frontend
	@echo "Frontend updated"

# Run migrations
migrate:
	@echo "Running database migrations..."
	@for file in supabase/migrations/*.sql; do \
		echo "Applying $$file..."; \
		docker-compose exec -T postgres psql -U postgres -d postgres < $$file; \
	done
	@echo "Migrations completed"

# Health check
health:
	@echo "Checking service health..."
	@curl -s http://localhost/health && echo "✓ Frontend: OK" || echo "✗ Frontend: FAIL"
	@curl -s http://localhost:8000/rest/v1/ > /dev/null && echo "✓ Supabase API: OK" || echo "✗ Supabase API: FAIL"
	@curl -s http://localhost:3001 > /dev/null && echo "✓ Supabase Studio: OK" || echo "✗ Supabase Studio: FAIL"
	@curl -s http://localhost:5678 > /dev/null && echo "✓ n8n: OK" || echo "✗ n8n: FAIL"
