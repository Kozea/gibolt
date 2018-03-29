include config.Makefile
-include config.custom.Makefile

BASEVERSION ?= v1
BASEROOT ?= https://raw.githubusercontent.com/Kozea/MakeCitron/$(BASEVERSION)/
BASENAME := base.Makefile
ifeq ($(MAKELEVEL), 0)
RV := $(shell wget -nv -O $(BASENAME) $(BASEROOT)$(BASENAME) 2>&1)
ifeq (0,$(.SHELLSTATUS))
include $(BASENAME)
else
$(error Unable to download $(BASEROOT)$(BASENAME): $(RV))
endif
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
