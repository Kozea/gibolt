from functools import wraps

from flask import abort, flash, redirect, session

from .. import app, github

cache = {'users': {}}


def needlogin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get('user') is None:
            abort(403)
        if cache['users'].get(session['user']) is None:
            cache['users'][session['user']] = get_allowed_repos()
        return f(*args, **kwargs)

    return decorated_function


@app.route('/api/login', methods=('GET', 'POST'))
def login():
    redirect = app.config['GITHUB_REDIRECT']
    return github.authorize(scope='repo', redirect_uri=redirect)


@github.access_token_getter
def token_getter():
    return session.get('user')


@app.route('/api/callback')
@github.authorized_handler
def authorized(oauth_token):
    if oauth_token is None:
        flash('Authorization failed.')
        return redirect('/oauth_error')
    session['user'] = oauth_token
    session['login'] = github.get('user')['login']
    return redirect('/')


def get_allowed_repos():
    repos = github.get(
        'orgs/{0}/repos?type=all&per_page=100'.format(
            app.config['ORGANISATION']
        ),
        all_pages=True
    )
    return [repo['name'] for repo in repos]
