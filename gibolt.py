#!/usr/bin/env python
from collections import OrderedDict
from datetime import date, datetime
from functools import wraps
import json

from cachecontrol import CacheControl
from dateutil.relativedelta import relativedelta
from flask import (
    Flask, request, Response, session, render_template, redirect, url_for,
    flash)
from flask_github import GitHub, GitHubError
import pytz
import requests


GROUPERS = OrderedDict((
    ('', ''),
    ('assignee.logins', 'Assignee'),
    ('milestone.title', 'Milestone'),
    ('state', 'State'),
    ('repository_url', 'Project')))


# TODO: remove this when https://github.com/pallets/flask/issues/1907 is fixed
if __name__ == '__main__':
    class Flask(Flask):
        def create_jinja_environment(self):
            self.config['TEMPLATES_AUTO_RELOAD'] = True
            return super().create_jinja_environment()

app = Flask(__name__)
app.config.from_object('default_settings')
app.config.from_envvar('GIBOLT_SETTINGS', silent=True)


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
    return full_name.split('/')[-1]


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


@app.route('/login', methods=('GET', 'POST'))
def login():
    return github.authorize(scope="repo")


@github.access_token_getter
def token_getter():
    return session.get('user')


@app.route('/callback')
@github.authorized_handler
def authorized(oauth_token):
    next_url = request.args.get('next') or url_for('my_sprint')
    if oauth_token is None:
        flash("Authorization failed.")
        return redirect(next_url)
    session['user'] = oauth_token
    session['login'] = github.get('user')['login']
    return redirect(next_url)


def get_allowed_repos():
    repos = github.get(
        'orgs/{0}/repos?type=all&per_page=100'.format(
            app.config['ORGANISATION']), all_pages=True)
    return [repo['name'] for repo in repos]


@app.route('/refresh/all', methods=('POST',))
@autologin
def refresh_all():
    cache['users'][session['user']] = get_allowed_repos()
    repo_names = cache.get('users').get(session['user'])
    for repo_name in repo_names:
        refresh_repo_milestones(repo_name)
    flash('Cache is fresh as a peppermint candy')
    return redirect(url_for('show_now'))


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
    filters = {'label': 'sprint', 'state': 'all'}
    return redirect(url_for('show_issues', **filters))


@app.route('/')
@app.route('/my_sprint')
@autologin
def my_sprint():
    filters = {
        'assignee': session['login'], 'label': 'sprint', 'state': 'all',
        'groupby': 'state'}
    return redirect(url_for('show_issues', **filters))


@app.route('/')
@app.route('/my_tickets')
@autologin
def my_tickets():
    filters = {
        'involves': session['login'], 'state': 'open',
        'groupby': 'repository_url'}
    return redirect(url_for('show_issues', **filters))


@app.route('/issues')
@autologin
def show_issues():
    filters = dict(
        (key, ','.join(values)) for (key, values) in request.args.lists())
    groupby = filters.get('groupby')
    if groupby:
        del filters['groupby']
    url = 'search/issues'
    end_url = '?per_page=100&q=user:{0}'.format(app.config['ORGANISATION'])
    query = ''
    if 'complex_query' in request.args:
        query += '+' + request.args.get('complex_query')
    else:
        for (key, values) in request.args.lists():
            if key == 'state' and 'all' in values:
                continue
            if key == 'groupby':
                continue
            if key == 'simple_query':
                query += '+{0}'.format('+'.join(values))
                continue
            for value in values:
                if value:
                    query += "+{0}:{1}".format(key, value)
    # use new github api with this additional header allow to get assignees.
    headers = {'Accept': 'application/vnd.github.cerberus-preview'}
    response = github.get(
        url + end_url + query, all_pages=True, headers=headers)
    issues = response.get('items')

    for issue in issues:
        issue['opened'] = (issue.get('body').count('- [ ]') if
                           issue.get('body') else 0)
        issue['closed'] = (issue.get('body').count('- [x]') if
                           issue.get('body') else 0)
        if len(issue['assignees']) > 1:
            issue['assignee']['logins'] = "{0} and {1}".format(
                ', '.join([assignee['login'] for
                           assignee in issue['assignees']][:-1]),
                issue['assignees'][-1]['login'])
        elif issue['assignees']:
            issue['assignee']['logins'] = issue['assignees'][0]['login']

    noned_issues = []
    opened = len([issue for issue in issues if issue['state'] == 'open'])
    closed = len([issue for issue in issues if issue['state'] == 'closed'])

    if groupby and '.' in groupby:
        first_group = groupby.split('.')[0]
        noned_issues = [issue for issue in issues if not issue[first_group]]
        issues = [issue for issue in issues if issue[first_group]]

    return render_template(
        'issues.jinja2', issues=issues, noned_issues=noned_issues,
        opened=opened, closed=closed, groupby=groupby,
        filters=filters, groupers=GROUPERS)


@app.route('/apply_labels', methods=["POST"])
@autologin
def apply_labels():
    for issue_id in request.form.getlist('issues'):
        repo, number, labels = issue_id.split('$')
        labels = labels.split(',')
        priority_labels = [
            label for label, color in app.config.get('PRIORITY_LABELS')]
        if 'increment_priority' in request.form:
            current_priority = set(labels).intersection(priority_labels)
            if current_priority:
                current_priority = current_priority.pop()
            current_priority_index = priority_labels.index(current_priority)
            if current_priority_index > 0:
                labels.remove(current_priority)
                labels.append(priority_labels[current_priority_index - 1])

        elif 'delete_top_priority' in request.form:
            if priority_labels[0] in labels:
                labels.remove(priority_labels[0])

        data = json.dumps({'labels': labels})
        try:
            github.patch(
                'repos/{0}/{1}/issues/{2}'.format(
                    app.config['ORGANISATION'], repo, number),
                data=data)
        except GitHubError:
            flash("Unable to change issue {} of {}".format(number, repo))
    return redirect(request.referrer)


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


@app.route('/css/dynamic')
def dynamic_css():
    labels = (app.config.get('PRIORITY_LABELS') +
              app.config.get('QUALIFIER_LABELS'))
    return Response(render_template('dynamic_css.jinja2', labels=labels),
                    mimetype='text/css')


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


@app.route('/repositories')
@autologin
def repositories():
    app.config['ORGANISATION']
    repositories = get_allowed_repos()
    return render_template(
        'repository_list.html.jinja2', repositories=repositories)


@app.route('/repository/<string:repository_name>', methods=['GET', 'POST'])
@autologin
def repository(repository_name):
    repository = github.get('repos/{0}/{1}'.format(
        app.config['ORGANISATION'], repository_name))
    current_labels = github.get('repos/{0}/{1}/labels'.format(
        app.config['ORGANISATION'], repository_name))
    config_labels = (
        app.config.get('PRIORITY_LABELS') + app.config.get('QUALIFIER_LABELS'))
    missing_labels = []
    overly_labels = []
    for name, color in config_labels:
        if not any(d['name'] == name for d in current_labels):
            missing_labels.append((name, color))

    for label in current_labels:
        if not any(name == label['name'] for name, color in config_labels):
            overly_labels.append((label['name'], label['color']))

    if request.method == 'POST':
        if 'add_missing' in request.form:
            for name, color in missing_labels:
                data = {'name': name, 'color': color}
                github.post(
                    'repos/{0}/{1}/labels'.format(
                        app.config.get('ORGANISATION'), repository_name),
                    data=data)
        if 'delete_overly' in request.form:
            for name, color in overly_labels:
                github.delete('repos/{0}/{1}/labels/{2}'.format(
                    app.config.get('ORGANISATION'), repository_name, name))
        return redirect(url_for('repository', repository_name=repository_name))

    return render_template(
        'repository_read.html.jinja2', labels=current_labels,
        missing_labels=missing_labels, overly_labels=overly_labels,
        repository=repository)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
