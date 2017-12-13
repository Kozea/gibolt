from unrest import UnRest

from .. import app, session_unrest
from ..routes.auth import needlogin
from .models import Circle, Item, Milestone_circle, Report, Role

# Declare rest endpoints for gibolt Database
rest = UnRest(app, session_unrest)

rest(
    Circle,
    methods=['GET', 'PUT', 'POST', 'DELETE'],
    relationships={
        'roles': rest(Role, only=['role_id', 'user_id']),
    },
    name='circles'
)

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
