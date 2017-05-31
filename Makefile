include Makefile.config

all: install serve

install-node:
	$(NPM) install

# https://github.com/pypa/setuptools/issues/951
install-python:
	test -d $(VENV) || virtualenv $(VENV)
	$(PIP) install --upgrade --no-cache pip setuptools -e .[test]

install: install-node install-python

clean:
	rm -fr dist

clean-install: clean
	rm -fr $(NODE_MODULES)
	rm -fr $(VENV)

lint-python:
	$(PYTEST) --flake8 -m flake8 $(PROJECT_NAME)
	$(PYTEST) --isort -m isort $(PROJECT_NAME)

lint-node:
	$(NPM) run lint

lint: lint-python lint-node

check-python:
	$(PYTEST) $(PROJECT_NAME)

check-node:
	$(NPM) run test

check: check-python check-node

build-node: clean lint-node
	NODE_ENV=production $(NPM) run build

build: build-node

serve-python:
	$(FLASK) run

serve-static:
	$(NPM) run static-server

serve-renderer:
	$(NPM) run render-server

serve-production:
	$(NPM) run render-server-production

build-check:
	set -m; ((STATIC_SERVER= $(FLASK) run -h $(HOST) -p $(PYTHON_PORT); kill 0)& ($(NPM) run render-server; kill 0)& wait)

serve:
	test -d $(NODE_MODULES) || (echo 'Please run make install before serving.' && exit 1)
	set -m; (($(FLASK) run -h $(HOST) -p $(PYTHON_PORT); kill 0)& ($(NPM) run static-server; kill 0)& ($(NPM) run render-server; kill 0)& wait)
