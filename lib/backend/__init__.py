import pkg_resources
from flask import Flask
from flask_github import GitHub
import requests
import os
from urllib.parse import urlparse

from cachecontrol import CacheControl
from cachecontrol.caches.file_cache import FileCache
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .routes.models import GitHubController

try:
    __version__ = pkg_resources.require('gibolt')[0].version
except pkg_resources.DistributionNotFound:
    __version__ = 'GIBOLT not installed in path'

app = Flask(__name__)
app.config.from_envvar('FLASK_CONFIG')

engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'],
                       connect_args={'check_same_thread': False})

github = GitHub(app)
github.session = CacheControl(
    requests.Session(),
    cache=FileCache('/tmp/gibolt-cache'),
    controller_class=GitHubController
)

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
