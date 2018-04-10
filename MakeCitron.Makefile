include config.Makefile
-include config.custom.Makefile

MAKE_CITRON_VERSION ?= v1
MAKE_CITRON_ROOT ?= https://raw.githubusercontent.com/Kozea/MakeCitron/$(MAKE_CITRON_VERSION)/
MAKE_CITRON_NAME := base.Makefile

ifeq ($(MAKELEVEL), 0)
# When make 4.2 will be available on debian
# RV := $(shell wget -nv -O $(BASENAME) $(BASEROOT)$(BASENAME) 2>&1)
# ifeq (0,$(.SHELLSTATUS))
RV := $(shell wget -N -q -O $(MAKE_CITRON_NAME) $(MAKE_CITRON_ROOT)$(MAKE_CITRON_NAME) || echo 'FAIL')
ifeq (,$(RV))
include $(MAKE_CITRON_NAME)
else
$(error Unable to download $(MAKE_CITRON_ROOT)$(MAKE_CITRON_NAME))
endif
$(info $(INFO))
else
include $(MAKE_CITRON_NAME)
endif
