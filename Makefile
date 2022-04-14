

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

infrastructure/init:
	@# Help: Start local database instance and create the database objects 

	@make infrastructure/db/init
	@make migrations/dependencies/install
	@export DATABASE_URL="postgres://root:root@localhost/localdev" && make migrations/apply

startup:
	@# Help: Start the project for local testing

	@make infrastructure/init
	@cd service && npm install .
	@cd service && npm run start:dev

tests:
	@# Help: Run the local unit tests

	@make infrastructure/init
	@cd service && npm run test