from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime
from functools import wraps

import pytz
import requests
from cachecontrol import CacheControl
from cachecontrol.caches.file_cache import FileCache
from cachecontrol.controller import CacheController
from flask import (flash, jsonify, redirect, render_template, request, session,
                   url_for)
from flask_github import GitHub, GitHubError

from .. import app
from ..utils import render_component


class GitHubController(CacheController):
    def update_cached_response(self, request, response):
        """On a 304 we will get a new set of headers that we want to
        update our cached value with, assuming we have one.

        This should only ever be called when we've sent an ETag and
        gotten a 304 as the response.
        """
        cache_url = self.cache_url(request.url)

        cached_response = self.serializer.loads(
            request,
            self.cache.get(cache_url)
        )

        if not cached_response:
            # we didn't have a cached response
            return response

        # Lets update our headers with the headers from the new request:
        # http://tools.ietf.org/html/draft-ietf-httpbis-p4-conditional-26#section-4.1
        #
        # The server isn't supposed to send headers that would make
        # the cached body invalid. But... just in case, we'll be sure
        # to strip out ones we know that might be problmatic due to
        # typical assumptions.
        # the big change is here as flask_github check for content_type we want
        # to keep the original content-type
        excluded_headers = [
            "content-length",
            "content-type",
        ]

        cached_response.headers.update(
            dict((k, v) for k, v in response.headers.items()
                 if k.lower() not in excluded_headers)
        )

        # we want a 200 b/c we have content via the cache
        cached_response.status = 200

        # update our cache
        self.cache.set(
            cache_url,
            self.serializer.dumps(request, cached_response),
        )

        return cached_response


github = GitHub(app)
github.session = CacheControl(
    requests.Session(),
    cache=FileCache('/tmp/gibolt-cache'),
    controller_class=GitHubController
)
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
    redirect = app.config['GITHUB_REDIRECT']
    return github.authorize(scope="repo", redirect_uri=redirect)


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


@app.route('/issues.json', methods=['GET', 'POST'])
@autologin
def issues():
    params = dict(request.get_json())
    url = 'search/issues'
    end_url = '?per_page=100&q=user:{0}'.format(app.config['ORGANISATION'])
    query = ''
    for value in params.pop('labels', []):
        query += '+'
        if value[0] == '-':
            query += '+-label:"{0}"'.format(value[1:])
        else:
            query += '+label:"{0}"'.format(value)
    search = params.pop('search')
    if search:
        query += "+{0}".format(search)
    for key, value in params.items():
        if value:
            query += "+{0}:{1}".format(key, value)
    # use new github api with this additional header allow to get assignees.
    headers = {'Accept': 'application/vnd.github.cerberus-preview'}
    try:
        response = github.get(
            url + end_url + query, all_pages=True, headers=headers)
    except GitHubError as e:
        message = return_github_message(e.response)
        return message
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
            try:
                executor.submit(refresh_repo_milestones, name, repo, user)
            except GitHubError:
                return GitHubError.__str__(), 403
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
                if milestone.get('due_on') and date_from_iso(
                    start) <= milestone['due_on'] < date_from_iso(stop)
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
    try:
        issues = github.get(url, all_pages=True)
    except GitHubError:
        return GitHubError.__str__(), 403
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


@app.route('/repository.json', methods=['GET', 'POST'])
@autologin
def repository():
    repository_name = request.get_json()['name']
    repository = repository = github.get('repos/{0}/{1}'.format(
        app.config['ORGANISATION'], repository_name))
    current_labels = github.get('repos/{0}/{1}/labels'.format(
        app.config['ORGANISATION'], repository_name))
    config_labels = (
        app.config.get('PRIORITY_LABELS') +
        app.config.get('ACK_LABELS') +
        app.config.get('QUALIFIER_LABELS'))
    missing_labels = []
    overly_labels = []
    for name, color in config_labels:
        if not any(d['name'] == name for d in current_labels):
            missing_labels.append((name, color))
    for label in current_labels:
        if not any(name == label['name'] for name, color in config_labels):
            overly_labels.append((label['name'], label['color']))
    return jsonify({
        'params': request.get_json(),
        'results': {
            'missingLabels': missing_labels,
            'overlyLabels': overly_labels,
            'labels': current_labels,
            'repository': repository,
        }
    })


@app.route('/repository/create_labels', methods=['POST'])
@autologin
def create_repository_labels():
    repository_name = request.get_json()['name']
    labels = request.get_json()['labels']
    created = []
    for name, color in labels:
        data = {'name': name, 'color': color}
        github.post(
            'repos/{0}/{1}/labels'.format(
                app.config.get('ORGANISATION'), repository_name),
            data=data)
        created.append(data)
    return jsonify({'params': request.get_json(), 'created': created})


@app.route('/repository/delete_labels', methods=['POST'])
@autologin
def delete_repository_labels():
    repository_name = request.get_json()['name']
    labels = request.get_json()['labels']
    deleted = []
    for name, color in labels:
        github.delete('repos/{0}/{1}/labels/{2}'.format(
            app.config.get('ORGANISATION'), repository_name, name))
        deleted.append(name)
    return jsonify({'params': request.get_json(), 'deleted': deleted})


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
    assert isinstance(users, list)
    # j'arrive pas à le faire replanté mais je pense que le problème viens du
    # de mon patch sur flask_github.py ligne 180, si on a une response,
    # c'est que le content-type n'est pa application/json alors que ça devrait
    # si une erreur se produit il faut voir ce que contient
    # users.headers['Content-Type'] et corriger la lib
    state = {
        'labels': {
            'priority': [{
                'text': text,
                'color': '#%s' % color
            } for text, color in app.config['PRIORITY_LABELS']],
            'ack': [{
                'text': text,
                'color': '#%s' % color
            } for text, color in app.config['ACK_LABELS']],
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
            'loading': True,
            'mustLoad': True,
            'error': None
        },
        'timeline': {
            'results': {
                'milestones': []
            },
            'loading': True,
            'mustLoad': True,
            'error': None
        },
        'report': {
            'results': {
                'issues': []
            },
            'loading': True,
            'mustLoad': True,
            'error': None
        },
        'repositories': {
            'results': {
                'repositories': []
            },
            'loading': True,
            'mustLoad': True,
            'error': None
        },
        'repository': {
            'results': {
                'labels': [],
                'overlyLabels': [],
                'missingLabels': [],
                'repository': {'permissions': {'push': False}},
            },
            'loading': True,
            'mustLoad': True,
            'error': None
        },
        'modifiers': {
            'ctrl': False,
            'shift': False,
            'alt': False,
        },
        'users': [user['login'] for user in users],
        'user': session['login'],
    }
    rendered = render_component(state)
    return render_template('index.jinja2', rendered=rendered, state=state)


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


def return_github_message(github_response):
    return (
        github_response.json()['message'], github_response.status_code)
