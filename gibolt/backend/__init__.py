import os

import pkg_resources
from flask import Flask

try:
    __version__ = pkg_resources.require("gibolt")[0].version
except pkg_resources.DistributionNotFound:
    __version__ = 'GIBOLT not installed in path'


app = Flask(__name__)
app.config.from_envvar('FLASK_CONFIG')

app.config['RENDER_SERVER'] = os.getenv('RENDER_SERVER')
app.config['STATIC_SERVER'] = os.getenv('STATIC_SERVER')


app.static_folder = os.path.join(
    os.path.dirname(__file__), '..', 'frontend', 'static')

from .routes import *  # noqa
