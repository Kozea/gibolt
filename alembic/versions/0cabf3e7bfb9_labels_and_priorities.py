"""Labels and priorities

Revision ID: 0cabf3e7bfb9
Revises: 7980badc5c6f
Create Date: 2018-01-30 10:09:27.489539

"""
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "0cabf3e7bfb9"
down_revision = "7980badc5c6f"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    label = op.create_table(
        "label",
        sa.Column("label_id", sa.Integer(), nullable=False),
        sa.Column(
            "label_type",
            sa.Enum("ack", "circle", "priority", "qualifier"),
            nullable=True,
        ),
        sa.Column("text", sa.String(), nullable=True),
        sa.Column("color", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("label_id"),
        sa.UniqueConstraint("text", name="text_unique"),
    )
    priority = op.create_table(
        "priority",
        sa.Column("priority_id", sa.Integer(), nullable=False),
        sa.Column("label_id", sa.Integer(), nullable=False),
        sa.Column("value", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["label_id"], ["label.label_id"], name="fk_priority_label"
        ),
        sa.PrimaryKeyConstraint("priority_id"),
        sa.UniqueConstraint("value", name="value_unique"),
    )
    with op.batch_alter_table("circle", schema=None) as batch_op:
        batch_op.add_column(sa.Column("label_id", sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            "fk_circle_label", "label", ["label_id"], ["label_id"]
        )

    op.bulk_insert(
        label,
        [
            {
                "label_id": 1,
                "label_type": "ack",
                "text": "En cours",
                "color": "#2980b9",
            },
            {
                "label_id": 2,
                "label_type": "ack",
                "text": "À venir",
                "color": "#9FC5E8",
            },
            {
                "label_id": 3,
                "label_type": "ack",
                "text": "Vu",
                "color": "#b7b7b7",
            },
            {
                "label_id": 4,
                "label_type": "priority",
                "text": "Urgent",
                "color": "#e73c7d",
            },
            {
                "label_id": 5,
                "label_type": "priority",
                "text": "Bientôt",
                "color": "#f1c40f",
            },
            {
                "label_id": 6,
                "label_type": "priority",
                "text": "Plus tard",
                "color": "#27ae60",
            },
            {
                "label_id": 7,
                "label_type": "qualifier",
                "text": "Triage",
                "color": "#000000",
            },
            {
                "label_id": 8,
                "label_type": "qualifier",
                "text": "Bug",
                "color": "#9a62d3",
            },
            {
                "label_id": 9,
                "label_type": "circle",
                "text": "1er cercle",
                "color": "#1a1b31",
            },
            {
                "label_id": 10,
                "label_type": "circle",
                "text": "Dévops",
                "color": "#6e6186",
            },
            {
                "label_id": 11,
                "label_type": "circle",
                "text": "Marco",
                "color": "#f59c30",
            },
            {
                "label_id": 12,
                "label_type": "circle",
                "text": "Design",
                "color": "#86ad50",
            },
        ],
    )
    op.bulk_insert(
        priority,
        [
            {"priority_id": 1, "label_id": 4, "value": 0},
            {"priority_id": 2, "label_id": 5, "value": 1},
            {"priority_id": 3, "label_id": 6, "value": 2},
        ],
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("circle", schema=None) as batch_op:
        batch_op.drop_constraint("fk_circle_label", type_="foreignkey")
        batch_op.drop_column("label_id")

    op.drop_table("priority")
    op.drop_table("label")
    # ### end Alembic commands ###
