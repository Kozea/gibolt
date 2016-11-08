import os

import pkg_resources
from flask import Flask


__version__ = pkg_resources.require("gibolt")[0].version


# TODO: remove this when https://github.com/pallets/flask/issues/1907 is fixed
# class Flask(Flask):
#     def create_jinja_environment(self):
#         self.config['TEMPLATES_AUTO_RELOAD'] = True
#         return super().create_jinja_environment()


app = Flask(__name__)
app.config.from_pyfile(os.getenv('FLASK_CONFIG'))
app.config.from_envvar('GIBOLT_SETTINGS', silent=True)

app.config['RENDER_SERVER'] = os.getenv('RENDER_SERVER')
app.config['STATIC_SERVER'] = os.getenv('STATIC_SERVER')


app.static_folder = os.path.join(
    os.path.dirname(__file__), '..', 'frontend', 'static')

from .routes import *  # noqa
