#!/usr/bin/env python
from collections import OrderedDict
from datetime import date, datetime
from functools import wraps
import json

import pytz
from dateutil.relativedelta import relativedelta
from flask.ext.github import GitHub
from flask import (
    Flask, request, session, render_template, redirect, url_for, flash)
import requests
from cachecontrol import CacheControl


GROUPERS = OrderedDict((
    ('', ''),
    ('assignee.login', 'Assignee'),
    ('milestone.title', 'Milestone'),
    ('state', 'State'),
    ('repository.full_name', 'Project')))


app = Flask(__name__)
app.secret_key = 'secret'
app.config['ORGANISATION'] = 'Kozea'
app.config['GITHUB_CLIENT_ID'] = '4891551b9540ce8c4280'
app.config['GITHUB_CLIENT_SECRET'] = 'bcfee82e06c41d22cd324b33a86c1e82a372c403'
app.config.from_envvar('GIBOLT_SETTINGS', silent=True)
app.config['TIMEZONE'] = 'Europe/Paris'


@app.template_filter('sort_by_len')
def sort_by_len(values, reverse=False):
    """Sort the ``values`` list by the length of its second item.```"""
    return sorted(values, key=lambda item: len(item[1]), reverse=reverse)


@app.template_filter('format_date')
def format_date_filter(isodate, dateformat):
    """Transform an ISO-date to a string following ``dateformat``."""
    numbers = [int(number) for number in isodate.split('-')]
    while len(numbers) < 3:
        numbers.append(1)
    return date(*numbers).strftime(dateformat)


@app.template_filter('short_name')
def short_name(full_name):
    """Split a full name after a slash to display only the projet name."""
    return full_name.split('/')[1]


@app.template_filter('text_color')
def text_color(color):
    """Return 'black' if the color is light, else 'white'."""
    red, green, blue = [
        int(value, base=16) for value in (color[:2], color[2:4], color[4:])]
    if red * .2989 + green * .5870 + blue * 0.1140 > 128:
        return 'black'
    else:
        return 'white'


github = GitHub(app)
github.session = CacheControl(requests.session(), cache_etags=False)
cache = {'users': {}, 'repos': {}}


def date_from_iso(iso_date):
    if len(iso_date) > 10:
        localzone = pytz.timezone(app.config['TIMEZONE'])
        utczone = pytz.timezone('Etc/UTC')
        absolutedate = utczone.localize(
            datetime.strptime(iso_date, '%Y-%m-%dT%H:%M:%SZ'))
        localdate = absolutedate.astimezone(localzone)
        return localdate.date()
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
    cache['users'][session['user']] = get_allowed_repos()
    repo_names = cache.get('users').get(session['user'])
    for repo_name in repo_names:
        refresh_repo_milestones(repo_name)
    flash('cache is fresh as a peppermint candy')
    return redirect(url_for('index'))


def refresh_repo_milestones(repo_name):
    repo = {}
    url = 'repos/{0}/{1}/milestones?state=all&per_page=100'.format(
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

    for issue in issues:
        issue['opened'] = issue.get('body', '').count('- [ ]')
        issue['closed'] = issue.get('body', '').count('- [x]')

    noned_issues = []
    opened = len([issue for issue in issues if issue['state'] == 'open'])
    closed = len([issue for issue in issues if issue['state'] == 'closed'])

    if groupby and '.' in groupby:
        first_group = groupby.split('.')[0]
        noned_issues = [issue for issue in issues if not issue[first_group]]
        issues = [issue for issue in issues if issue[first_group]]

    return render_template(
        'issues.jinja2', issues=issues, noned_issues=noned_issues,
        opened=opened, closed=closed, query=query, groupby=groupby,
        filters=filters, groupers=GROUPERS)


@app.route('/apply_labels', methods=["POST"])
@autologin
def apply_labels():
    for issue_id in request.form.getlist('issues'):
        repo, number, labels = issue_id.split('$')
        labels = labels.split(',')
        if 'next_to_sprint' in request.form:
            if 'next' in labels:
                labels.remove('next')
            if 'sprint' not in labels:
                labels.append('sprint')
        elif 'delete_sprint' in request.form:
            if 'sprint' in labels:
                labels.remove('sprint')
        elif 'add_next' in request.form:
            if 'next' not in labels:
                labels.append('next')

        data = json.dumps({'labels': labels})
        res = github.patch(
            'repos/{0}/{1}/issues/{2}'.format(
                app.config['ORGANISATION'], repo, number),
            data=data)
        print(res)
    return redirect(url_for('show_issues_query',
                            query=request.form.get('query')))


@app.route('/assigned/<start>/<stop>')
@app.route('/assigned')
@autologin
def show_assigned_issues(start=None, stop=None):
    today = date.today()

    start = start or request.args.get('start')
    start = date_from_iso(start) if start else date(today.year, today.month, 1)
    stop = stop or request.args.get('stop')
    stop = date_from_iso(stop) if stop else today

    since = start.strftime('%Y-%m-%dT00:00:00Z')
    url = (
        'orgs/{0}/issues?per_page=100&state=closed&filter=all&since={1}'
        .format(app.config['ORGANISATION'], since))
    issues = github.get(url, all_pages=True)
    ok_issues = []
    assignees = []
    for issue in issues:
        if (issue.get('assignee') and
                start < date_from_iso(issue['closed_at']) < stop):
            issue['closed_month'] = issue['closed_at'][:7]
            ok_issues.append(issue)
            assignees.append(issue['assignee']['login'])
    return render_template(
        'assigned_issues.jinja2', issues=ok_issues, start=start, stop=stop,
        users=set(assignees))


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


@app.route('/stones')
@autologin
def show_now():
    today = date.today()
    start = date(today.year, today.month, 1) + relativedelta(months=-1)
    stop = start + relativedelta(months=12)
    return redirect(url_for('show', start=start, stop=stop))


@app.route('/stones/<start>/<stop>')
@autologin
def show(start, stop):
    repos_name = cache['users'].get(session['user'])
    milestones = []
    for name in repos_name:
        if name not in cache.get('repos'):
            refresh_repo_milestones(name)
        milestones += cache.get('repos').get(name).get('milestones')
    stones = get_stones_by_step(
        milestones, date_from_iso(start), date_from_iso(stop),
        relativedelta(months=1))
    return render_template(
        'stones.jinja2', start=date_from_iso(start), stones_by_step=stones)


@app.route('/sprint/next_to_sprint')
@autologin
def next_to_sprint():
    pass


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
