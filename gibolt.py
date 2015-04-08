#!/usr/bin/env python
# coding: utf-8

import json
import ssl
import urllib
import locale
from datetime import datetime
import requests
from dateutil.relativedelta import relativedelta
from flask import (
    Flask, request, session, render_template, redirect, url_for, jsonify)

app = Flask(__name__)
app.config.from_envvar('GIBOLT_SETTINGS')

locale.setlocale(locale.LC_ALL, 'fr_FR.utf8')

cache = {}


@app.route('/', methods=('GET', 'POST'))
def index():
    return redirect(url_for('all'))


@app.route('/login', methods=('GET', 'POST'))
def login():
    if request.method == 'POST':
         
        repos = get_from_github(
            request.form['username'], request.form['password'])
        if repos is not None:
            session['username'] = request.form['username']
            cache[request.form['username']] = repos
            return redirect(url_for('show_all'))
    return render_template('login.jinja2')

def get_from_github(username, password):
    """ Get data from github and store it in session
    """
    # retrive all repositories from github
    r = requests.get(
        'https://api.github.com/orgs/Kozea/repos?type=all',
        auth=(username, password))
    if r.status_code != 200:
        return None
    repos = r.json()
    while r.links.get('next'):
        r = requests.get(r.links['next']['url'], auth=(username,password))
        repos += r.json()
        print ("query for repo sent to github")
    
    # get all milestones for each repository
    for repo in repos:
        url = 'https://api.github.com/repos/{0}/{1}/milestones'.format(
            app.config.get('ORGANISATION'), repo['name'])
        r = requests.get(
            url, auth=(username, password))
        repo['milestones'] = r.json()
        print ("query for milestones sent to github")
        # convert date string into datetime object
        for milestone in repo['milestones']:
            if milestone['due_on'] is not None: 
                milestone['due_on'] = datetime.strptime(milestone['due_on'], "%Y-%m-%dT%XZ")
    return repos


@app.route('/show_all')
def show_all():
    """ organize and present some of the data
    """
    repos = cache[session['username']]
    milestones = []
    for repo in repos:
        for milestone in repo['milestones']:
            milestone['repo'] = repo['name']
            milestone['progress'] = (
                milestone['closed_issues'] / 
                ((milestone['closed_issues'] + milestone['open_issues']) or float('inf') ) * 100)
            milestones.append(milestone)

    # we only want milestone with due date
    due_milestones = [
        milestone  for milestone in milestones
        if milestone['due_on'] is not None]

    milestones_by_month = []
    month_start = datetime(datetime.now().year, datetime.now().month, 1)
    for i in range (12):
        next_month_start = month_start + relativedelta(months=1)
        stones = [
            stone for stone in due_milestones 
            if next_month_start > stone['due_on'] > month_start]
        milestones_by_month.append((month_start.strftime('%B'), stones))
        month_start = next_month_start
    
    return render_template(
        'all.jinja2', repos=repos, milestones_by_month=milestones_by_month)
    

app.secret_key = 'secret: chut'

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
