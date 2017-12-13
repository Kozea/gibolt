from unrest import UnRest

from .. import app, session_unrest
from .models import Circle, Report, Role

# Declare rest endpoints for gibolt Database
rest = UnRest(app, session_unrest)
rest(
    Circle,
    methods=['GET', 'PUT', 'POST', 'DELETE'],
    relationships={
        'roles': rest(Role, only=['role_id']),
    },
    name='circles'
)
rest(Role, methods=['GET', 'PUT', 'POST', 'DELETE'], name='roles')
rest(Report, methods=['GET', 'PUT', 'POST', 'DELETE'], name='reports')
