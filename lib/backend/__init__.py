import pkg_resources
from flask import Flask
from sqlalchemy import create_engine

try:
    __version__ = pkg_resources.require("gibolt")[0].version
except pkg_resources.DistributionNotFound:
    __version__ = 'GIBOLT not installed in path'

app = Flask(__name__)
app.config.from_envvar('FLASK_CONFIG')

engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])

from .routes import *  # noqa isort:skip
from .models import Base  # noqa isort:skip


def init_db():
    Base.metadata.create_all(engine)


@app.cli.command('initdb')
def initdb_command():
    init_db()
    print('Initialized the database.')
