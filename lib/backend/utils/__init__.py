from json import dumps
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from flask import current_app, request


class ReactError(Exception):
    pass


def render_component(state):
    rq = Request(
        '%s%s' % (
            current_app.config['RENDER_SERVER'],
            request.path
        ), dumps({
            'state': state,
            'query': request.query_string.decode('utf-8')
        }).encode('utf-8'),
        {'Content-Type': 'application/json'}
    )

    try:
        response = urlopen(rq)
    except HTTPError as e:
        current_app.logger.exception(
            'Error on rendering server, see on client rendering.')
        return 'NO SERVER RENDERING (%d)' % e.code

    return response.read().decode('utf-8')
