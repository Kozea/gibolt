"""Role & focus 2 - item update

Revision ID: d681d95ed44b
Revises: b588680b9f75
Create Date: 2018-03-13 13:00:21.727976

"""
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "d681d95ed44b"
down_revision = "b588680b9f75"
branch_labels = None
depends_on = None

item_helper = sa.Table(
    "item",
    sa.MetaData(),
    sa.Column("item_id", sa.Integer(), nullable=False),
    sa.Column("role_id", sa.Integer(), nullable=False),
    sa.Column("item_type", sa.String(), nullable=True),
    sa.Column("content", sa.Text(), nullable=True),
)

item_helper2 = sa.Table(
    "item",
    sa.MetaData(),
    sa.Column("item_id", sa.Integer(), nullable=False),
    sa.Column("role_focus_id", sa.Integer(), nullable=False),
    sa.Column("item_type", sa.String(), nullable=True),
    sa.Column("content", sa.Text(), nullable=True),
)


def upgrade():
    connection = op.get_bind()

    tmp_item = op.create_table(
        "tmp_item",
        sa.Column("item_id", sa.Integer(), nullable=False),
        sa.Column("role_focus_id", sa.Integer(), nullable=False),
        sa.Column("item_type", sa.String(), nullable=True),
        sa.Column("content", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(
            ["role_focus_id"],
            ["role_focus.role_focus_id"],
            name="fk_item_rolefocus",
        ),
        sa.PrimaryKeyConstraint("item_id"),
    )

    for item in connection.execute(item_helper.select()):
        op.bulk_insert(
            tmp_item,
            [
                {
                    "item_id": item.item_id,
                    "role_focus_id": item.role_id,
                    "item_type": item.item_type,
                    "content": item.content,
                }
            ],
        )

    op.drop_table("item")
    op.rename_table("tmp_item", "item")


def downgrade():
    connection = op.get_bind()

    tmp_item = op.create_table(
        "tmp_item",
        sa.Column("item_id", sa.Integer(), nullable=False),
        sa.Column("role_id", sa.Integer(), nullable=False),
        sa.Column("item_type", sa.String(), nullable=True),
        sa.Column("content", sa.Text(), nullable=True),
        sa.Column(
            "is_active", sa.Boolean(), server_default="1", nullable=False
        ),
        sa.Column("value_type", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(
            ["role_id"], ["role.role_id"], name="fk_item_role"
        ),
        sa.PrimaryKeyConstraint("item_id"),
    )

    for item in connection.execute(item_helper2.select()):
        op.bulk_insert(
            tmp_item,
            [
                {
                    "item_id": item.item_id,
                    "role_id": item.role_focus_id,
                    "item_type": item.item_type,
                    "content": item.content,
                }
            ],
        )

    op.drop_table("item")
    op.rename_table("tmp_item", "item")
