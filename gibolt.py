#!/usr/bin/env python

from datetime import date

import requests
from dateutil.relativedelta import relativedelta
from flask import (
    Flask, request, session, render_template, redirect, url_for)

app = Flask(__name__)
app.secret_key = 'secret'
app.config['ORGANISATION'] = 'Kozea'
app.config.from_envvar('GIBOLT_SETTINGS', silent=True)

cache = {'users': {}, 'repos': {}}


def date_from_iso(iso_date):
    return date(*[int(value) for value in iso_date[:10].split('-')])


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
    """Return a list of repo names allowed for this user."""
    # retrive all repositories from github
    response = requests.get(
        'https://api.github.com/orgs/{0}/repos?type=all'.format(
            app.config['ORGANISATION']),
        auth=(username, password))
    if response.status_code != 200:
        return None
    repos = response.json()
    while response.links.get('next'):
        response = requests.get(
            response.links['next']['url'], auth=(username, password))
        repos += response.json()
    return [repo['name'] for repo in repos]


@app.route('/refresh')
def refresh_all_milestones():
    """Refresh milstones for all repositories of the current users."""
    repo_names = cache.get('users').get(session['username'])
    for repo_name in repo_names:
        refresh_repo_milestones(repo_name)
    return redirect(url_for('show_now', display='year'))


def refresh_repo_milestones(repo_name):
    """Refresh all milestones for a repository."""
    username = session.get('username')
    password = session.get('password')
    repo = {}
    url = 'https://api.github.com/repos/{0}/{1}/milestones'.format(
        app.config['ORGANISATION'], repo_name)
    response = requests.get(url, auth=(username, password))
    repo['milestones'] = response.json()
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

    repos_name = cache['users'].get(session['username'])
    if repos_name is None:
        return redirect(url_for('login'))
    milestones = []
    for name in repos_name:
        if name not in cache.get('repos'):
            refresh_repo_milestones(name)
        milestones += cache.get('repos').get(name).get('milestones')
    print(milestones)
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
