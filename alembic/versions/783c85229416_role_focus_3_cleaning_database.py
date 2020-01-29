"""Role & focus 3 - cleaning database

Revision ID: 783c85229416
Revises: d681d95ed44b
Create Date: 2018-03-13 14:03:51.388335

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "783c85229416"
down_revision = "d681d95ed44b"
branch_labels = None
depends_on = None

connection = op.get_bind()

focus_helper = sa.Table(
    "tmp_role_focus",
    sa.MetaData(),
    sa.Column("role_focus_id", sa.Integer(), nullable=False),
    sa.Column("role_id", sa.Integer(), nullable=False),
    sa.Column("user_id", sa.Integer(), nullable=True),
    sa.Column("focus_name", sa.String(), nullable=True),
)


def upgrade():
    op.drop_table("role")
    op.rename_table("tmp_role", "role")
    op.rename_table("role_focus", "tmp_role_focus")

    role_focus = op.create_table(
        "role_focus",
        sa.Column("role_focus_id", sa.Integer(), nullable=False),
        sa.Column("role_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("focus_name", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(
            ["role_id"], ["role.role_id"], name="fk_focus_role"
        ),
        sa.PrimaryKeyConstraint("role_focus_id"),
    )

    for focus in connection.execute(focus_helper.select()):
        op.bulk_insert(
            role_focus,
            [
                {
                    "role_focus_id": focus.role_id,
                    "role_id": focus.role_id,
                    "user_id": focus.user_id,
                    "focus_name": focus.focus_name,
                }
            ],
        )

    op.drop_table("tmp_role_focus")


def downgrade():
    op.rename_table("role", "tmp_role")
    op.rename_table("role_focus", "tmp_role_focus")

    role_helper = sa.Table(
        "tmp_role",
        sa.MetaData(),
        sa.Column("role_id", sa.Integer(), nullable=False),
        sa.Column("circle_id", sa.Integer(), nullable=False),
        sa.Column("role_name", sa.String(), nullable=True),
        sa.Column("role_purpose", sa.String(), nullable=True),
        sa.Column("role_domain", sa.String(), nullable=True),
        sa.Column("role_accountabilities", sa.String(), nullable=True),
        sa.Column(
            "is_active", sa.Boolean(), server_default="1", nullable=False
        ),
    )

    role_focus = op.create_table(
        "role_focus",
        sa.Column("role_focus_id", sa.Integer(), nullable=False),
        sa.Column("role_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("focus_name", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(
            ["role_id"], ["tmp_role.role_id"], name="fk_focus_role"
        ),
        sa.PrimaryKeyConstraint("role_focus_id"),
    )

    role_table = op.create_table(
        "role",
        sa.Column("role_id", sa.Integer(), nullable=False),
        sa.Column("circle_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("role_name", sa.String(), nullable=True),
        sa.Column("role_purpose", sa.String(), nullable=True),
        sa.Column("role_domain", sa.String(), nullable=True),
        sa.Column("role_accountabilities", sa.String(), nullable=True),
        sa.Column(
            "is_active", sa.Boolean(), server_default="1", nullable=False
        ),
        sa.ForeignKeyConstraint(
            ["circle_id"], ["circle.circle_id"], name="fk_role_circle"
        ),
        sa.PrimaryKeyConstraint("role_id"),
    )

    for role in connection.execute(role_helper.select()):
        for focus in connection.execute(
            focus_helper.select().where(focus_helper.c.role_id == role.role_id)
        ):
            op.bulk_insert(
                role_table,
                [
                    {
                        "role_id": role.role_id,
                        "circle_id": role.circle_id,
                        "user_id": focus.user_id,
                        "role_name": role.role_name.split(" [TO UPDATE]")[0],
                        "role_purpose": role.role_purpose,
                        "role_domain": role.role_domain,
                        "role_accountabilities": role.role_accountabilities,
                        "is_active": role.is_active,
                    }
                ],
            )
        op.bulk_insert(
            role_focus,
            [
                {
                    "role_focus_id": focus.role_id,
                    "role_id": focus.role_id,
                    "user_id": focus.user_id,
                    "focus_name": focus.focus_name,
                }
            ],
        )

    op.drop_table("tmp_role_focus")
