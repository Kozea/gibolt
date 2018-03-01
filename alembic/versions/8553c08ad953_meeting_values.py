"""meeting values

Revision ID: 8553c08ad953
Revises: 0cabf3e7bfb9
Create Date: 2018-02-28 16:47:13.294054

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8553c08ad953'
down_revision = '0cabf3e7bfb9'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('report_agenda',
    sa.Column('report_id', sa.Integer(), nullable=False),
    sa.Column('ticket_id', sa.Integer(), nullable=False),
    sa.Column('comment', sa.String(), nullable=True),
    sa.ForeignKeyConstraint(['report_id'], ['report.report_id'], ),
    sa.PrimaryKeyConstraint('report_id', 'ticket_id')
    )
    op.create_table('report_attendee',
    sa.Column('report_id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('is_present', sa.Boolean(), server_default='1', nullable=False),
    sa.ForeignKeyConstraint(['report_id'], ['report.report_id'], ),
    sa.PrimaryKeyConstraint('report_id', 'user_id')
    )
    op.create_table('report_milestone',
    sa.Column('report_id', sa.Integer(), nullable=False),
    sa.Column('milestone_number', sa.Integer(), nullable=False),
    sa.Column('repo_name', sa.String(), nullable=False),
    sa.Column('comment', sa.String(), nullable=True),
    sa.ForeignKeyConstraint(['report_id'], ['report.report_id'], ),
    sa.PrimaryKeyConstraint('report_id', 'milestone_number', 'repo_name')
    )
    op.create_table('report_checklist',
    sa.Column('report_id', sa.Integer(), nullable=False),
    sa.Column('item_id', sa.Integer(), nullable=False),
    sa.Column('is_checked', sa.Boolean(), server_default='1', nullable=False),
    sa.ForeignKeyConstraint(['item_id'], ['item.item_id'], ),
    sa.ForeignKeyConstraint(['report_id'], ['report.report_id'], ),
    sa.PrimaryKeyConstraint('report_id', 'item_id')
    )
    op.create_table('report_indicator',
    sa.Column('report_id', sa.Integer(), nullable=False),
    sa.Column('item_id', sa.Integer(), nullable=False),
    sa.Column('value', sa.String(), nullable=True),
    sa.ForeignKeyConstraint(['item_id'], ['item.item_id'], ),
    sa.ForeignKeyConstraint(['report_id'], ['report.report_id'], ),
    sa.PrimaryKeyConstraint('report_id', 'item_id')
    )
    with op.batch_alter_table('item', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False))
        batch_op.add_column(sa.Column('value_type', sa.String(), nullable=True))

    with op.batch_alter_table('label', schema=None) as batch_op:
        batch_op.create_unique_constraint('text', ['text'])
        batch_op.drop_constraint('text_unique', type_='unique')

    with op.batch_alter_table('milestone_circle', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False))

    with op.batch_alter_table('role', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('role', schema=None) as batch_op:
        batch_op.drop_column('is_active')

    with op.batch_alter_table('milestone_circle', schema=None) as batch_op:
        batch_op.drop_column('is_active')

    with op.batch_alter_table('label', schema=None) as batch_op:
        batch_op.create_unique_constraint('text_unique', ['text'])
        batch_op.drop_constraint('text', type_='unique')

    with op.batch_alter_table('item', schema=None) as batch_op:
        batch_op.drop_column('value_type')
        batch_op.drop_column('is_active')

    op.drop_table('report_indicator')
    op.drop_table('report_checklist')
    op.drop_table('report_milestone')
    op.drop_table('report_attendee')
    op.drop_table('report_agenda')
    # ### end Alembic commands ###
