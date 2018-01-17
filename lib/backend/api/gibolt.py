from flask import jsonify, request
from sqlalchemy import exc
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
        'circle_milestones': rest(Milestone_circle),
    },
    name='circles',
    query=lambda query: query.filter(
        Circle.parent_circle_id == (request.values.get('parent_circle_id'))
        if request.values.get('parent_circle_id')
        else True,
    ),
    auth=needlogin
)

rest(
    Role,
    methods=['GET', 'PUT', 'POST', 'DELETE'],
    name='roles',
    query=lambda query: query.filter(
        Role.circle_id == (request.values.get('circle_id'))
        if request.values.get('circle_id')
        else True,
    ),
    auth=needlogin)

rest(
    Report,
    methods=['GET', 'PUT', 'POST', 'DELETE'],
    relationships={
        'circle': rest(Circle, only=['circle_name']),
    },
    name='reports',
    query=lambda query: query.filter(
        Report.circle_id == int(request.values.get('circle_id'))
        if request.values.get('circle_id')
        else True,
        Report.report_type == request.values.get('meeting_name')
        if request.values.get('meeting_name')
        else True,
    ).order_by(Report.created_at.desc()),
    auth=needlogin)

rest(
    Item,
    methods=['GET', 'PUT', 'POST', 'DELETE'],
    name='items',
    query=lambda query: query.filter(
        Item.role_id == (request.values.get('role_id'))
        if request.values.get('role_id')
        else True,
    ),
    auth=needlogin)

rest(
    Milestone_circle,
    methods=['GET', 'PUT', 'POST', 'DELETE'],
    name='milestones_circles',
    auth=needlogin)


@app.route('/api/milestone_circles/<int:milestone_number>', methods=['POST'])
@needlogin
def update_milestones_circles(milestone_number):
    circles_list = request.get_json()
    existing_milestones_circles = session.query(Milestone_circle).filter(
        Milestone_circle.milestone_number == milestone_number).all()

    try:
        # deletion
        for existing_assoc in existing_milestones_circles:
            if existing_assoc.circle_id not in circles_list:
                session.query(Milestone_circle).filter(
                    Milestone_circle.milestone_number == milestone_number
                    and Milestone_circle.circle_id == existing_assoc.circle_id  # noqa
                ).delete()

        # creation
        for circle in circles_list:
            circle_id = circle.get("circle_id")
            repo_name = circle.get("repo_name")
            milestone_circle = session.query(Milestone_circle).filter(
                Milestone_circle.milestone_number == milestone_number
                and Milestone_circle.circle_id == circle_id  # noqa
            ).first()
            if not milestone_circle:
                new_milestone_circle = Milestone_circle(
                    circle_id=circle_id,
                    milestone_number=milestone_number,
                    repo_name=repo_name
                )
                session.add(new_milestone_circle)

        session.commit()
        response_object = {
            'status': 'success',
            'message': 'Milestone_circle update successful.'
        }
        code = 200

    except (exc.IntegrityError, exc.OperationalError, ValueError) as e:
        session.rollback()
        response_object = {
            'status': 'error',
            'message': 'Error during Milestone_circle table update.'
        }
        code = 400

    return jsonify(response_object), code


@app.route('/api/meetingsTypes', methods=['GET'])
@needlogin
def get_meetings_types():
    return jsonify({
        'objects': [{
            'type_id': type_id,
            'type_name': type_name
        } for type_id, type_name in app.config['MEETINGS_TYPES']]
    })
