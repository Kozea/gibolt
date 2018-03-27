"""focus duration

Revision ID: a67e81d146d8
Revises: e97738448c7b
Create Date: 2018-03-27 10:27:42.937115

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a67e81d146d8'
down_revision = 'e97738448c7b'
branch_labels = None
depends_on = None

role_helper = sa.Table(
    'role',
    sa.MetaData(),
    sa.Column('role_id', sa.Integer(), nullable=False),
    sa.Column('duration', sa.Integer(), nullable=False),
)

focus_helper = sa.Table(
    'role_focus',
    sa.MetaData(),
    sa.Column('role_id', sa.Integer(), nullable=False),
    sa.Column('duration', sa.Integer(), nullable=False),
)
connection = op.get_bind()


def upgrade():
    with op.batch_alter_table('role_focus', schema=None) as batch_op:
        batch_op.add_column(sa.Column('duration', sa.Integer(), nullable=True))
        batch_op.alter_column('focus_name',
               existing_type=sa.VARCHAR(),
               nullable=False)

    for role in connection.execute(role_helper.select()):
        op.execute(
           focus_helper.update().\
               where(focus_helper.c.role_id == role.role_id).\
               values({'duration':role.duration})
        )


    with op.batch_alter_table('role', schema=None) as batch_op:
        batch_op.drop_column('duration')


def downgrade():
    with op.batch_alter_table('role', schema=None) as batch_op:
        batch_op.add_column(sa.Column('duration', sa.INTEGER(), nullable=True))

    for role in connection.execute(role_helper.select()):
        result = connection.execute(focus_helper.select().where(
            focus_helper.c.role_id == role.role_id
        ))
        focus = result.fetchone()
        op.execute(
           role_helper.update().\
               where(role_helper.c.role_id == focus.role_id).\
               values({'duration':focus.duration})
        )

    with op.batch_alter_table('role_focus', schema=None) as batch_op:
        batch_op.alter_column('focus_name',
               existing_type=sa.VARCHAR(),
               nullable=True)
        batch_op.drop_column('duration')
