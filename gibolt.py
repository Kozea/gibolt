#!/usr/bin/env python
# coding: utf-8

import locale
from datetime import datetime
import requests
from dateutil.relativedelta import relativedelta
from flask import (
    Flask, request, session, render_template, redirect, url_for)

app = Flask(__name__)
app.config.from_envvar('GIBOLT_SETTINGS')

locale.setlocale(locale.LC_ALL, 'fr_FR.utf8')

cache = {'users': {}, 'repos': {}}


@app.route('/')
def index():
    if session.get('username'):
        return redirect(url_for('show', display='year'))
    else:
        return redirect(url_for('login'))


@app.route('/login', methods=('GET', 'POST'))
def login():
    if request.method == 'POST':
        repos = get_allowed_repos(
            request.form['username'], request.form['password'])
        if repos is not None:
            session['username'] = request.form['username']
            session['password'] = request.form['password']
            cache.get('users')[request.form['username']] = repos
            return redirect(url_for('show_now', display='year'))
    return render_template('login.jinja2')


@app.route('/logout')
def logout():
    del session['username']
    return redirect(url_for('login'))


def get_allowed_repos(username, password):
    """ return a list of repo names allowed for this user
    """
    # retrive all repositories from github
    r = requests.get(
        'https://api.github.com/orgs/Kozea/repos?type=all',
        auth=(username, password))
    if r.status_code != 200:
        return None
    repos = r.json()
    while r.links.get('next'):
        r = requests.get(r.links['next']['url'], auth=(username, password))
        repos += r.json()
        print("query for repo sent to github")
    return [repo['name'] for repo in repos]


@app.route('/refresh')
def refresh_all_milestones():
    """ refresh milstones for all repositories of the current users
    """
    repo_names = cache.get('users').get(session['username'])
    for repo_name in repo_names:
        refresh_repo_milestones(repo_name)
    return redirect(url_for('show_now', display='year'))


def refresh_repo_milestones(repo_name):
    """ refresh all milestones for a repository """
    username = session.get('username')
    password = session.get('password')
    repo = {}
    url = 'https://api.github.com/repos/{0}/{1}/milestones'.format(
        app.config.get('ORGANISATION'), repo_name)
    r = requests.get(url, auth=(username, password))
    repo['milestones'] = r.json()
    for milestone in repo['milestones']:
        if milestone['due_on'] is not None:
            milestone['due_on'] = datetime.strptime(
                    milestone['due_on'], "%Y-%m-%dT%XZ")
            milestone['repo'] = repo_name
            milestone['progress'] = (
                milestone['closed_issues'] /
                ((milestone['closed_issues'] +
                    milestone['open_issues']) or float('inf')) * 100)
    cache.get('repos')[repo_name] = repo


@app.route('/show/<display>')
def show_now(display='year'):
    start = datetime(datetime.now().year, datetime.now().month, 1)
    if display == 'year':
        stop = start + relativedelta(months=12)
    if display == 'month':
        stop = start + relativedelta(months=1)
    return redirect(url_for(
        'show', display=display,
        start=datetime.strftime(start, "%Y-%m-%dT%XZ"),
        stop=datetime.strftime(stop, "%Y-%m-%dT%XZ")))



@app.route('/show_month/<month_start>')
def show_month(month_start):
    stop = datetime.strptime(
            month_start, "%Y-%m-%dT%XZ") + relativedelta(months=1)
    return redirect(url_for(
        'show', display='month', start=month_start,
        stop=datetime.strftime(stop, "%Y-%m-%dT%XZ")))


@app.route('/show/<display>/<start>/<stop>')
def show(display, start, stop):
    display_step = {
            'year': relativedelta(months=1),
            'month': relativedelta(days=1)
    }
    date_start = datetime.strptime(start, "%Y-%m-%dT%XZ")
    date_stop = datetime.strptime(stop, "%Y-%m-%dT%XZ")

    repos_name = cache.get('users').get(session['username'])
    if repos_name is None:
        return redirect(url_for('login'))
    milestones = []
    for name in repos_name:
        if name not in cache.get('repos'):
            refresh_repo_milestones(name)
        milestones += cache.get('repos').get(name).get('milestones')

    stones = get_stones_by_step(
            milestones, date_start, date_stop, display_step.get(display))
    return render_template(
            "{0}.jinja2".format(display), start=date_start,
            stones_by_step=stones)


def get_stones_by_step(all_stones, start, end, step):
    result = []
    current = start
    while current < end:
        stones = [
            stone for stone in all_stones
            if (stone['due_on'] and
                current < stone['due_on'] < current + step)]
        result.append((current, stones))
        current = current + step
    return result


app.secret_key = 'secret: chut'

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
