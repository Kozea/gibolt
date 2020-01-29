include config.Makefile
-include config.custom.Makefile

MAKE_CITRON_VERSION ?= v1
MAKE_CITRON_ROOT ?= https://raw.githubusercontent.com/Kozea/MakeCitron/$(MAKE_CITRON_VERSION)/
MAKE_CITRON_NAME := base.Makefile
MAKE_CITRON_URL := $(MAKE_CITRON_ROOT)$(MAKE_CITRON_NAME)

ifneq ($(MAKELEVEL), 0)
include $(MAKE_CITRON_NAME)
else
# When make 4.2 will be available on debian
# RV := $(shell wget -nv -O $(BASENAME) $(BASEROOT)$(BASENAME) 2>&1)
# ifeq (0,$(.SHELLSTATUS))
ifeq (,$(shell wget -q -N $(MAKE_CITRON_URL) || echo 'FAIL'))
include $(MAKE_CITRON_NAME)
else
ifneq (,$(wildcard $(MAKE_CITRON_NAME)))
$(warning Unable to download $(MAKE_CITRON_URL). Using current $(MAKE_CITRON_NAME).)
include $(MAKE_CITRON_NAME)
else
$(error Unable to download $(MAKE_CITRON_URL))
endif
endif

$(info $(INFO))
endif
