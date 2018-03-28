include config.Makefile
-include config.custom.Makefile

BASEVERSION ?= v1
BASEROOT ?= https://raw.githubusercontent.com/Kozea/MakeCitron/$(BASEVERSION)/
BASENAME = base.Makefile
ifeq ($(MAKELEVEL), 0)
include $(shell wget -q -O $(BASENAME) $(BASEROOT)$(BASENAME) && echo $(BASENAME))
$(info $(INFO))
else
include $(BASENAME)
endif


install-db: ## install-db: Install gibolt database
	$(LOG)
	$(PIPENV) run flask dropdb
	$(PIPENV) run alembic upgrade head

upgrade-db: ## upgrade-db: Upgrade gibolt database
	$(LOG)
	$(PIPENV) run alembic upgrade head
