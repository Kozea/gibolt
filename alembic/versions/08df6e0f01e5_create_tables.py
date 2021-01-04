"""create tables

Revision ID: 08df6e0f01e5
Revises: 
Create Date: 2018-01-02 13:19:32.699387

"""
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "08df6e0f01e5"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "circle",
        sa.Column("circle_id", sa.Integer(), nullable=False),
        sa.Column("parent_circle_id", sa.Integer(), nullable=True),
        sa.Column("circle_name", sa.String(), nullable=True),
        sa.Column("circle_purpose", sa.String(), nullable=True),
        sa.Column("circle_domain", sa.String(), nullable=True),
        sa.Column("circle_accountabilities", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(["parent_circle_id"], ["circle.circle_id"]),
        sa.PrimaryKeyConstraint("circle_id"),
        sa.UniqueConstraint("circle_name"),
    )
    op.create_table(
        "milestone_circle",
        sa.Column("circle_id", sa.Integer(), nullable=False),
        sa.Column("milestone_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["circle_id"], ["circle.circle_id"]),
        sa.PrimaryKeyConstraint("circle_id", "milestone_id"),
    )
    op.create_table(
        "report",
        sa.Column("report_id", sa.Integer(), nullable=False),
        sa.Column("circle_id", sa.Integer(), nullable=False),
        sa.Column("report_type", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("author_id", sa.Integer(), nullable=True),
        sa.Column("content", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["circle_id"], ["circle.circle_id"]),
        sa.PrimaryKeyConstraint("report_id"),
    )
    op.create_table(
        "role",
        sa.Column("role_id", sa.Integer(), nullable=False),
        sa.Column("circle_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("role_name", sa.String(), nullable=True),
        sa.Column("role_purpose", sa.String(), nullable=True),
        sa.Column("role_domain", sa.String(), nullable=True),
        sa.Column("role_accountabilities", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(["circle_id"], ["circle.circle_id"]),
        sa.PrimaryKeyConstraint("role_id"),
    )
    op.create_table(
        "item",
        sa.Column("item_id", sa.Integer(), nullable=False),
        sa.Column("role_id", sa.Integer(), nullable=False),
        sa.Column("item_type", sa.String(), nullable=True),
        sa.Column("content", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["role_id"], ["role.role_id"]),
        sa.PrimaryKeyConstraint("item_id"),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("item")
    op.drop_table("role")
    op.drop_table("report")
    op.drop_table("milestone_circle")
    op.drop_table("circle")
    # ### end Alembic commands ###
