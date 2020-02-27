"""update label colors

Revision ID: aa3c14d50be3
Revises: a67e81d146d8
Create Date: 2020-02-27 10:53:09.076499

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "aa3c14d50be3"
down_revision = "a67e81d146d8"
branch_labels = None
depends_on = None

label = sa.table(
    "label",
    sa.Column("label_id", sa.Integer(), nullable=False),
    sa.Column(
        "label_type",
        sa.Enum("ack", "circle", "priority", "qualifier"),
        nullable=True,
    ),
    sa.Column("text", sa.String(), nullable=True),
    sa.Column("color", sa.String(), nullable=True),
)


def upgrade():
    op.execute("DELETE FROM LABEL")
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


def downgrade():
    pass
