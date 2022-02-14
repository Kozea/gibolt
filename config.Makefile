HOST ?= 0.0.0.0
API_PORT ?= 1520

export FLASK_APP ?= $(PWD)/gibolt/__init__.py
export FLASK_DEBUG ?= 1
export FLASK_CONFIG ?= $(PWD)/application.cfg
export FLASK_TEST_CONFIG ?= $(PWD)/application.cfg

# Python env
PYTHON_ONLY = 1
PYTHON = python3.8
VENV = $(PWD)/.venv
PYTEST = $(VENV)/bin/pytest
PYTHON_SRCDIR = gibolt

URL_PROD = https://$(CI_PROJECT_NAME).kozea.fr/color.css
URL_PROD_API = $(URL_PROD)
URL_TEST = https://test-$(CI_PROJECT_NAME)-$(BRANCH_NAME).kozea.fr/color.css
URL_TEST_API = $(URL_TEST)

CI_DB ?= /var/ci/mathilde/var/borg/gibolt.db
CI_SERVER ?= mathilde
CI_USER ?= datt
LOCAL_CI_DB ?= gibolt-ci.db
