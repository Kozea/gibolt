import json
from collections import OrderedDict
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime
from functools import wraps

import requests
from dateutil.relativedelta import relativedelta
from flask import (
    Response, flash, redirect, render_template, request, session, url_for,
    jsonify)

import pytz
from cachecontrol import CacheControl
from flask_github import GitHub, GitHubError
from ..utils import render_component
from .. import app

GROUPERS = OrderedDict((
    ('', ''),
    ('assignee.logins', 'Assignee'),
    ('milestone.title', 'Milestone'),
    ('state', 'State'),
    ('repository_url', 'Project')))


@app.template_filter('sort_by_len')
def sort_by_len(values, reverse=False):
    """Sort the ``values`` list by the length of its second item."""
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
github.session = CacheControl(requests.session())
cache = {'users': {}}


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
    next_url = request.args.get('next') or url_for('index')
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


@app.route('/gibols/sprint')
@autologin
def show_sprint_s():
    filters = {'priority': 'sprint', 'state': 'all'}
    return redirect(url_for('show_issues', **filters))


@app.route('/issues.json', methods=['GET', 'POST'])
@autologin
def issues():
    params = dict(request.get_json())
    url = 'search/issues'
    end_url = '?per_page=100&q=user:{0}'.format(app.config['ORGANISATION'])
    query = ''
    for value in params.pop('labels', []):
        query += "+label:{0}".format(value)
    search = params.pop('search')
    if search:
        query += "+{0}".format(search)
    for key, value in params.items():
        if value:
            query += "+{0}:{1}".format(key, value)
    # use new github api with this additional header allow to get assignees.
    headers = {'Accept': 'application/vnd.github.cerberus-preview'}
    response = github.get(
        url + end_url + query, all_pages=True, headers=headers)
    issues = response.get('items')
    for issue in issues:
        issue['selected'] = False
        issue['expanded'] = False
    return jsonify({
        'params': request.get_json(),
        'results': {
            'issues': issues
        }
    })


@app.route('/timeline.json', methods=['GET', 'POST'])
@autologin
def timeline():
    params = dict(request.get_json())
    repos_name = cache['users'].get(session['user'])
    repos = []
    milestones = []
    user = session.get('user')
    start = params.get('start')
    stop = params.get('stop')
    with ThreadPoolExecutor(max_workers=50) as executor:
        for name in repos_name:
            repo = {}
            repos.append(repo)
            executor.submit(refresh_repo_milestones, name, repo, user)
    for repo in repos:
        milestones.extend(repo.get('milestones', []))

    def milestoneDateToIso(milestone):
        if milestone.get('due_on'):
            milestone['due_on'] = milestone['due_on'].isoformat()
        return milestone

    return jsonify({
        'params': request.get_json(),
        'results': {
            'milestones': [
                milestoneDateToIso(milestone) for milestone in milestones
                if milestone.get('due_on') and
                date_from_iso(start) <= milestone['due_on'] < date_from_iso(stop)
            ]
        }
    })


@app.route('/report.json', methods=['GET', 'POST'])
@autologin
def report():
    params = dict(request.get_json())
    start = params.get('start')
    stop = params.get('stop')
    start = date_from_iso(start)
    stop = date_from_iso(stop)

    since = start.strftime('%Y-%m-%dT00:00:00Z')
    url = (
        'orgs/{0}/issues?per_page=100&state=closed&filter=all&since={1}'
        .format(app.config['ORGANISATION'], since))
    issues = github.get(url, all_pages=True)
    ok_issues = []
    # assignees = []
    for issue in issues:
        if (issue.get('assignee') and
                start < date_from_iso(issue['closed_at']) < stop):
            ok_issues.append(issue)
            # assignees.append(issue['assignee']['login'])
    return jsonify({
        'params': request.get_json(),
        'results': {
            'issues': ok_issues
        }
    })


@app.route('/repositories.json', methods=['GET', 'POST'])
@autologin
def repositories():
    app.config['ORGANISATION']
    return jsonify({
        'params': request.get_json(),
        'results': {
            'repositories': get_allowed_repos()
        }
    })


@app.route('/users.json', methods=['GET', 'POST'])
@autologin
def users():
    url = 'orgs/{0}/members'.format(app.config['ORGANISATION'])
    response = github.get(url, all_pages=True)
    return jsonify(response)


@app.route('/')
@app.route('/<path:path>')
@autologin
def index(path=None):
    url = 'orgs/{0}/members'.format(app.config['ORGANISATION'])
    users = github.get(url, all_pages=True)

    state = {
        'labels': {
            'priority': [{
                'text': text,
                'color': '#%s' % color
            } for text, color in app.config['PRIORITY_LABELS']],
            'qualifier': [{
                'text': text,
                'color': '#%s' % color
            } for text, color in app.config['QUALIFIER_LABELS']]
        },
        'search': '',
        'issues': {
            'results': {
                'issues': []
            },
            'loading': False,
            'mustLoad': True,
            'error': None
        },
        'timeline': {
            'results': {
                'milestones': []
            },
            'loading': False,
            'mustLoad': True,
            'error': None
        },
        'report': {
            'results': {
                'issues': []
            },
            'loading': False,
            'mustLoad': True,
            'error': None
        },
        'repositories': {
            'results': {
                'repositories': []
            },
            'loading': False,
            'mustLoad': True,
            'error': None
        },
        'users': [user['login'] for user in users],
        'user': session['login'],
    }
    rendered = render_component(state)
    return render_template('index.jinja2', rendered=rendered, state=state)


@app.route('/my_tickets')
@autologin
def my_tickets():
    filters = {
        'involves': session['login'], 'state': 'open',
        'groupby': 'repository_url'}
    return redirect(url_for('show_issues', **filters))


@app.route('/apply_labels', methods=["POST"])
@autologin
def apply_labels():
    action = request.get_json().get('action')
    patched_issues = []
    for issue in request.get_json().get('issues'):
        labels = [label['name'] for label in issue['labels']]
        priority_labels = [
            label for label, color in app.config.get('PRIORITY_LABELS')]
        if action == 'increment':
            current_priority = set(labels).intersection(priority_labels)
            if current_priority:
                current_priority = current_priority.pop()
            current_priority_index = priority_labels.index(current_priority)
            if current_priority_index > 0:
                labels.remove(current_priority)
                labels.append(priority_labels[current_priority_index - 1])
        elif action == 'removeTop':
            if priority_labels[0] in labels:
                labels.remove(priority_labels[0])
        try:
            patched_issues.append(
                github.patch(issue['url'], data={'labels': labels}))
        except GitHubError:
            issue['error'] = 'githubError'
            patched_issues.append(issue)
    return jsonify(patched_issues)

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


def refresh_repo_milestones(repo_name, repo, access_token):
    url = 'repos/{0}/{1}/milestones?state=all&per_page=100'.format(
        app.config['ORGANISATION'], repo_name)
    repo['milestones'] = github.get(url, access_token=access_token)
    for milestone in repo['milestones']:
        if milestone['due_on'] is not None:
            milestone['due_on'] = date_from_iso(milestone['due_on'])
            milestone['repo'] = repo_name
            total = milestone['closed_issues'] + milestone['open_issues']
            milestone['progress'] = (
                milestone['closed_issues'] / (total or float('inf')))



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
