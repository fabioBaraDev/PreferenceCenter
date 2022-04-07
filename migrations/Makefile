
COMPOSE_PROJECT_NAME=preference-center-service

migrations/dependencies/install:
	@# Help: Executes `npm ci` to install dependencies

	@npm ci

migrations/create:
	@# Help: Create a new database migration

	@printf "Migration name: " && \
	bash utils/read_line.sh  | \
	xargs npx db-migrate --config config/database.json create -e db | \
	rev | cut -d' ' -f1 | rev | \
	bash utils/refactor_migration.sh

migrations/apply:
	@# Help: Apply all unapplied migrations

	@npx db-migrate up --config config/database.json -e db

migrations/rollback:
	@# Help: Unapply the latest applied migrations

	@npx db-migrate down --config config/database.json -e db