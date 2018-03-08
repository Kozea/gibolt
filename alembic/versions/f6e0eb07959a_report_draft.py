"""report draft

Revision ID: f6e0eb07959a
Revises: 2e713373295b
Create Date: 2018-03-08 10:09:45.220153

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f6e0eb07959a'
down_revision = '2e713373295b'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('report', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_submitted', sa.Boolean(), server_default='0', nullable=False))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('report', schema=None) as batch_op:
        batch_op.drop_column('is_submitted')

    # ### end Alembic commands ###