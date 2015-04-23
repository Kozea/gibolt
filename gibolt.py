#!/usr/bin/env python
from datetime import date
from functools import wraps

from dateutil.relativedelta import relativedelta
from flask.ext.github import GitHub, GitHubError
from flask import (
    Flask, request, session, render_template, redirect, url_for, flash)
import requests
from cachecontrol import CacheControl


# monkey patch to manage pagination in github-flask and use cache
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


# custom filter for order project by closed ticket
@app.template_filter('sort_by_len')
def sort_by_list_number(values, reverse=False):
    return sorted(values, key=lambda item: len(item[1]), reverse=reverse)


# custom filter for order project by closed ticket
@app.template_filter('format_date')
def format_date_filter(isodate, dateformat):
    numbers = [int(number) for number in isodate.split('-')]
    while len(numbers) < 3:
        numbers.append(1)
    return date(*numbers).strftime(dateformat)


app.secret_key = 'secret'
app.config['ORGANISATION'] = 'Kozea'
app.config['GITHUB_CLIENT_ID'] = '4891551b9540ce8c4280'
app.config['GITHUB_CLIENT_SECRET'] = 'bcfee82e06c41d22cd324b33a86c1e82a372c403'
app.config.from_envvar('GIBOLT_SETTINGS', silent=True)

github = GitHub(app)
sess = requests.session()
cached_sess = CacheControl(sess, cache_etags=False)
github.session = cached_sess
cache = {'users': {}, 'repos': {}}


def date_from_iso(iso_date):
    return date(*[int(value) for value in iso_date[:10].split('-')])


def autologin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
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
        'orgs/{0}/repos?type=all&per_page=100'.format(
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
    url = 'repos/{0}/{1}/milestones?per_page=100'.format(
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
    filters = dict(
            (key, ','.join(values)) for (key, values) in request.args.lists())
    groupby = filters.get('groupby')
    if groupby:
        del filters['groupby']

    url = 'orgs/{0}/issues'.format(
            app.config['ORGANISATION'])
    end_url = '?per_page=100&'
    query = ''
    for key, value in filters.items():
        end_url += "{0}={1}&".format(key, value)
        query += "{0}:{1} ".format(key, value)
    end_url = end_url[:-1]
    issues = github.get(url + end_url, all_pages=True)
    noned_issues = None
    opened = len([issue for issue in issues if issue['state'] == 'open'])
    closed = len([issue for issue in issues if issue['state'] == 'closed'])

    if groupby and '.' in groupby:
        first_group = groupby.split('.')[0]
        noned_issues = [issue for issue in issues if not issue[first_group]]
        issues = [issue for issue in issues if issue[first_group]]

    return render_template(
        'issues.jinja2', issues=issues, noned_issues=noned_issues,
        opened=opened, closed=closed, query=query, groupby=groupby,
        filters=filters)


@app.route('/assigned/<start>/<stop>')
@app.route('/assigned')
@autologin
def show_assigned_issues(start=None, stop=None):
    today = date.today()
    if start is None:
        start = request.args.get('start')
    if start is None:
        start = date(today.year, today.month, 1)
    else:
        start = date_from_iso(start)

    if stop is None:
        stop = request.args.get('stop')
    if stop is None:
        stop = today
    else:
        stop = date_from_iso(stop)

    since = start.strftime("%Y-%m-%dT00:00:00Z")
    url = 'orgs/{0}/issues?per_page=100&state=closed&filter=all&since={1}'\
        .format(app.config['ORGANISATION'], since)
    issues = github.get(url, all_pages=True)
    ok_issues = []
    assignees = []
    for issue in issues:
        if (issue.get('assignee') and
                start < date_from_iso(issue['closed_at']) < stop):
            issue['closed_month'] = issue['closed_at'][:7]
            issue['repository']['short_name'] = (
                    issue['repository']['full_name'].split('/')[1])
            ok_issues.append(issue)
            assignees.append(issue['assignee']['login'])
    users = set(assignees)
    return render_template('assigned_issues.jinja2', issues=ok_issues,
                           start=start, stop=stop, users=users)


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


@app.route('/issues/form_query')
@autologin
def show_form_query():
    # parse form then redirect to show issues
    return redirect(url_for('show_issues', **request.args))


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
