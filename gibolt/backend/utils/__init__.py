import os
from json import dumps, loads
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from flask import current_app, request


class ReactError(Exception):
    pass


def render_component(state):
    rq = Request(
        '%s%s' % (
            current_app.config['RENDER_SERVER'],
            request.path))

    try:
        response = urlopen(rq)
    except HTTPError as e:
        if not current_app.debug:
            raise HTTPError('[ERROR %d on renderering server]' % e.code)
        current_app.logger.warn(
            'Error on rendering server, see on client rendering.')
        return 'NO SERVER RENDERING'

    response = response.read()

    return response.decode('utf-8')
