"""Role & focus 4 - duration & election

Revision ID: e97738448c7b
Revises: 783c85229416
Create Date: 2018-03-15 15:31:03.910665

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "e97738448c7b"
down_revision = "783c85229416"
branch_labels = None
depends_on = None

focus_helper = sa.Table(
    "role_focus",
    sa.MetaData(),
    sa.Column("role_focus_id", sa.Integer(), nullable=False),
    sa.Column("role_id", sa.Integer(), nullable=False),
    sa.Column("user_id", sa.Integer(), nullable=True),
)


def upgrade():
    connection = op.get_bind()

    role_focus_user = op.create_table(
        "role_focus_user",
        sa.Column("role_focus_user_id", sa.Integer(), nullable=False),
        sa.Column("role_focus_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("start_date", sa.DateTime(), nullable=True),
        sa.Column("end_date", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["role_focus_id"],
            ["role_focus.role_focus_id"],
            name="fk_user_focus",
        ),
        sa.PrimaryKeyConstraint("role_focus_user_id"),
    )
    with op.batch_alter_table("role", schema=None) as batch_op:
        batch_op.add_column(sa.Column("duration", sa.Integer(), nullable=True))
        batch_op.add_column(
            sa.Column(
                "role_type",
                sa.Enum("leadlink", "elected", "assigned"),
                nullable=True,
            )
        )

    for focus in connection.execute(focus_helper.select()):
        op.bulk_insert(
            role_focus_user,
            [
                {
                    "role_focus_user_id": focus.role_focus_id,
                    "role_focus_id": focus.role_focus_id,
                    "user_id": focus.user_id,
                }
            ],
        )

    with op.batch_alter_table("role_focus", schema=None) as batch_op:
        batch_op.drop_column("user_id")


def downgrade():
    connection = op.get_bind()

    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("role_focus", schema=None) as batch_op:
        batch_op.add_column(sa.Column("user_id", sa.INTEGER(), nullable=True))

    with op.batch_alter_table("role", schema=None) as batch_op:
        batch_op.drop_column("role_type")
        batch_op.drop_column("duration")

    user_focus_helper = sa.Table(
        "role_focus_user",
        sa.MetaData(),
        sa.Column("role_focus_id", sa.Integer(), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
    )

    for user in connection.execute(user_focus_helper.select()):
        op.execute(
            focus_helper.update()
            .where(focus_helper.c.role_focus_id == user.role_focus_id)
            .values({"user_id": user.user_id})
        )

    op.drop_table("role_focus_user")
    # ### end Alembic commands ###
