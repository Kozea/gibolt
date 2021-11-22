include MakeCitron.Makefile


install-db: ## install-db: Install gibolt database
	$(LOG)
	$(PYTHON_BINDIR)/flask dropdb
	$(PYTHON_BINDIR)/alembic upgrade head

upgrade-db: ## upgrade-db: Upgrade gibolt database
	$(LOG)
	$(PYTHON_BINDIR)/alembic upgrade head

install-db-from-ci: $(LOCAL_CI_DB) ## install-db-from-ci: Fetch DB backup from CI and install it
	$(LOG)
	dropdb -U postgres teepy
	createdb -U postgres -T template0 -O teepy teepy
	pg_restore -U postgres -d teepy -F c teepy-ci.custom

$(LOCAL_CI_DB):
	$(LOG)
	rsync --rsync-path="sudo -u $(CI_USER) rsync" --progress \
		$(CI_SERVER):$(CI_DB) \
		$(LOCAL_CI_DB)
