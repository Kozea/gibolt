HOST ?= 0.0.0.0
API_PORT ?= 1520

export FLASK_APP ?= $(PWD)/gibolt/__init__.py
export FLASK_DEBUG ?= 1
export FLASK_CONFIG ?= $(PWD)/application.cfg

# Python env
PYTHON_ONLY = 1
PIPENV ?= $(shell command -v pipenv 2> /dev/null)
VENV = $(PWD)/.venv
PYTEST = $(VENV)/bin/pytest
export PIPENV_VENV_IN_PROJECT = 1

URL_PROD = https://$(CI_PROJECT_NAME).kozea.fr/color.css
URL_PROD_API = $(URL_PROD)
URL_TEST = https://test-$(CI_PROJECT_NAME)-$(BRANCH_NAME).kozea.fr/color.css
URL_TEST_API = $(URL_TEST)
