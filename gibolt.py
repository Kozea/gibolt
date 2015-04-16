#!/usr/bin/env python

from datetime import date
from functools import wraps

from dateutil.relativedelta import relativedelta
from flask.ext.github import GitHub, GitHubError
from flask import (
    Flask, request, session, render_template, redirect, url_for, flash)


# monkey patch to manage pagination in github-flask
def patched_github_request(self, method, resource, all_pages=False, **kwargs):
    response = self.raw_request(method, resource, **kwargs)
    status_code = str(response.status_code)
    if not status_code.startswith('2'):
        raise GitHubError(response)
    if response.headers['Content-Type'].startswith('application/json'):
        result = response.json()
        while response.links.get('next') and all_pages:
            response = self.session.request(
                    method, response.links['next']['url'], **kwargs)
            if not status_code.startswith('2'):
                raise GitHubError(response)
            if response.headers['Content-Type'].startswith('application/json'):
                result += response.json()
            else:
                raise GitHubError(response)
        return result
    else:
        return response


GitHub.request = patched_github_request

app = Flask(__name__)
app.secret_key = 'secret'
app.config['ORGANISATION'] = 'Kozea'
app.config['GITHUB_CLIENT_ID'] = '4891551b9540ce8c4280'
app.config['GITHUB_CLIENT_SECRET'] = 'bcfee82e06c41d22cd324b33a86c1e82a372c403'
app.config.from_envvar('GIBOLT_SETTINGS', silent=True)

github = GitHub(app)
cache = {'users': {}, 'repos': {}}


def date_from_iso(iso_date):
    return date(*[int(value) for value in iso_date[:10].split('-')])


def autologin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        print('test')
        if session.get('user') is None:
            return redirect(url_for('login'))
        if cache['users'].get(session['user']) is None:
            cache['users'][session['user']] = get_allowed_repos()
        return f(*args, **kwargs)
    return decorated_function


@app.route('/')
@autologin
def index():
    return redirect(url_for('show_now', display='year'))


@app.route('/login', methods=('GET', 'POST'))
def login():
    return github.authorize(scope="repo")


@github.access_token_getter
def token_getter():
    return session.get('user')


@app.route('/callback')
@github.authorized_handler
def authorized(oauth_token):
    next_url = request.args.get('next') or url_for('index')
    if oauth_token is None:
        flash("Authorization failed.")
        return redirect(next_url)
    session['user'] = oauth_token
    return redirect(next_url)


def get_allowed_repos():
    repos = github.get(
        'orgs/{0}/repos?type=all'.format(
            app.config['ORGANISATION']), all_pages=True)
    return [repo['name'] for repo in repos]


@app.route('/refresh/all')
@autologin
def refresh_all():
    repo_names = cache.get('users').get(session['user'])
    for repo_name in repo_names:
        refresh_repo_milestones(repo_name)
    flash('cache is fresh as a peppermint candy')
    return redirect(url_for('index'))


def refresh_repo_milestones(repo_name):
    repo = {}
    url = 'repos/{0}/{1}/milestones'.format(
        app.config['ORGANISATION'], repo_name)
    repo['milestones'] = github.get(url, all_pages=True)
    for milestone in repo['milestones']:
        if milestone['due_on'] is not None:
            milestone['due_on'] = date_from_iso(milestone['due_on'])
            milestone['repo'] = repo_name
            total = milestone['closed_issues'] + milestone['open_issues']
            milestone['progress'] = (
                milestone['closed_issues'] / (total or float('inf')))
    cache['repos'][repo_name] = repo


@app.route('/issues/sprint')
@autologin
def show_sprint_issues():
    filters = {'filter': 'all', 'state': 'all', 'labels': 'sprint'}
    return redirect(url_for('show_issues', **filters))


@app.route('/issues')
@autologin
def show_issues():
    filters = request.args
    url = 'orgs/{0}/issues'.format(
            app.config['ORGANISATION'])
    end_url = '?'
    query = ''
    for key, value in filters.items():
        end_url += "{0}={1}&".format(key, value)
        query += "{0}:{1} ".format(key, value)
    end_url = end_url[:-1]
    issues = github.get(url + end_url, all_pages=True)
    opened = len([issue for issue in issues if issue['state'] == 'open'])
    closed = len([issue for issue in issues if issue['state'] == 'closed'])
    return render_template(
        'issues.jinja2', issues=issues,
        opened=opened, closed=closed, query=query)


@app.route('/issues/custom_query')
@autologin
def show_issues_query():
    # parse query to filter here
    query = request.args.get('query').strip()
    args = query.split(' ')
    filters = {}
    for arg in args:
        if ':' in arg:
            key, value = arg.split(':')
            filters[key] = value
    return redirect(url_for('show_issues', **filters))


@app.route('/stones/<display>')
@autologin
def show_now(display='year'):
    today = date.today()
    start = date(today.year, today.month, 1)
    stop = start + relativedelta(months=(12 if display == 'year' else 1))
    return redirect(url_for('show', display=display, start=start, stop=stop))


@app.route('/stones/month/<month_start>')
@autologin
def show_month(month_start):
    stop = date_from_iso(month_start) + relativedelta(months=1)
    return redirect(url_for(
        'show', display='month', start=month_start, stop=stop))


@app.route('/stones/<display>/<start>/<stop>')
@autologin
def show(display, start, stop):
    display_step = (
        relativedelta(months=1) if display == 'year'
        else relativedelta(days=1))

    repos_name = cache['users'].get(session['user'])
    milestones = []
    for name in repos_name:
        if name not in cache.get('repos'):
            refresh_repo_milestones(name)
        milestones += cache.get('repos').get(name).get('milestones')
    stones = get_stones_by_step(
        milestones, date_from_iso(start), date_from_iso(stop), display_step)
    return render_template(
        '{0}.jinja2'.format(display), start=date_from_iso(start),
        stones_by_step=stones)


def get_stones_by_step(all_stones, start, end, step):
    current = start
    result = []
    while current < end:
        stones = [
            stone for stone in all_stones
            if stone['due_on'] and current <= stone['due_on'] < current + step]
        result.append((current, stones))
        current += step
    return result


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
