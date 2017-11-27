import pkg_resources
from flask import Flask

try:
    __version__ = pkg_resources.require("gibolt")[0].version
except pkg_resources.DistributionNotFound:
    __version__ = 'GIBOLT not installed in path'

app = Flask(__name__)
app.config.from_envvar('FLASK_CONFIG')

from .routes import *  # noqa isort:skip
