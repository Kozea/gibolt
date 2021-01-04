import os
from datetime import datetime
from urllib.parse import urlparse

from flask import Flask
from flask_github import GitHub
from markdown2 import markdown as from_markdown
from markupsafe import Markup
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

app = Flask(__name__)
app.config.from_envvar("FLASK_CONFIG")

if app.config.get("DEBUG"):  # pragma: no cover
    from sassutils.wsgi import SassMiddleware

    app.wsgi_app = SassMiddleware(
        app.wsgi_app,
        {
            "gibolt": {
                "sass_path": "static/sass",
                "css_path": "static/css",
                "wsgi_path": "/static/css",
                "strip_extension": True,
            }
        },
    )


engine = create_engine(
    app.config["SQLALCHEMY_DATABASE_URI"],
    connect_args={"check_same_thread": False},
)

github = GitHub(app)

db = sessionmaker(bind=engine, autoflush=False)()

from . import routes  # noqa isort:skip


@app.cli.command()
def dropdb():
    filename = urlparse(app.config["SQLALCHEMY_DATABASE_URI"]).path[1:]
    if os.path.isfile(filename):
        os.remove(filename)


@app.template_filter()
def month(month_string):
    return datetime.strptime(month_string, "%Y-%m").strftime("%B %Y")


@app.template_filter()
def day(day_string):
    return datetime.strptime(day_string[:10], "%Y-%m-%d").strftime("%d %b %Y")


@app.template_filter()
def markdown(markdown_string):
    return Markup(from_markdown(markdown_string or ""))


@app.template_filter()
def indicator(value):
    if value is None:
        return
    value = float(value)
    if abs(round(value) - value) < 0.001:
        return int(value)
    else:
        return round(value, 2)
