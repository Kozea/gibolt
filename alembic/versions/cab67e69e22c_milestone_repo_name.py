"""milestone repo_name

Revision ID: cab67e69e22c
Revises: 3d7cf7c8aa4c
Create Date: 2018-01-16 14:50:35.378389

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "cab67e69e22c"
down_revision = "3d7cf7c8aa4c"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_table("milestone_circle")
    op.create_table(
        "milestone_circle",
        sa.Column("circle_id", sa.Integer(), nullable=False),
        sa.Column("milestone_number", sa.Integer(), nullable=False),
        sa.Column("repo_name", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(["circle_id"], ["circle.circle_id"]),
        sa.PrimaryKeyConstraint("circle_id", "milestone_number", "repo_name"),
    )


def downgrade():
    op.drop_table("milestone_circle")
    op.create_table(
        "milestone_circle",
        sa.Column("circle_id", sa.Integer(), nullable=False),
        sa.Column("milestone_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["circle_id"], ["circle.circle_id"]),
        sa.PrimaryKeyConstraint("circle_id", "milestone_id"),
    )
