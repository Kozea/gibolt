import pkg_resources
from flask import Flask
from flask_github import GitHub
import os
import requests
from urllib.parse import urlparse

from cachecontrol import CacheControlAdapter
from cachecontrol.caches.file_cache import FileCache
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .utils.customCacheControl.github_controller import GitHubController
from .utils.customCacheControl.heuristic import ZeroSecondsHeuristic

try:
    __version__ = pkg_resources.require('gibolt')[0].version
except pkg_resources.DistributionNotFound:
    __version__ = 'GIBOLT not installed in path'

app = Flask(__name__)
app.config.from_envvar('FLASK_CONFIG')

engine = create_engine(
    app.config['SQLALCHEMY_DATABASE_URI'],
    connect_args={
        'check_same_thread': False
    }
)

github = GitHub(app)
file_cache = FileCache('/tmp/gibolt-cache')
adapter = CacheControlAdapter(
    cache=file_cache, controller_class=GitHubController
)
custom_adapter = CacheControlAdapter(
    heuristic=ZeroSecondsHeuristic(),
    cache=file_cache,
    controller_class=GitHubController
)
github.session = requests.Session()
github.session.mount('http://', adapter)
github.session.mount('https://', adapter)
# CacheControl always verifies the cache freshness before ETag
# To ensure data for repos are always up to date compared to Github,
# the cache freshness is defined to 0 by a custom caching strategy
github.session.mount('https://api.github.com/repos/', custom_adapter)

Session = sessionmaker(bind=engine, autoflush=False)
Session.configure(bind=engine)
session_unrest = Session()

from .api.gibolt import *  # noqa isort:skip
from .routes.auth import *  # noqa isort:skip
from .routes.github import *  # noqa isort:skip


@app.cli.command()
def dropdb():
    filename = urlparse(app.config['SQLALCHEMY_DATABASE_URI']).path[1:]
    if os.path.isfile(filename):
        os.remove(filename)
