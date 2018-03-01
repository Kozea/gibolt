import json

from flask import jsonify, request
from sqlalchemy import exc
from unrest import UnRest

from .. import Session, app, session_unrest
from ..routes.auth import needlogin
from ..routes.github import get_a_milestone
from .models import (
    Circle, Item, Label, Milestone_circle, Priority, Report, Report_agenda,
    Report_attendee, Report_checklist, Report_indicator, Report_milestone,
    Role, label_types
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
        Circle.label_id == (request.values.get('label_id'))
        if request.values.get('label_id')
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
    methods=['GET', 'PATCH', 'PUT', 'DELETE'],
    relationships={
        'circle': rest(Circle, only=['circle_name', 'label_id']),
        'attendees': rest(Report_attendee),
        'actions': rest(Report_checklist),
        'indicators': rest(Report_indicator),
        'projects': rest(Report_milestone),
        'agenda': rest(Report_agenda),
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
    Report_attendee,
    methods=['GET', 'PATCH'],
    name='report_attendees',
    query=lambda query: query.filter(
        Report_attendee.report_id == (request.values.get('report_id'))
        if request.values.get('report_id')
        else True,
    ),
    auth=needlogin
)

rest(
    Report_checklist,
    methods=['GET', 'PATCH'],
    name='report_checklists',
    query=lambda query: query.filter(
        Report_checklist.report_id == (request.values.get('report_id'))
        if request.values.get('report_id')
        else True,
    ),
    auth=needlogin
)

rest(
    Report_indicator,
    methods=['GET', 'PATCH'],
    name='report_indicators',
    query=lambda query: query.filter(
        Report_indicator.report_id == (request.values.get('report_id'))
        if request.values.get('report_id')
        else True,
    ),
    auth=needlogin
)

rest(
    Report_milestone,
    methods=['GET', 'PATCH'],
    name='report_milestones',
    query=lambda query: query.filter(
        Report_milestone.report_id == (request.values.get('report_id'))
        if request.values.get('report_id')
        else True,
    ),
    auth=needlogin
)

rest(
    Report_agenda,
    methods=['GET', 'PUT'],
    name='report_agenda',
    query=lambda query: query.filter(
        Report_agenda.report_id == (request.values.get('report_id'))
        if request.values.get('report_id')
        else True,
    ),
    auth=needlogin
)


@app.route('/api/reports', methods=['POST'])
@needlogin
def create_report():
    response_object = {
        'status': 'error',
        'message': 'Invalid payload.'
    }
    data = request.get_json()
    circle_id = data.get('circle_id')
    report_type = data.get('report_type')
    author_id = data.get('author_id')
    report_content = json.loads(data.get('content'))
    content = report_content.get('content')
    attendees = report_content.get('attendees')
    actions = report_content.get('actions')
    indicators = report_content.get('indicators')
    projects = report_content.get('projects')
    tickets = report_content.get('agenda')
    try:
        new_report = Report(
            circle_id=circle_id,
            report_type=report_type,
            author_id=author_id,
            content=content
        )
        session.add(new_report)
        session.flush()

        for attendee in attendees:
            new_attendee = Report_attendee(
                report_id=new_report.report_id,
                user_id=attendee.get('user_id'),
                user=json.dumps(attendee),
                is_present=attendee.get('checked')
            )
            session.add(new_attendee)
            session.flush()

        for action in actions:
            new_action = Report_checklist(
                report_id=new_report.report_id,
                item_id=action.get('id'),
                item=json.dumps(action),
                is_checked=action.get('checked')
            )
            session.add(new_action)
            session.flush()

        for indicator in indicators:
            new_indicator = Report_indicator(
                report_id=new_report.report_id,
                item_id=indicator.get('id'),
                item=json.dumps(action),
                value=indicator.get('value')
            )
            session.add(new_indicator)
            session.flush()

        for project in projects:
            new_project = Report_milestone(
                report_id=new_report.report_id,
                milestone_number=project.get('number'),
                repo_name=project.get('repo'),
                milestone=json.dumps(project),
                comment=project.get('comment')
            )
            session.add(new_project)
            session.flush()

        for ticket in tickets:
            new_ticket = Report_agenda(
                report_id=new_report.report_id,
                ticket_id=ticket.get('ticket_id'),
                ticket=json.dumps(ticket),
                comment=ticket.get('meeting_comment')
            )
            session.add(new_ticket)
            session.flush()

        session.commit()
    except (exc.IntegrityError) as e:
        print(e)
        session.rollback()
        return jsonify(response_object), 400

    response_object = {
        'objects': [{
            'report_id': new_report.report_id,
            'circle_id': new_report.circle_id,
            'report_type': new_report.report_type,
            'created_at': new_report.created_at,
            'author_id': new_report.author_id,
            'content': new_report.content,
            'modified_at': new_report.modified_at,
            'modified_by': new_report.modified_by
        }],
        'occurences': 1 if new_report else 0,
        'primary_keys': ['report_id']}
    return jsonify(response_object)


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
                labels_data['priority_id'] = label.priorities.priority_id
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
            'priority_id': new_priority.priority_id,
            'label_id': new_priority.label_id,
            'value': new_priority.value
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
            'priority_id': priority.priority_id,
            'label_id': priority.label_id,
            'value': priority.value
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


@app.route(
    '/api/milestone_circles/<string:repo_name>/<int:milestone_number>',
    methods=['POST'])
@needlogin
def update_milestones_circles(repo_name, milestone_number):
    circles_list = request.get_json()
    existing_milestones_circles = session.query(Milestone_circle).filter(
        Milestone_circle.milestone_number == milestone_number,
        Milestone_circle.repo_name == repo_name
        ).all()

    try:
        # deletion
        for existing_assoc in existing_milestones_circles:
            if existing_assoc.circle_id not in circles_list:
                session.query(Milestone_circle).filter(
                    Milestone_circle.milestone_number == milestone_number,
                    Milestone_circle.repo_name == repo_name,
                    Milestone_circle.circle_id == existing_assoc.circle_id
                ).delete()

        # creation
        for circle in circles_list:
            circle_id = circle.get("circle_id")
            milestone_circle = session.query(Milestone_circle).filter(
                Milestone_circle.milestone_number == milestone_number,
                Milestone_circle.repo_name == repo_name,
                Milestone_circle.circle_id == circle_id
            ).first()
            if not milestone_circle:
                new_milestone_circle = Milestone_circle(
                    circle_id=circle_id,
                    milestone_number=milestone_number,
                    repo_name=repo_name
                )
                session.add(new_milestone_circle)

        session.commit()
        return get_a_milestone(repo_name, milestone_number)

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
