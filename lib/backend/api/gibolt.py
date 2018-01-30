from flask import jsonify, request
from sqlalchemy import exc
from unrest import UnRest

from .. import Session, app, session_unrest
from ..routes.auth import needlogin
from .models import (
    Circle, Item, Label, Milestone_circle, Priority, Report, Role, label_types
)

session = Session()


# Declare rest endpoints for gibolt Database
rest = UnRest(app, session_unrest)

rest(
    Circle,
    methods=['GET', 'PUT', 'POST', 'DELETE'],
    relationships={
        'roles': rest(Role, only=['role_id', 'role_name', 'user_id']),
        'circle_milestones': rest(Milestone_circle),
        'label': rest(Label)
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
    auth=needlogin
)

rest(
    Report,
    methods=['GET', 'PATCH', 'PUT', 'POST', 'DELETE'],
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
    ).order_by(
        Report.created_at.desc(),
        Report.report_id.desc()
    ).limit(
        int(request.values.get('limit'))
        if request.values.get('limit')
        else None
    ),
    auth=needlogin
)

rest(
    Item,
    methods=['GET', 'PUT', 'POST', 'DELETE'],
    name='items',
    query=lambda query: query.filter(
        Item.role_id == (request.values.get('role_id'))
        if request.values.get('role_id')
        else True,
    ),
    auth=needlogin
)


@app.route('/api/labels', methods=['GET'])
@needlogin
def labels():
    labels_list = {}
    for label_type in label_types:
        labels_list[label_type] = []
        labels = session.query(Label).filter(
            Label.label_type == label_type).all()

        for label in labels:
            labels_data = {
                'text': label.text,
                'color': label.color,
                'label_id': label.label_id,
            }
            if label.priorities:
                labels_data['priority'] = label.priorities.value
            labels_list[label_type].append(labels_data)
    return jsonify({'objects': labels_list})


rest(
    Label,
    methods=['PUT', 'POST', 'PATCH', 'DELETE'],
    relationships={
        'priorities': rest(Priority)
    },
    name='labels',
    auth=needlogin
)


@app.route('/api/priorities', methods=['POST'])
@needlogin
def add_priority():
    data = request.get_json()
    label_id = data.get('label_id')
    value = data.get('value')
    try:
        new_priority = Priority(label_id=label_id, value=value)
        session.add(new_priority)
        session.commit()
        response = [{
            "priority_id": new_priority.priority_id,
            "label_id": new_priority.label_id,
            "value": new_priority.value
        }]
        objects = {
            'objects': response,
            'occurences': 1,
            'primary_keys': ['priority_id']}
        return jsonify(objects)
    except (exc.IntegrityError) as e:
        session.rollback()
        # in this case, the associated label must be deleted
        # to ensure there are no priority labels w/o priority
        session.query(Label).filter(Label.label_id == label_id).delete()
        session.commit()
        response_object = {
            'status': 'error',
            'message': 'Invalid payload.'
        }
        return jsonify(response_object), 400
    except (exc.OperationalError, ValueError) as e:
        session.rollback()
        response_object = {
            'status': 'error',
            'message': 'Error. Please try again or contact the administrator.'
        }
        return jsonify(response_object), 500


@app.route('/api/priorities/<int:priority_id>', methods=['PATCH'])
@needlogin
def update_priority(priority_id):
    data = request.get_json()
    new_value = data.get('value')
    try:
        priority = session.query(Priority).filter(
            Priority.priority_id == priority_id).first()
        priority.value = new_value
        session.commit()
        response = [{
            "priority_id": priority.priority_id,
            "label_id": priority.label_id,
            "value": priority.value
        }]
        objects = {
            'objects': response,
            'occurences': 1,
            'primary_keys': ['priority_id']}
        return jsonify(objects)
    except (exc.IntegrityError, exc.OperationalError, ValueError) as e:
        session.rollback()
        response_object = {
            'status': 'error',
            'message': 'Error. Please try again or contact the administrator.'
        }
        return jsonify(response_object), 500


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
