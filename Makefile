include MakeCitron.Makefile


install-db: ## install-db: Install gibolt database
	$(LOG)
	$(PYTHON_BINDIR)/flask dropdb
	$(PYTHON_BINDIR)/alembic upgrade head

upgrade-db: ## upgrade-db: Upgrade gibolt database
	$(LOG)
	$(PYTHON_BINDIR)/alembic upgrade head

lint-python: ## lint-python: Lint python source
	$(LOG)
	py.test --flake8 --isort -m "flake8 or isort" gibolt

check-python: ## check-python: Run python tests
	$(LOG)
	FLASK_CONFIG=$(FLASK_TEST_CONFIG) py.test gibolt $(PYTEST_ARGS)
