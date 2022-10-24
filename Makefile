include MakeCitron.Makefile


install-db: ## install-db: Install gibolt database
	$(LOG)
	$(PYTHON_BINDIR)/flask dropdb
	$(PYTHON_BINDIR)/alembic upgrade head

upgrade-db: ## upgrade-db: Upgrade gibolt database
	$(LOG)
	$(PYTHON_BINDIR)/alembic upgrade head

$(LOCAL_CI_DB):
	$(LOG)
	rsync --rsync-path="sudo -u $(CI_USER) rsync" --progress \
		$(CI_SERVER):$(CI_DB) \
		$(LOCAL_CI_DB)
