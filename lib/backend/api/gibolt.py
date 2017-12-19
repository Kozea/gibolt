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


@app.route(
    '/api/circle/<string:circle_name>',
    methods=['GET'])
@needlogin
def get_a_circle(circle_name):
    circle = session.query(Circle).filter(
        Circle.circle_name == circle_name).one()
    if circle:
        roles = session.query(Role).filter(
            Role.circle_id == circle.circle_id).all()
        response = {
            'circle_id': circle.circle_id,
            'parent_circle_id': circle.parent_circle_id,
            'circle_name': circle.circle_name,
            'circle_purpose': circle.circle_purpose,
            'circle_domain': circle.circle_domain,
            'circle_accountabilities': circle.circle_accountabilities,
            'roles': [{
                'role_id': role.role_id,
                'role_name': role.role_name,
                'user_id': role.user_id,
            } for role in roles],
            'purpose_expanded': False,
            'domain_expanded': False,
            'accountabilities_expanded': False}
    objects = {
        'objects': response,
        'occurences': 1 if response else 0,
        'primary_keys': ["circle_name"]}
    return jsonify(objects)


rest(
    Role,
    methods=['GET', 'PUT', 'POST', 'DELETE'],
    name='roles',
    auth=needlogin)

rest(
    Report,
    methods=['GET', 'PUT', 'POST', 'DELETE'],
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
