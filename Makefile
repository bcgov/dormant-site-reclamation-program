#!make

ifneq ($(OS),Windows_NT)
POSIXSHELL := 1
KC_HOST_ENTRY := $(shell grep "keycloak" /etc/hosts)
else
POSIXSHELL :=
KC_HOST_ENTRY := $(shell findstr "keycloak" C:\Windows\System32\drivers\etc\hosts)
endif

local-dev: one-time-local-dev-env-setup
restore-dev: restore-last-env
rebuild-all-local: reset | project pause-30 create-local-keycloak-users generate-rand100 rebuild-all-local-friendly-message
backend: backend-build | backend-run
database: database-build | database-run
frontend: frontend-build | frontend-run
project: project-build | project-run
rebuild: project-build
reset:  stop | clean
database-seed: database-dump | database-dump-seed
database-seed-local: database-dump | database-dump-seed-local

one-time-local-dev-env-setup:
	@echo "+\n++ Setting up your local development environment"
	@echo "++ with local authentication and db.  Run this once only."
	@echo "++ Your last configuration files were saved with the ending '*-last-backup'."
ifneq ($(POSIXSHELL),)
ifeq ($(KC_HOST_ENTRY),)
	@echo "++ Adding required keycloak entry to hosts file:"
	@echo "127.0.0.1       localhost       keycloak" | sudo tee -a /etc/hosts;
endif
	@[ ! -f ./services/dsrp-web/.env ] || cp ./services/dsrp-web/.env ./services/dsrp-web/.env-last-backup
	@cp ./services/dsrp-web/.env-dev-local-keycloak ./services/dsrp-web/.env
	@[ ! -f "./services/dsrp-web/src/constants/environment.js" ] || cp ./services/dsrp-web/src/constants/environment.js ./services/dsrp-web/src/constants/environment.js-last-backup
	@cp ./services/dsrp-web/src/constants/environment.js-dev-local-keycloak ./services/dsrp-web/src/constants/environment.js
	@[ ! -f "./services/dsrp-api/.env" ] || cp ./services/dsrp-api/.env ./services/dsrp-api/.env-last-backup
	@cp ./services/dsrp-api/.env-dev-local-keycloak ./services/dsrp-api/.env
	@[ ! -f "./services/nris-api/backend/.env" ] || cp ./services/nris-api/backend/.env ./services/nris-api/backend/.env-last-backup
	@cp ./services/nris-api/backend/.env-dev-local-keycloak ./services/nris-api/backend/.env
	@[ ! -f "./services/document-manager/backend/.env" ] || cp ./services/document-manager/backend/.env ./services/document-manager/backend/.env-last-backup
	@cp ./services/document-manager/backend/.env-dev-local-keycloak ./services/document-manager/backend/.env
else
	@if "$(KC_HOST_ENTRY)" GTR "" (echo "hosts entry already exists") else (echo 127.0.0.1        localhost       keycloak >> C:\Windows\System32\drivers\etc\hosts)
	@if exist .\services\dsrp-web\.env copy /Y .\services\dsrp-web\.env .\services\dsrp-web\.env-last-backup
	@copy /Y .\services\dsrp-web\.env-dev-local-keycloak .\services\dsrp-web\.env
	@if exist .\services\dsrp-web\src\constants\environment.js copy /Y .\services\dsrp-web\src\constants\environment.js .\services\dsrp-web\src\constants\environment.js-last-backup
	@copy /Y .\services\dsrp-web\src\constants\environment.js-dev-local-keycloak .\services\dsrp-web\src\constants\environment.js
	@if exist .\services\dsrp-api\.env copy .\services\dsrp-api\.env .\services\dsrp-api\.env-last-backup
	@copy /Y .\services\dsrp-api\.env-dev-local-keycloak .\services\dsrp-api\.env
	@if exist .\services\document-manager\backend\.env copy .\services\document-manager\backend\.env .\services\document-manager\backend\.env-last-backup
	@copy /Y .\services\document-manager\backend\.env-dev-local-keycloak .\services\document-manager\backend\.env
endif
	@echo "+"

restore-last-env:
	@echo "+\n++ Restoring your environment from last backup...\n+"
	@cp ./services/dsrp-web/.env-last-backup ./services/dsrp-web/.env
	@cp ./services/dsrp-web/src/constants/environment.js ./services/dsrp-web/src/constants/environment.js-last-backup
	@cp ./services/dsrp-api/.env-last-backup ./services/dsrp-api/.env
	@cp ./services/nris-api/backend/.env-last-backup ./services/nris-api/backend/.env
	@cp ./services/document-manager/backend/.env-last-backup ./services/document-manager/backend/.env

pause-30:
	@echo "+\n++ Pausing 30 seconds\n+"
ifneq ($(POSIXSHELL),)
	@sleep 30
else
	@timeout 30
endif

create-local-keycloak-users:
	@echo "+\n++ Creating admin user... (admin/admin)\n+"
	@docker exec -it dsrp_keycloak /tmp/keycloak-local-user.sh

rebuild-all-local-friendly-message:
	@echo "+\n++ dsrp_frontend will be available at http://localhost:3000"
	@echo "++ dsrp_backend will be available at http://localhost:5000"
	@echo "++ dsrp_postgres will be available at http://localhost:5432"
	@echo "++ dsrp_keycloak will be available at http://keycloak:8080\n+"

project-build:
	@echo "+\n++ Performing project build ...\n+"
	@docker-compose build --force-rm --no-cache --parallel

project-run:
	@echo "+\n++ Running project...\n+"
	@docker-compose up -d

backend-build:
	@echo "+\n++ Performing backend build ...\n+"
	@docker-compose build --force-rm --no-cache --parallel backend

backend-run:
	@echo "+\n++ Running backend app...\n+"
	@docker-compose up -d backend

backend-entry:
	@echo "+\n++ Entering backend container ...\n+"
	@docker exec -it dsrp_backend bash

cache:
	@echo "+\n++ Running redis...\n+"
	@docker-compose up -d redis

database-build:
	@echo "+\n++ Performing postgres build ...\n+"
	@docker-compose build --parallel postgres flyway

database-run:
	@echo "+\n++ Running postgres and Flyway migrations...\n+"
	@docker-compose up -d postgres flyway

frontend-build:
	@echo "+\n++ Performing frontend build ...\n+"
	@docker-compose build frontend

frontend-run:
	@echo "+\n++ Running frontend...\n+"
	@docker-compose up -d frontend

keycloak:
	@echo "+\n++ Running keycloak...\n+"
	@docker-compose up --force-recreate -d keycloak

keycloak-user:
	@echo "+\n++ Creating local admin user...\n+"
	@docker exec -it dsrp_keycloak /tmp/keycloak-local-user.sh

stop:
	@echo "+\n++ Stopping backend and postgres...\n+"
	@docker-compose down

clean:
	@echo "+\n++ Cleaning ...\n+"
	@docker-compose rm -f -v -s
	@docker rmi -f dsrp_postgres dsrp_backend dsrp_frontend dsrp_flyway
	@docker volume rm dsrp_postgres-data -f

clean-db: stop |
	@docker rmi -f dsrp_flyway
	@docker volume rm dsrp_postgres-data -f
