from flask import jsonify
from unrest import UnRest

from .. import Session, app, session_unrest
from ..routes.auth import needlogin
from .models import Circle, Item, Milestone_circle, Report, Role

session = Session()


# Declare rest endpoints for gibolt Database
rest = UnRest(app, session_unrest)

rest(
    Circle,
    methods=['GET', 'PUT', 'POST', 'DELETE'],
    relationships={
        'roles': rest(Role, only=['role_id', 'role_name', 'user_id']),
    },
    name='circles',
    auth=needlogin
)

rest(
    Role,
    methods=['GET', 'PUT', 'POST', 'DELETE'],
    name='roles',
    auth=needlogin)

rest(
    Report,
    methods=['GET', 'PUT', 'POST', 'DELETE'],
    relationships={
        'circle': rest(Circle, only=['circle_name']),
    },
    name='reports',
    auth=needlogin)

rest(
    Item,
    methods=['GET', 'PUT', 'POST', 'DELETE'],
    name='items',
    auth=needlogin)

rest(
    Milestone_circle,
    methods=['GET', 'PUT', 'POST', 'DELETE'],
    name='milestones_circles',
    auth=needlogin)


@app.route('/api/meetingsTypes', methods=['GET', 'POST'])
@needlogin
def get_meetings_types():
    return jsonify({
        'objects': [{
            'type_id': type_id,
            'type_name': type_name
        } for type_id, type_name in app.config['MEETINGS_TYPES']]

    })
