from datetime import date, datetime

from flask import jsonify, request
from sqlalchemy import and_, exc, func, or_
from unrest import UnRest

from .. import app, session_unrest
from ..routes.auth import needlogin
from ..routes.github import get_a_milestone
from .models import (
    Circle,
    Item,
    Label,
    Milestone_circle,
    Priority,
    Report,
    Report_agenda,
    Report_attendee,
    Report_checklist,
    Report_indicator,
    Report_milestone,
    Role,
    Role_focus,
    Role_focus_user,
    label_types,
)

# Declare rest endpoints for gibolt Database
rest = UnRest(app, session_unrest)
session = session_unrest


role_focus_users = rest(
    Role_focus_user,
    methods=['GET', 'PATCH'],
    name='role_focus_users',
    query=lambda query: query.filter(
        Role_focus_user.role_focus_id == (request.values.get('role_focus_id'))
        if request.values.get('role_focus_id')
        else True,
        and_(
            request.values.get('active_focus_user') == True,
            or_(
                func.DATE(Role_focus_user.end_date) == None,
                func.DATE(Role_focus_user.end_date) >= date.today(),
            ),
        )
        if request.values.get('active_focus_user')
        else True,
    ).order_by(
        Role_focus_user.end_date.desc(),
        Role_focus_user.start_date.desc(),
        Role_focus_user.role_focus_user_id.desc(),
    ),
    auth=needlogin,
)


@role_focus_users.declare('POST', True)
def post_role_focus_user(payload, role_focus_user_id=None):
    role_focus_id = payload.get('role_focus_id')

    future_focus_user = (
        session.query(Role_focus_user)
        .filter(
            Role_focus_user.role_focus_id == role_focus_id,
            func.DATE(Role_focus_user.start_date) > date.today(),
        )
        .first()
    )
    if future_focus_user:
        rest.raise_error(400, 'A valid focus user alredy exists.')

    start_date = datetime.strptime(payload.get('start_date'), '%Y-%m-%d')
    try:
        existing_focus_users = (
            session.query(Role_focus_user)
            .filter(
                Role_focus_user.role_focus_id == role_focus_id,
                or_(
                    func.DATE(Role_focus_user.end_date) == None,
                    func.DATE(Role_focus_user.end_date) >= date.today(),
                ),
            )
            .all()
        )
        for user in existing_focus_users:
            user.end_date = start_date if start_date else date.today()
            session.flush()

        new_focus_user = Role_focus_user(
            role_focus_id=role_focus_id,
            start_date=start_date if start_date else None,
            user_id=payload.get('user_id'),
        )
        session.add(new_focus_user)
        session.commit()

    except (exc.IntegrityError) as e:
        session.rollback()
        rest.raise_error(400, 'Invalid payload.')

    return role_focus_users.get(
        {}, role_focus_user_id=new_focus_user.role_focus_user_id
    )


rest(
    Item,
    methods=['GET', 'PATCH', 'PUT', 'POST', 'DELETE'],
    name='items',
    query=lambda query: query.filter(
        Item.role_focus_id == (request.values.get('role_focus_id'))
        if request.values.get('role_focus_id')
        else True
    ),
    auth=needlogin,
)


role_focuses = rest(
    Role_focus,
    methods=['GET', 'PATCH', 'DELETE'],
    name='role_focuses',
    relationships={
        'role_focus_users': role_focus_users,
        'items': rest(Item),
        'role': rest(
            Role,
            relationships={
                'circle': rest(
                    Circle, relationships={'circle_parent': rest(Circle)}
                )
            },
        ),
    },
    query=lambda query: query.filter(
        Role_focus.role_id == (request.values.get('role_id'))
        if request.values.get('role_id')
        else True
    ),
    auth=needlogin,
)


@role_focuses.declare('POST', True)
def post_role_focus(payload, role_focus_id=None):
    try:
        new_role_focus = Role_focus(
            role_id=payload.get('role_id'),
            focus_name=payload.get('focus_name'),
            duration=payload.get('duration'),
        )
        session.add(new_role_focus)
        session.flush()

        start_date = payload.get('start_date')
        new_focus_user = Role_focus_user(
            role_focus_id=new_role_focus.role_focus_id,
            start_date=datetime.strptime(start_date, '%Y-%m-%d')
            if start_date
            else None,
            user_id=payload.get('user_id'),
        )
        session.add(new_focus_user)
        session.commit()

    except (exc.IntegrityError, AttributeError) as e:
        session.rollback()
        rest.raise_error(400, 'Invalid payload.')
    return role_focuses.get({}, role_focus_id=new_role_focus.role_focus_id)


only_role_focuses = rest(
    Role_focus,
    methods=['GET'],
    name='only_role_focuses',
    relationships={'role_focus_users': role_focus_users, 'items': rest(Item)},
    query=lambda query: query.filter(
        Role_focus.role_id == (request.values.get('role_id'))
        if request.values.get('role_id')
        else True
    ),
    auth=needlogin,
)


roles = rest(
    Role,
    methods=['GET', 'PATCH', 'PUT', 'DELETE'],
    name='roles',
    relationships={'role_focuses': only_role_focuses},
    query=lambda query: query.filter(
        Role.circle_id == (request.values.get('circle_id'))
        if request.values.get('circle_id')
        else True,
        Role.is_active == (request.values.get('is_active'))
        if request.values.get('is_active')
        else True,
    ),
    auth=needlogin,
)


@roles.declare('POST', True)
def post_roles(payload, role_id=None):
    try:
        new_role = Role(
            circle_id=payload.get('circle_id'),
            role_name=payload.get('role_name'),
            role_purpose=payload.get('role_purpose'),
            role_domain=payload.get('role_domain'),
            role_accountabilities=payload.get('role_accountabilities'),
            role_type=payload.get('role_type'),
        )
        session.add(new_role)
        session.flush()

        if payload.get('user_id'):
            new_focus = Role_focus(
                role_id=new_role.role_id,
                focus_name=payload.get('focus_name'),
                duration=payload.get('duration'),
            )
            session.add(new_focus)
            session.flush()

            start_date = payload.get('start_date')
            new_role_focus = Role_focus_user(
                role_focus_id=new_focus.role_focus_id,
                start_date=datetime.strptime(start_date, '%Y-%m-%d')
                if start_date
                else None,
                user_id=payload.get('user_id'),
            )
            session.add(new_role_focus)
        session.commit()

    except (exc.IntegrityError) as e:
        session.rollback()
        rest.raise_error(400, 'Invalid payload.')
    return roles.get({}, role_id=new_role.role_id)


rest(
    Circle,
    methods=['GET', 'PATCH', 'POST', 'DELETE'],
    relationships={
        'circle_parent': rest(Circle),
        'circle_children': rest(Circle, relationships={'roles': roles}),
        'roles': roles,
        'circle_milestones': rest(Milestone_circle),
        'label': rest(Label),
    },
    name='circles',
    query=lambda query: query.filter(
        Circle.label_id == (request.values.get('label_id'))
        if request.values.get('label_id')
        else True
    ),
    auth=needlogin,
)


report_unrest = rest(
    Report,
    methods=['GET'],
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
        Report.report_id <= int(request.values.get('from_id'))
        if request.values.get('from_id')
        else True,
    )
    .order_by(Report.created_at.desc(), Report.report_id.desc())
    .limit(
        int(request.values.get('limit'))
        if request.values.get('limit')
        else None
    ),
    auth=needlogin,
)


@report_unrest.declare('POST', True)
def post_report(payload, report_id=None):
    circle_id = payload.get('circle_id')
    report_type = payload.get('report_type')
    author_id = payload.get('author_id')
    content = payload.get('content')
    attendees = payload.get('attendees')
    actions = payload.get('actions')
    indicators = payload.get('indicators')
    projects = payload.get('projects')
    tickets = payload.get('agenda')
    is_submitted = payload.get('is_submitted')
    try:
        new_report = Report(
            circle_id=circle_id,
            report_type=report_type,
            author_id=author_id,
            content=content,
            is_submitted=is_submitted,
        )
        session.add(new_report)
        session.flush()

        for attendee in attendees:
            new_attendee = Report_attendee(
                report_id=new_report.report_id,
                user_id=attendee.get('user_id'),
                user=attendee.get('user'),
                checked=attendee.get('checked'),
            )
            session.add(new_attendee)
            session.flush()

        for action in actions:
            new_action = Report_checklist(
                report_id=new_report.report_id,
                item_id=action.get('item_id'),
                content=action.get('content'),
                checked=action.get('checked'),
            )
            session.add(new_action)
            session.flush()

        for indicator in indicators:
            new_indicator = Report_indicator(
                report_id=new_report.report_id,
                item_id=indicator.get('item_id'),
                content=indicator.get('content'),
                value=indicator.get('value'),
            )
            session.add(new_indicator)
            session.flush()

        for project in projects:
            new_project = Report_milestone(
                report_id=new_report.report_id,
                milestone_number=project.get('number'),
                repo_name=project.get('repo'),
                milestone=project,
            )
            session.add(new_project)
            session.flush()

        for ticket in tickets:
            new_ticket = Report_agenda(
                report_id=new_report.report_id,
                ticket_id=ticket.get('ticket_id'),
                ticket=ticket,
            )
            session.add(new_ticket)
            session.flush()

        session.commit()
    except (exc.IntegrityError) as e:
        session.rollback()
        rest.raise_error(400, 'Invalid payload.')
    return report_unrest.get({}, report_id=new_report.report_id)


def report_tables(payload, report_id):
    attendees = payload.get('attendees')
    actions = payload.get('actions')
    indicators = payload.get('indicators')
    projects = payload.get('projects')
    tickets = payload.get('agenda')

    for attendee in attendees:
        report_attendee = (
            session.query(Report_attendee)
            .filter(
                Report_attendee.report_id == report_id,
                Report_attendee.user_id == attendee.get('user_id'),
            )
            .first()
        )
        if report_attendee:
            report_attendee.user = attendee.get('user')
            report_attendee.checked = attendee.get('checked')
        session.flush()

    for action in actions:
        report_checklist = (
            session.query(Report_checklist)
            .filter(
                Report_checklist.report_id == report_id,
                Report_checklist.item_id == action.get('item_id'),
            )
            .first()
        )
        if report_checklist:
            report_checklist.content = action.get('content')
            report_checklist.checked = action.get('checked')
        session.flush()

    for indicator in indicators:
        report_indicator = (
            session.query(Report_indicator)
            .filter(
                Report_indicator.report_id == report_id,
                Report_indicator.item_id == indicator.get('item_id'),
            )
            .first()
        )
        if report_indicator:
            report_indicator.content = indicator.get('content')
            report_indicator.value = indicator.get('value')
        session.flush()

    for project in projects:
        report_milestone = (
            session.query(Report_milestone)
            .filter(
                Report_milestone.report_id == report_id,
                Report_milestone.milestone_number == project.get('number'),
                Report_milestone.repo_name == project.get('repo'),
            )
            .first()
        )
        if report_milestone:
            report_milestone.milestone = project
        session.flush()

    for ticket in tickets:
        report_agenda = (
            session.query(Report_agenda)
            .filter(
                Report_agenda.report_id == report_id,
                Report_agenda.ticket_id == ticket.get('ticket_id'),
            )
            .first()
        )
        if report_agenda:
            report_agenda.ticket = ticket
        session.flush()
    return None


@report_unrest.declare('PUT', True)
def update_report(payload, report_id):
    if not report_id:
        rest.raise_error(400, 'Invalid payload.')

    report = (
        session.query(Report).filter(Report.report_id == report_id).first()
    )
    if not report:
        rest.raise_error(400, 'Invalid payload.')

    try:
        report.modified_by = payload.get('modified_by')
        report.content = payload.get('content')
        report.is_submitted = payload.get('is_submitted')
        session.flush()
        report_tables(payload, report_id)
        session.commit()
    except (exc.IntegrityError) as e:
        session.rollback()
        rest.raise_error(400, 'Invalid payload.')

    return report_unrest.get({}, report_id=report.report_id)


@app.route('/api/labels', methods=['GET'])
@needlogin
def labels():
    labels_list = {}
    for label_type in label_types:
        labels_list[label_type] = []
        labels = (
            session.query(Label).filter(Label.label_type == label_type).all()
        )

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
    relationships={'priorities': rest(Priority)},
    name='labels',
    auth=needlogin,
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
        response = [
            {
                'priority_id': new_priority.priority_id,
                'label_id': new_priority.label_id,
                'value': new_priority.value,
            }
        ]
        objects = {
            'objects': response,
            'occurences': 1,
            'primary_keys': ['priority_id'],
        }
        return jsonify(objects)
    except (exc.IntegrityError) as e:
        session.rollback()
        # in this case, the associated label must be deleted
        # to ensure there are no priority labels w/o priority
        session.query(Label).filter(Label.label_id == label_id).delete()
        session.commit()
        response_object = {'status': 'error', 'message': 'Invalid payload.'}
        return jsonify(response_object), 400
    except (exc.OperationalError, ValueError) as e:
        session.rollback()
        response_object = {
            'status': 'error',
            'message': 'Error. Please try again or contact the administrator.',
        }
        return jsonify(response_object), 500


@app.route('/api/priorities/<int:priority_id>', methods=['PATCH'])
@needlogin
def update_priority(priority_id):
    data = request.get_json()
    new_value = data.get('value')
    try:
        priority = (
            session.query(Priority)
            .filter(Priority.priority_id == priority_id)
            .first()
        )
        priority.value = new_value
        session.commit()
        response = [
            {
                'priority_id': priority.priority_id,
                'label_id': priority.label_id,
                'value': priority.value,
            }
        ]
        objects = {
            'objects': response,
            'occurences': 1,
            'primary_keys': ['priority_id'],
        }
        return jsonify(objects)
    except (exc.IntegrityError, exc.OperationalError, ValueError) as e:
        session.rollback()
        response_object = {
            'status': 'error',
            'message': 'Error. Please try again or contact the administrator.',
        }
        return jsonify(response_object), 500


@app.route(
    '/api/milestone_circles/<string:repo_name>/<int:milestone_number>',
    methods=['POST'],
)
@needlogin
def update_milestones_circles(repo_name, milestone_number):
    circles_list = request.get_json()
    existing_milestones_circles = (
        session.query(Milestone_circle)
        .filter(
            Milestone_circle.milestone_number == milestone_number,
            Milestone_circle.repo_name == repo_name,
        )
        .all()
    )

    try:
        # deletion
        for existing_assoc in existing_milestones_circles:
            if existing_assoc.circle_id not in circles_list:
                session.query(Milestone_circle).filter(
                    Milestone_circle.milestone_number == milestone_number,
                    Milestone_circle.repo_name == repo_name,
                    Milestone_circle.circle_id == existing_assoc.circle_id,
                ).delete()

        # creation
        for circle in circles_list:
            circle_id = circle.get("circle_id")
            milestone_circle = (
                session.query(Milestone_circle)
                .filter(
                    Milestone_circle.milestone_number == milestone_number,
                    Milestone_circle.repo_name == repo_name,
                    Milestone_circle.circle_id == circle_id,
                )
                .first()
            )
            if not milestone_circle:
                new_milestone_circle = Milestone_circle(
                    circle_id=circle_id,
                    milestone_number=milestone_number,
                    repo_name=repo_name,
                )
                session.add(new_milestone_circle)

        session.commit()
        return get_a_milestone(repo_name, milestone_number)

    except (exc.IntegrityError, exc.OperationalError, ValueError) as e:
        session.rollback()
        response_object = {
            'status': 'error',
            'message': 'Error during Milestone_circle table update.',
        }
        code = 400

    return jsonify(response_object), code


rest(
    Milestone_circle,
    methods=['DELETE'],
    name='milestone_circles',
    auth=needlogin,
)

rest(
    Report_milestone,
    methods=['DELETE'],
    name='report_milestones',
    auth=needlogin,
)


@app.route('/api/meetingsTypes', methods=['GET'])
@needlogin
def get_meetings_types():
    return jsonify(
        {
            'objects': [
                {'type_id': type_id, 'type_name': type_name}
                for type_id, type_name in app.config['MEETINGS_TYPES']
            ]
        }
    )
