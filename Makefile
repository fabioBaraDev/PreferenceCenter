

COMPOSE_PROJECT_NAME=preference-center-service

infrastructure/db/init:
	@# Help: Start database for local development

	docker-compose -f infrastructure/docker-compose.yml up -d

infrastructure/db/stop:
	@# Help: Start database for local development

	docker-compose -f infrastructure/docker-compose.yml down


migrations/dependencies/install:
	@# Help: Executes `npm ci` to install dependencies on migrations

	@cd migrations && make migrations/dependencies/install

migrations/create:
	@# Help: Create a new database migration

	@cd migrations && make migrations/create

migrations/apply:
	@# Help: Apply all unapplied migrations

	@cd migrations && make migrations/apply

migrations/rollback:
	@# Help: Unapply the latest applied migrations

	@cd migrations && make migrations/rollback