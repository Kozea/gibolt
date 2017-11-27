include Makefile.config
-include Makefile.custom.config
.SILENT:

all: install serve

make-p:
	# Launch all P targets in parallel and exit as soon as one exits.
	set -m; (for p in $(P); do ($(MAKE) $$p || kill 0)& done; wait)

env:
	# Run $RUN with Makefile environ
	$(RUN)

fix-node-install:
	# Rebuild node-sass on updates
	test -d $(NODE_MODULES)/node-sass/vendor/ || npm rebuild node-sass

install-node:
	$(NPM) install
	$(MAKE) fix-node-install

install-python:
	test -d $(VENV) || virtualenv $(VENV) -p $(PYTHON_VERSION)
	# Deps
	$(PIP) install --trusted-host github.com --upgrade --no-cache pip setuptools -e .[test]

install:
	$(MAKE) P="install-node install-python" make-p

install-dev:
	$(PIP) install --upgrade devcore

full-install: clean-install install install-dev

clean-client:
	rm -fr $(PWD)/lib/frontend/assets/*

clean-server:
	rm -fr dist

clean: clean-client clean-server

clean-install: clean
	rm -fr $(NODE_MODULES)
	rm -fr $(VENV)
	rm -fr *.egg-info

lint-python:
	$(PYTEST) --flake8 --isort -m "flake8 or isort" lib --ignore=lib/frontend/static

lint-node:
	$(NPM) run lint

lint:
	$(MAKE) P="lint-python lint-node" make-p

fix-python:
	$(VENV)/bin/yapf -p -i lib/**/*.py

fix-node:
	$(NPM) run fix

fix:
	$(MAKE) P="fix-python fix-node" make-p

check-python:
	FLASK_CONFIG=$(FLASK_TEST_CONFIG) $(PYTEST) lib $(PYTEST_ARGS)

check-node-debug:
	$(NPM) run test-debug

check-node:
	$(NPM) run test

check-outdated:
	$(NPM) outdated ||:
	$(PIP) list --outdated --format=columns ||:

check: check-python check-node check-outdated

build-client: clean-client
	$(NPM) run build-client

build-server: clean-server
	$(NPM) run build-server

build: clean lint-node
	$(MAKE) P="build-server build-client" make-p

serve-python:
	$(FLASK) run --with-threads -h $(HOST) -p $(API_PORT)

serve-node:
	$(NPM) run serve

serve-node-server:
	$(NPM) run serve-server

serve-node-client:
	$(NPM) run serve-client

env-check:
	test -d $(NODE_MODULES) || (echo 'Please run make install before serving.' && exit 1)

run:
	FLASK_DEBUG=0 MOCK_NGINX=y $(MAKE) P="serve-python serve-node" make-p

serve: env-check clean
	$(MAKE) P="serve-node-client serve-node-server serve-python" make-p
