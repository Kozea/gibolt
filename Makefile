include MakeCitron.Makefile


install-db: ## install-db: Install gibolt database
	$(LOG)
	$(PIPENV) run flask dropdb
	$(PIPENV) run alembic upgrade head

upgrade-db: ## upgrade-db: Upgrade gibolt database
	$(LOG)
	$(PIPENV) run alembic upgrade head
