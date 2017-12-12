import json
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime
from functools import wraps

import pytz
import requests
from cachecontrol import CacheControl
from cachecontrol.caches.file_cache import FileCache
from cachecontrol.controller import CacheController
from flask import abort, flash, jsonify, redirect, request, session
from flask_github import GitHub, GitHubError
from sqlalchemy import (Column, DateTime, ForeignKey, Integer, String,
                        create_engine)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from unrest import UnRest

from .. import app


engine = create_engine('sqlite:///database.db', echo=True)
Base = declarative_base()


class GitHubController(CacheController):
    def update_cached_response(self, request, response):
        """On a 304 we will get a new set of headers that we want to
        update our cached value with, assuming we have one.

        This should only ever be called when we've sent an ETag and
        gotten a 304 as the response.
        """
        cache_url = self.cache_url(request.url)

        cached_response = self.serializer.loads(
            request, self.cache.get(cache_url)
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
            datetime.strptime(iso_date, '%Y-%m-%dT%H:%M:%SZ')
        )
        localdate = absolutedate.astimezone(localzone)
        return localdate.date()
    return date(*[int(value) for value in iso_date[:10].split('-')])


def init_db():
    Base.metadata.create_all(engine)


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
    return github.authorize(scope="repo", redirect_uri=redirect)


@github.access_token_getter
def token_getter():
    return session.get('user')


@app.cli.command('initdb')
def initdb_command():
    init_db()
    print('Initialized the database.')


@app.route('/api/callback')
@github.authorized_handler
def authorized(oauth_token):
    if oauth_token is None:
        flash("Authorization failed.")
        return redirect('/oauth_error')
    session['user'] = oauth_token
    session['login'] = github.get('user')['login']
    return redirect('/')


class Circle(Base):
    __tablename__ = 'circle'
    circle_id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        nullable=False)
    circle_name = Column(String, unique=True)
    circle_purpose = Column(String)
    circle_domain = Column(String)
    circle_accountabilities = Column(String)


class Role(Base):
    __tablename__ = 'role'
    role_id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        nullable=False)
    user_id = Column(Integer)
    circle_id = Column(
        String,
        ForeignKey("circle.circle_id"))
    role_name = Column(String)
    role_purpose = Column(String)
    role_domain = Column(String)
    role_accountabilities = Column(String)
    role_checklist = Column(String)
    circle = relationship(Circle, backref='roles')


class Report(Base):
    __tablename__ = 'report'
    report_id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        nullable=True)
    circle_id = Column(
        String,
        ForeignKey("circle.circle_id"))
    type = Column(String)
    created_at = Column(DateTime)


Session = sessionmaker(bind=engine, autoflush=False)
Session.configure(bind=engine)
session_unrest = Session()

# Declare rest endpoints for gibolt Database

rest = UnRest(app, session_unrest)
rest(
    Circle,
    methods=['GET', 'PUT', 'POST', 'DELETE'],
    relationships={
        'roles': rest(Role, only=['role_id']),
    },
    name='circles'
)
rest(Role, methods=['GET', 'PUT', 'POST', 'DELETE'], name='roles')
rest(Report, methods=['GET', 'PUT', 'POST', 'DELETE'], name='reports')


def get_allowed_repos():
    repos = github.get(
        'orgs/{0}/repos?type=all&per_page=100'.format(
            app.config['ORGANISATION']
        ),
        all_pages=True
    )
    return [repo['name'] for repo in repos]


@app.route('/api/repos', methods=['GET'])
@needlogin
def list_repos():
    repo_request = github.get(
        'orgs/{0}/repos?type=all&per_page=100'.format(
            app.config['ORGANISATION']), all_pages=True)
    response = [{'repo_id': repository['id'], 'repo_name': repository['name'],
                 'description': repository['description'],
                 'permissions':{
                     'admin': repository['permissions']['admin'],
                     'push': repository['permissions']['push'],
                     'pull': repository['permissions']['pull']}
                 }
                for repository in repo_request]
    # objects = {'objects': response, 'occurences': len(response)}
    objects = {'objects': {
        'repositories': response},
        'occurences': len(response)
    }
    return jsonify(objects)


@app.route('/api/repos/<string:repo_name>', methods=['GET'])
@needlogin
def get_a_repo(repo_name):
    repo_request = github.get(
        'repos/{0}/{1}?type=all&per_page=100'.format(
            app.config['ORGANISATION'], repo_name), all_pages=True)
    response = {
        'repo_id': repo_request['id'],
        'repo_name': repo_request['name'],
        'description': repo_request['description'],
        'permissions': {
            'admin': repo_request['permissions']['admin'],
            'push': repo_request['permissions']['push'],
            'pull': repo_request['permissions']['pull']}}
    objects = {
        'objects': response,
        'occurences': 1 if response else 0,
        'primary_keys': [repo_name]}
    return jsonify(objects)


@app.route('/api/repos/<string:repo_name>/milestones', methods=['GET'])
@needlogin
def list_milestones(repo_name):
    milestone_request = github.get(
        'repos/{0}/{1}/milestones?type=all&per_page=100'.format(
            app.config['ORGANISATION'], repo_name), all_pages=True)
    response = [{'milestone_number': milestone['number'],
                 'repo_name': repo_name,
                 'milestone_id': milestone['id'],
                 'milestone_title': milestone['title'],
                 'description': milestone['description'],
                 'html_url':milestone['html_url'],
                 'open_issues': milestone['open_issues'],
                 'closed_issues': milestone['closed_issues'],
                 'state': milestone['state'],
                 'updated_at': milestone['updated_at'],
                 'due_on': milestone['due_on'],
                 'closed_at': milestone['closed_at']}
                for milestone in milestone_request]
    objects = {'objects': response, 'occurences': len(response)}
    return jsonify(objects)


@app.route(
    '/api/repos/<string:repo_name>/milestones/<milestone_number>',
    methods=['GET'])
@needlogin
def get_a_milestone(repo_name, milestone_number):
    milestone_request = github.get(
        'repos/{0}/{1}/milestones/{2}?type=all&per_page=100'.format(
            app.config['ORGANISATION'], repo_name, milestone_number),
        all_pages=True)
    response = {
        'milestone_number': milestone_request['number'],
        'repo_name': repo_name,
        'milestone_id': milestone_request['id'],
        'milestone_title': milestone_request['title'],
        'description': milestone_request['description'],
        'html_url': milestone_request['html_url'],
        'open_issues': milestone_request['open_issues'],
        'closed_issues': milestone_request['closed_issues'],
        'state': milestone_request['state'],
        'updated_at': milestone_request['updated_at'],
        'due_on': milestone_request['due_on'],
        'closed_at': milestone_request['closed_at']}
    objects = {
        'objects': response,
        'occurences': 1 if response else 0,
        'primary_keys': [
            'repo_name',
            'milestone_number']}
    return jsonify(objects)


@app.route('/api/repos/<string:repo_name>/milestones', methods=['POST'])
@needlogin
def create_milestone(repo_name):
    data = request.get_json()
    if data.get('milestone_title'):
        data['title'] = data.get('milestone_title')
    data = json.dumps(data)
    milestone_request = github.request(
        'POST',
        'repos/{0}/{1}/milestones?type=all&per_page=100'.format(
            app.config['ORGANISATION'], repo_name), data=data)
    response = {
        'milestone_number': milestone_request['number'],
        'repo_name': repo_name,
        'milestone_id': milestone_request['id'],
        'milestone_title': milestone_request['title'],
        'description': milestone_request['description'],
        'html_url': milestone_request['html_url'],
        'open_issues': milestone_request['open_issues'],
        'closed_issues': milestone_request['closed_issues'],
        'state': milestone_request['state'],
        'updated_at': milestone_request['updated_at'],
        'due_on': milestone_request['due_on'],
        'closed_at': milestone_request['closed_at']}
    objects = {
        'objects': response,
        'occurences': 1 if response else 0,
        'primary_keys': ['repo_name']}
    return jsonify(objects)


@app.route(
    '/api/repos/<string:repo_name>/milestones/<milestone_number>',
    methods=['PUT'])
@needlogin
def update_a_milestone(repo_name, milestone_number):
    data = request.get_json()
    if data.get('milestone_title'):
        data['title'] = data.get('milestone_title')
    data = json.dumps(data)
    milestone_request = github.request(
        'PATCH',
        'repos/{0}/{1}/milestones/{2}?state=all&per_page=100'.format(
            app.config['ORGANISATION'], repo_name, milestone_number),
        data=data)
    response = {
        'milestone_number': milestone_request['number'],
        'repo_name': repo_name,
        'milestone_id': milestone_request['id'],
        'milestone_title': milestone_request['title'],
        'description': milestone_request['description'],
        'html_url': milestone_request['html_url'],
        'open_issues': milestone_request['open_issues'],
        'closed_issues': milestone_request['closed_issues'],
        'state': milestone_request['state'],
        'updated_at': milestone_request['updated_at'],
        'due_on': milestone_request['due_on'],
        'closed_at': milestone_request['closed_at']}
    objects = {
        'objects': response,
        'occurences': 1 if response else 0,
        'primary_keys': [
            'repo_name',
            'milestone_number']}
    return jsonify(objects)


@app.route('/api/tickets')
@needlogin
def list_tickets():
    params = request.args.copy()
    if len(params) == 0:
        response = {
            'status': 'error',
            'message': 'Invalid payload.'
        }
        return jsonify(response), 400

    url = 'search/issues'
    end_url = '?per_page=100&q=user:{0}'.format(app.config['ORGANISATION'])
    query = ''
    for value in params.poplist('labels'):
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
        ticket_request = github.get(
            url + end_url + query, all_pages=True, headers=headers)
    except GitHubError as e:
        return e.response.content, e.response.status_code
    response = [{'ticket_id': ticket['id'],
                 'ticket_number': ticket['number'],
                 'ticket_title': ticket['title'],
                 'body': ticket['body'],
                 'html_url': ticket['html_url'],
                 'user': {'user_id': ticket['user']['id'],
                          'user_name': ticket['user']['login']},
                 'state': ticket['state'],
                 'milestone_id': (
                 ticket['milestone']['id'] if ticket['milestone'] else None),
                 'milestone_title': (
                     ticket['milestone']['title']
                     if ticket['milestone'] else None),
                 'nb_comments': ticket['comments'],
                 'updated_at': ticket['updated_at'],
                 'closed_at': ticket['closed_at'],
                 'repo_name': ticket['repository_url'].split('/')[-1],
                 'assignees': [
                 {
                     'user_id': assignee['id'],
                     'user_name': assignee['login'],
                     'avatar_url': assignee['avatar_url']
                 } for assignee in ticket.get('assignees', [])],
                 'labels': [
                 {'label_id': label['id'], 'label_name': label['name'],
                  'label_color': label['color']}
                     for label in ticket.get('labels', [])]}
                for ticket in ticket_request['items']]
    for ticket in response:
        ticket['selected'] = False
        ticket['expanded'] = False
    objects = {'objects': response, 'occurences': len(response)}
    return jsonify(objects)


@app.route(
    '/api/repos/<repo_name>/tickets/<ticket_number>',
    methods=['GET'])
@needlogin
def get_a_ticket(repo_name, ticket_number):
    ticket_request = github.get(
        'repos/{0}/{1}/issues/{2}?state=all'.format
        (app.config['ORGANISATION'],
            repo_name, ticket_number), all_pages=True)
    response = {
        'ticket_id': ticket_request['id'],
        'ticket_number': ticket_request['number'],
        'ticket_title': ticket_request['title'],
        'body': ticket_request['body'],
        'html_url': ticket_request['html_url'],
        'user': {
            'user_id': ticket_request['user']['id']},
        'state': ticket_request['state'],
        'milestone_id': ticket_request['milestone']['id'],
        'milestone_title': (
            ticket_request['milestone']['title']
            if ticket_request['milestone'] else None),
        'updated_at': ticket_request['updated_at'],
        'closed_at': ticket_request['closed_at'],
        'repo_name': repo_name,
        'assignees': [
            {
                'user_id': assignee['id'],
                'user_name': assignee['login'],
                'avatar_url': assignee['avatar_url']
            } for assignee in ticket_request.get('assignees', [])],
        'labels': [
            {
                'label_id': label['id'], 'label_color': label['color'],
                'label_name': label['name']} for label in ticket_request.get(
                'labels',
                [])]}
    objects = {
        'objects': response,
        'occurences': 1 if response else 0,
        'primary_keys': [
            'repo_name',
            'ticket_number']}
    return jsonify(objects)


@app.route('/api/repos/<repo_name>/tickets', methods=['POST'])
@needlogin
def create_a_ticket(repo_name):
    data = request.get_json()
    if data.get('ticket_title'):
        data['title'] = data.pop('ticket_title')
    if data.get('milestone_number'):
        data['milestone'] = data.pop('milestone_number')
    data = json.dumps(data)
    ticket_request = github.request('POST',
                                    'repos/{0}/{1}/issues'.format(
                                        app.config['ORGANISATION'],
                                        repo_name), data=data)
    response = {
        'ticket_id': ticket_request['id'],
        'ticket_number': ticket_request['number'],
        'ticket_title': ticket_request['title'],
        'body': ticket_request['body'],
        'html_url': ticket_request['html_url'],
        'user': {
            'user_id': ticket_request['user']['id']},
        'state': ticket_request['state'],
        'milestone_id': ticket_request['milestone']['id'],
        'milestone_title': (
            ticket_request['milestone']['title']
            if ticket_request['milestone'] else None),
        'updated_at': ticket_request['updated_at'],
        'closed_at': ticket_request['closed_at'],
        'repo_name': repo_name,
        'assignees': [
            {
                'user_name': assignee['login'],
                'avatar_url': assignee['avatar_url']
            }for assignee in ticket_request.get('assignees', [])],
        'labels': [
            {
                'label_color': label['color'],
                'label_name': label['name']} for label in ticket_request.get(
                'labels',
                [])]}
    objects = {
        'objects': response,
        'occurences': 1 if response else 0,
        'primary_keys': ['repo_name']}
    return jsonify(objects)


@app.route(
    '/api/repos/<string:repo_name>/tickets/<ticket_number>',
    methods=['PUT'])
@needlogin
def update_a_ticket(repo_name, ticket_number):
    data = request.get_json()
    if data.get('ticket_title'):
        data['title'] = data.get('ticket_title')
    if data.get('milestone_number'):
        data['milestone'] = data.get('milestone_number')
    if data.get('labels'):
        data['labels'] = [label['label_name'] for label in data.get('labels')]
    data = json.dumps(data)
    try:
        ticket_request = github.request(
            'PATCH',
            'repos/{0}/{1}/issues/{2}'.format(
                app.config['ORGANISATION'],
                repo_name, ticket_number),
            data=data)
    except GitHubError as e:
        return e.response.content, e.response.status_code

    response = {
        'ticket_id': ticket_request['id'],
        'ticket_number': ticket_request['number'],
        'ticket_title': ticket_request['title'],
        'body': ticket_request['body'],
        'html_url': ticket_request['html_url'],
        'user': {
            'user_id': ticket_request['user']['id']},
        'state': ticket_request['state'],
        'milestone_id': (
            ticket_request['milestone']['id']
            if ticket_request['milestone'] else None),
        'milestone_title': (
            ticket_request['milestone']['title']
            if ticket_request['milestone'] else None),
        'updated_at': ticket_request['updated_at'],
        'closed_at': ticket_request['closed_at'],
        'repo_name': repo_name,
        'assignees': [
            {
                'user_id': assignee['id'],
                'user_name': assignee['login'],
                'avatar_url': assignee['avatar_url']
            } for assignee in ticket_request.get('assignees', [])],
        'labels': [
            {
                'label_id': label['id'],
                'label_color': label['color'],
                'label_name': label['name']} for label in ticket_request.get(
                'labels',
                [])],
        'selected': False,
        'expanded': False}
    objects = [{'objects': [response]}]
    objects = {
        'objects': response,
        'occurences': 1 if response else 0,
        'primary_keys': [
            'repo_name',
            'ticket_number']}
    return jsonify(objects)


@app.route(
    '/api/repos/<string:repo_name>/tickets/<ticket_number>/comments',
    methods=['GET'])
@needlogin
def list_comments(repo_name, ticket_number):
    comment_request = github.get(
        'repos/{0}/{1}/issues/{2}/comments?type=all&per_page=100'.format(
            app.config['ORGANISATION'],
            repo_name, ticket_number), all_pages=True)
    response = [{'comment_id': comment['id'],
                 'repo_name': repo_name,
                 'ticket_number': ticket_number,
                 'user':{'user_id': comment['user']['id'],
                         'user_name': comment['user']['login'],
                         'avatar_url': comment['user']['avatar_url']},
                 'created_at': comment['created_at'],
                 'updated_at': comment['updated_at'],
                 'body': comment['body']} for comment in comment_request]
    objects = [{'objects': [response]}]
    objects = {'objects': response, 'occurences': len(response)}
    return jsonify(objects)


@app.route(
    '/api/repos/<string:repo_name>/tickets/comments/<comment_id>',
    methods=['GET'])
@needlogin
def get_a_comment(repo_name, comment_id):
    comment_request = github.get(
        'repos/{0}/{1}/issues/comments/{2}?type=all&per_page=100'.format(
            app.config['ORGANISATION'],
            repo_name, comment_id), all_pages=True)
    response = {
        'comment_id': comment_request['id'],
        'repo_name': repo_name,
        'user': {'user_id': comment_request['user']['id'],
                 'user_name': comment_request['user']['login'],
                 'avatar_url': comment_request['user']['avatar_url']},
        'created_at': comment_request['created_at'],
        'updtated_at': comment_request['updated_at'],
        'body': comment_request['body']}
    objects = {
        'objects': response,
        'occurences': 1 if response else 0,
        'primary_keys': [
            'repo_name',
            'comment_id']}
    return jsonify(objects)


@app.route(
    '/api/repos/<repo_name>/tickets/<ticket_number>/comments',
    methods=['POST'])
@needlogin
def create_a_comment(repo_name, ticket_number):
    data = request.get_json()
    data = json.dumps(data)
    comment_request = github.request(
        'POST',
        'repos/{0}/{1}/issues/{2}/comments'.format(
            app.config['ORGANISATION'],
            repo_name, ticket_number), data=data)
    response = {
        'comment_id': comment_request['id'],
        'repo_name': repo_name,
        'user': {'user_id': comment_request['user']['id'],
                 'user_name': comment_request['user']['login'],
                 'avatar_url': comment_request['user']['avatar_url']},
        'created_at': comment_request['created_at'],
        'updtated_at': comment_request['updated_at'],
        'body': comment_request['body']}
    objects = [{'objects': [response]}]
    objects = {
        'objects': response,
        'occurences': 1 if response else 0,
        'primary_keys': [
            'repo_name',
            'ticket_number']}
    return jsonify(objects)


@app.route(
    '/api/repos/<repo_name>/tickets/comments/<comment_id>',
    methods=['PUT'])
@needlogin
def update_a_comment(repo_name, comment_id):
    data = request.get_json()
    data = json.dumps(data)
    comment_request = github.request(
        'PATCH',
        'repos/{0}/{1]/issues/comments/{2}'.format(
            app.config['ORGANISATION'],
            repo_name, comment_id), data=data)
    response = {
        'comment_id': comment_request['id'],
        'repo_name': repo_name,
        'user': {'user_id': comment_request['user']['id'],
                 'user_name': comment_request['user']['login'],
                 'avatar_url': comment_request['user']['avatar_url']},
        'created_at': comment_request['created_at'],
        'updtated_at': comment_request['updated_at'],
        'body': comment_request['body']}
    objects = {
        'objects': response,
        'occurences': 1 if response else 0,
        'primary_keys': [
            'repo_name',
            'comment_id']}
    return jsonify(objects)


@app.route(
    '/api/repos/<repo_name>/tickets/comments/<comment_id>',
    methods=['DELETE'])
@needlogin
def delete_a_comment(repo_name, comment_id):
    comment_request = github.request(
        'DELETE',
        'repos/{0}/{1}/issues/comments/{2}'.format(
            app.config['ORGANISATION'], repo_name, comment_id))
    response = [{'comment_id': comment['id'],
                 'user':{'user_id': comment['user']['id'],
                         'user_name': comment['user']['login'],
                         'avatar_url': comment['user']['avatar_url']},
                 'created_at': comment['created_at'],
                 'updtated_at': comment['updated_at'],
                 'body': comment['body']} for comment in comment_request]
    objects = {
        'objects': response,
        'occurences': len(response),
        'primary_keys': [
            repo_name,
            comment_id]}
    return jsonify(objects)


@app.route(
    '/api/repos/<string:repo_name>/milestones/<milestone_number>/labels',
    methods=['GET'])
@needlogin
def list_repo_milestone_labels(repo_name, milestone_number):
    label_request = github.get(
        'repos/{0}/{1}/milestones/{2}/labels?type=all&per_page=100'.format(
            app.config['ORGANISATION'], repo_name, milestone_number),
        all_pages=True)
    response = [{'label_id': label['id'],
                 'repo_name': repo_name,
                 'label_name':label['name'],
                 'color':label['color']} for label in label_request]
    objects = {
        'objects': response,
        'occurences': len(response),
        'primary_keys': [
            'repo_name',
            'label_name']}
    return jsonify(objects)


@app.route(
    '/api/repos/<string:repo_name>/labels',
    methods=['GET'])
@needlogin
def list_repo_labels(repo_name):
    label_request = github.get(
        'repos/{0}/{1}/labels?type=all&per_page=100'.format(
            app.config['ORGANISATION'], repo_name),
        all_pages=True)
    response = [{'label_id': label['id'],
                 'repo_name': repo_name,
                 'label_name':label['name'],
                 'color':label['color']} for label in label_request]
    objects = {
        'objects': response,
        'occurences': len(response),
        'primary_keys': [
            'repo_name',
            'label_name']}
    return jsonify(objects)


@app.route(
    '/api/repos/<string:repo_name>/labels/<string:label_name>',
    methods=['GET'])
@needlogin
def get_a_label(repo_name, label_name):
    label_request = github.get(
        'repos/{0}/{1}/labels/{2}?type=all&per_page=100'.format(
            app.config['ORGANISATION'], repo_name, label_name),
        all_pages=True)
    response = {
        'label_id': label_request['id'],
        'repo_name': repo_name,
        'label_name': label_request['name'],
        'color': label_request['color']}
    objects = {
        'objects': response,
        'occurences': 1 if response else 0,
        'primary_keys': [
            'repo_name',
            'label_name']}
    return jsonify(objects)


@app.route('/api/repos/<repo_name>/labels', methods=['POST'])
@needlogin
def create_a_label(repo_name):
    data = request.get_json()

    if not data.get('label_name'):
        response = {
            'status': 'error',
            'message': 'Invalid payload.'
        }
        return jsonify(response), 400

    data['name'] = data.pop('label_name')
    try:
        label_request = github.post('repos/{0}/{1}/labels'.format(
                                    app.config['ORGANISATION'],
                                    repo_name), data=data)
        response = {
            'label_id': label_request['id'],
            'repo_name': repo_name,
            'label_name': label_request['name'],
            'color': label_request['color']
        }
        objects = {
            'object': response,
            'occurences': 1 if response else 0,
            'primary_keys': ['repo_name']}
        return jsonify(objects)
    except GitHubError as e:
        return e.response.content, e.response.status_code


@app.route(
    '/api/repos/<string:repo_name>/labels/<label_name>',
    methods=['PUT'])
@needlogin
def update_a_label(repo_name, label_name):
    data = request.get_json()
    if data.get('label_name'):
        data['name'] = data.get('label_name')
    data = json.dumps(data)
    label_request = github.request('PATCH',
                                   'repos/{0}/{1}/labels/{2}'.format(
                                       app.config['ORGANISATION'],
                                       repo_name, label_name), data=data)
    response = {
        'label_id': label_request['id'],
        'repo_name': repo_name,
        'label_name': label_request['name'],
        'color': label_request['color']}
    objects = {
        'objects': response,
        'occurences': 1 if response else 0,
        'primary_keys': [
            'repo_name',
            'label_name']}
    return jsonify(objects)


@app.route(
    '/api/repos/<string:repo_name>/labels/<string:label_name>',
    methods=['DELETE'])
@needlogin
def delete_a_label(repo_name, label_name):
    try:
        # Github API returns 204 (No content), if no error
        response_github = github.request('DELETE',
                                         'repos/{0}/{1}/labels/{2}'
                                         .format(app.config['ORGANISATION'],
                                                 repo_name, label_name))
        response = {'status': 'success',
                    'message': 'Label {0} deleted for repo {1}.'
                    .format(label_name, repo_name)}
        return jsonify(response), response_github.status_code
    except GitHubError as e:
        return e.response.content, e.response.status_code


@app.route('/api/user', methods=['GET', 'POST'])
@needlogin
def user():
    return jsonify({'user': github.get('user')})


@app.route(
    '/api/users',
    methods=['GET'])
@needlogin
def list_users():
    user_request = github.get(
        'orgs/{0}/members?type=all&per_page=100'.format(
            app.config['ORGANISATION']), all_pages=True)
    response = [{'user_id': user['id'],
                 'user_name': user['login'],
                 'avatar_url': user['avatar_url']} for user in user_request]
    objects = {'objects': response, 'occurences': len(response)}
    return jsonify(objects)


@app.route(
    '/api/users/<string:user_name>',
    methods=['GET'])
@needlogin
def get_a_user(user_name):
    user_request = github.get(
        'users/' + user_name + '?type=all&per_page=100', all_pages=True)
    response = {
        'user_id': user_request['id'],
        'user_name': user_request['login'],
        'avatar_url': user_request['avatar_url']}
    objects = {
        'objects': response,
        'occurences': 1 if response else 0,
        'primary_keys': [user_name]}
    return jsonify(objects)


@app.route('/api/timeline.json', methods=['GET', 'POST'])
@needlogin
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
            except GitHubError as e:
                return e.response.content, e.response.status_code
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
                if milestone.get('due_on') and date_from_iso(start) <=
                milestone['due_on'] < date_from_iso(stop)
            ]
        }
    })


@app.route('/api/report', methods=['GET', 'POST'])
@needlogin
def report():
    params = dict(request.get_json())
    start = params.get('start')
    stop = params.get('stop')
    start = date_from_iso(start)
    stop = date_from_iso(stop)

    since = start.strftime('%Y-%m-%dT00:00:00Z')
    url = (
        'orgs/{0}/issues?per_page=100&state=closed&filter=all&since={1}'
        .format(app.config['ORGANISATION'], since)
    )
    try:
        issues = github.get(url, all_pages=True)
    except GitHubError as e:
        return e.response.content, e.response.status_code
    ok_issues = []
    # assignees = []
    for issue in issues:
        if (issue.get('assignee')
                and start < date_from_iso(issue['closed_at']) < stop):
            ok_issues.append(issue)
            # assignees.append(issue['assignee']['login'])
    return jsonify({
        'params': request.get_json(),
        'results': {
            'issues': ok_issues
        }
    })


def refresh_repo_milestones(repo_name, repo, access_token):
    url = 'repos/{0}/{1}/milestones?state=all&per_page=100'.format(
        app.config['ORGANISATION'], repo_name
    )
    repo['milestones'] = github.get(url, access_token=access_token)
    for milestone in repo['milestones']:
        if milestone['due_on'] is not None:
            milestone['due_on'] = date_from_iso(milestone['due_on'])
            milestone['repo'] = repo_name
            total = milestone['closed_issues'] + milestone['open_issues']
            milestone['progress'] = (
                milestone['closed_issues'] / (total or float('inf'))
            )


def return_github_message(github_response):
    return (github_response.json()['message'], github_response.status_code)


@app.route('/api/labels', methods=['GET', 'POST'])
@needlogin
def labels():
    return jsonify({
        'objects': {
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
        }
    })
