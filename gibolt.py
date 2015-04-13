#!/usr/bin/env python

from datetime import date

from dateutil.relativedelta import relativedelta
from flask.ext.github import GitHub, GitHubError
from flask import (
    Flask, request, session, render_template, redirect, url_for, flash)


# monkey patch to manage pagination
def patched_github_request(self, method, resource, **kwargs):
    response = self.raw_request(method, resource, **kwargs)
    status_code = str(response.status_code)
    if not status_code.startswith('2'):
        raise GitHubError(response)
    if response.headers['Content-Type'].startswith('application/json'):
        result = response.json()
        while response.links.get('next'):
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


@app.route('/')
def index():
    if session.get('user'):
        return redirect(url_for('show_now', display='year'))
    else:
        return redirect(url_for('login'))


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
    cache['users'][oauth_token] = get_allowed_repos()
    return redirect(next_url)


@app.route('/logout')
def logout():
    del session['user']
    return redirect(url_for('login'))


def get_allowed_repos():
    repos = github.get(
        'orgs/{0}/repos?type=all'.format(app.config['ORGANISATION']))
    return [repo['name'] for repo in repos]


@app.route('/refresh')
def refresh_all_milestones():
    """Refresh milstones for all repositories of the current users."""
    repo_names = cache.get('users').get(session['user'])
    for repo_name in repo_names:
        refresh_repo_milestones(repo_name)
    return redirect(url_for('show_now', display='year'))


def refresh_repo_milestones(repo_name):
    repo = {}
    url = 'repos/{0}/{1}/milestones'.format(
        app.config['ORGANISATION'], repo_name)
    repo['milestones'] = github.get(url)
    for milestone in repo['milestones']:
        if milestone['due_on'] is not None:
            milestone['due_on'] = date_from_iso(milestone['due_on'])
            milestone['repo'] = repo_name
            total = milestone['closed_issues'] + milestone['open_issues']
            milestone['progress'] = (
                milestone['closed_issues'] / (total or float('inf')))
    cache['repos'][repo_name] = repo


@app.route('/show/<display>')
def show_now(display='year'):
    today = date.today()
    start = date(today.year, today.month, 1)
    stop = start + relativedelta(months=(12 if display == 'year' else 1))
    return redirect(url_for('show', display=display, start=start, stop=stop))


@app.route('/show_month/<month_start>')
def show_month(month_start):
    stop = date_from_iso(month_start) + relativedelta(months=1)
    return redirect(url_for(
        'show', display='month', start=month_start, stop=stop))


@app.route('/show/<display>/<start>/<stop>')
def show(display, start, stop):
    display_step = (
        relativedelta(months=1) if display == 'year'
        else relativedelta(days=1))

    repos_name = cache['users'].get(session['user'])
    if repos_name is None:
        return redirect(url_for('login'))
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
