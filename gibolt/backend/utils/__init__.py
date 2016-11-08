import os
from json import dumps, loads
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from flask import current_app


class ReactError(Exception):
    pass


def render_component(filename, reducer=None, state=None):
    path = os.path.join(current_app.root_path, '..', filename)
    if not os.path.exists(path):
        raise ValueError('%s does not exists' % path)

    if not reducer:
        reducer = 'frontend/src/reducers/index.js'

    reducer_path = os.path.join(current_app.root_path, '..', reducer)
    if not os.path.exists(reducer_path):
        raise ValueError('%s does not exists' % path)

    data = {
        'path': path,
        'reducer': reducer_path
    }
    if state:
        data['state'] = dumps(state)

    request = Request(
        '%s/render' % current_app.config['RENDER_SERVER'],
        dumps(data).encode('utf-8'), {
            'Content-Type': 'application/json'
        })

    try:
        response = urlopen(request)
    except HTTPError as e:
        if not current_app.debug:
            raise HTTPError('[ERROR %d on renderering server]' % e.code)
        current_app.logger.warn(
            'Error on rendering server, see on client rendering.')
        return 'NO SERVER RENDERING'

    response = response.read()

    rv = loads(response.decode('utf-8'))

    if rv.get('error'):
        error = rv['error']
        if 'stack' in error:
            raise ReactError(error['stack'])
        raise ReactError(error)

    if not rv.get('markup'):
        raise ReactError('No markup rendered %s' % rv)

    return rv['markup']
