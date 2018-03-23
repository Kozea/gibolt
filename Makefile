include Makefile.config
-include Makefile.custom.config
.SILENT:

all: install serve

make-p:
	# Launch all P targets in parallel and exit as soon as one exits.
	set -m; (for p in $(P); do ($(MAKE) $$p || kill 0)& done; wait)

env:
	# Run ${RUN} with Makefile environ
	$(RUN)

fix-node-install:
	# Rebuild node-sass on updates
	test -d $(NODE_MODULES)/node-sass/vendor/ || npm rebuild node-sass

check-node-binary:
ifeq (, $(NPM))
	echo 'You must have yarn installed'
	exit 4
endif

check-python-binary:
ifeq (, $(PIPENV))
	echo 'You must have pipenv installed'
	exit 4
endif

check-python-environ:
	test -d $(PWD)/.venv || (echo "Python virtual environment not found. Creating with $(PYTHON_VERSION)..." && $(PIPENV) --python $(PYTHON_VERSION))

install-node: check-node-binary
	$(NPM) install
	$(MAKE) fix-node-install

install-node-prod: check-node-binary
	$(NPM) install --prod
	$(MAKE) fix-node-install

install-python: check-python-binary check-python-environ
	$(PIPENV) install --dev

install-python-prod: check-python-binary check-python-environ
	$(PIPENV) install --deploy

install:
	$(MAKE) P="install-node install-python" make-p

install-prod:
	$(MAKE) P="install-node-prod install-python-prod" make-p

full-install: clean-install install

upgrade-python:
	$(PIPENV) update
	$(PIPENV) lock  # Maybe remove this later

upgrade-node:
	$(NPM) upgrade-interactive --latest

upgrade: upgrade-python upgrade-node

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
	$(PIPENV) run py.test --flake8 --isort -m "flake8 or isort" lib --ignore=lib/frontend/static

lint-node:
	$(NPM) run lint

lint:
	test -s $(PWD)/Pipfile.lock || (echo 'Missing Pipfile.lock file' && exit 5)
	test -s $(PWD)/yarn.lock || (echo 'Missing yarn.lock file' && exit 6)
	$(MAKE) P="lint-python lint-node" make-p

fix-python:
	$(VENV)/bin/yapf -p -i lib/**/*.py

fix-node:
	$(NPM) run fix

fix:
	$(MAKE) P="fix-python fix-node" make-p

check-python:
	FLASK_CONFIG=$(FLASK_TEST_CONFIG) $(PIPENV) run py.test lib $(PYTEST_ARGS)

check-node-debug:
	$(NPM) run test-debug

check-node:
	$(NPM) run test

check-outdated:
	$(NPM) outdated ||:
	$(PIPENV) update --outdated ||:

check: check-python check-node check-outdated

build-client: clean-client
	$(NPM) run build-client

build-server: clean-server
	$(NPM) run build-server

build: clean
	$(MAKE) P="build-server build-client" make-p

serve-python:
	$(PIPENV) run flask run --with-threads -h $(HOST) -p $(API_PORT)

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

initdb:
	$(PIPENV) run flask dropdb
	$(VENV)/bin/alembic upgrade head

upgradedb:
	$(VENV)/bin/alembic upgrade head
