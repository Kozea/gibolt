import datetime
import json

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    TypeDecorator,
    UniqueConstraint,
    func,
)
from sqlalchemy.event import listens_for
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import backref, relationship
from sqlalchemy.types import Enum, NullType

from . import app

Base = declarative_base()
item_types = ["checklist", "indicator"]
meeting_types = [
    type_name for type_id, type_name in app.config["MEETINGS_TYPES"]
]
label_types = ["ack", "circle", "priority", "qualifier"]
role_types = ["leadlink", "elected", "assigned"]


class SQLiteJson(TypeDecorator):
    impl = String

    class Comparator(String.Comparator):
        def __getitem__(self, index):
            if isinstance(index, tuple):
                index = "$%s" % (
                    "".join(
                        [
                            "[%s]" % elem
                            if isinstance(elem, int)
                            else '."%s"' % elem
                            for elem in index
                        ]
                    )
                )
            elif isinstance(index, int):
                index = "$[%s]" % index
            else:
                index = '$."%s"' % index

            # json_extract does not appear to return JSON sub-elements
            # which is weird.
            return func.json_extract(self.expr, index, type_=NullType)

    comparator_factory = Comparator

    def process_bind_param(self, value, dialect):
        if value is not None:
            value = json.dumps(value)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            value = json.loads(value)
        return value


class Label(Base):
    __tablename__ = "label"
    __table_args__ = (UniqueConstraint("text", name="text"),)
    label_id = Column(
        Integer, autoincrement=True, primary_key=True, nullable=False
    )
    label_type = Column(Enum(*label_types))
    text = Column(String)
    color = Column(String)


class Priority(Base):
    __tablename__ = "priority"
    __table_args__ = (UniqueConstraint("value", name="value_unique"),)
    priority_id = Column(
        Integer, autoincrement=True, primary_key=True, nullable=False
    )
    label_id = Column(
        Integer,
        ForeignKey("label.label_id", name="fk_priority_label"),
        nullable=False,
    )
    value = Column(Integer)
    labels = relationship(
        Label,
        backref=backref("priorities", cascade="all,delete", uselist=False),
    )


class Circle(Base):
    __tablename__ = "circle"
    circle_id = Column(
        Integer, primary_key=True, autoincrement=True, nullable=False
    )
    parent_circle_id = Column(
        Integer, ForeignKey("circle.circle_id"), nullable=True
    )
    label_id = Column(
        Integer,
        ForeignKey("label.label_id", name="fk_circle_label"),
        nullable=True,
    )
    circle_name = Column(String, unique=True)
    circle_purpose = Column(String)
    circle_domain = Column(String)
    circle_accountabilities = Column(String)
    is_active = Column(Boolean, default=True, nullable=False)
    circle_children = relationship(
        "Circle", backref=backref("parent", remote_side=[circle_id])
    )
    circle_milestones = relationship(
        "MilestoneCircle",
        backref=backref("milestone_circle", remote_side=[circle_id]),
    )
    circle_parent = relationship(
        "Circle", backref="circle", remote_side=[circle_id], lazy="subquery"
    )
    label = relationship(Label, backref="circle")

    @property
    def user_ids(self):
        user_ids = set()
        for role in self.roles:
            if not role.is_active:
                continue
            for focus in role.role_focuses:
                user_ids.add(focus.latest_user.user_id)
        return user_ids


@listens_for(Circle.is_active, "set")
def receive_attribute_change(target, value, oldvalue, initiator):
    if target.circle_children:
        for child in target.circle_children:
            child.is_active = value


class Role(Base):
    __tablename__ = "role"
    role_id = Column(
        Integer, primary_key=True, autoincrement=True, nullable=False
    )
    circle_id = Column(
        Integer,
        ForeignKey("circle.circle_id", name="fk_role_circle"),
        nullable=False,
    )
    role_name = Column(String)
    role_purpose = Column(String)
    role_domain = Column(String)
    role_accountabilities = Column(String)
    is_active = Column(Boolean, default=True, nullable=False)
    role_type = Column(Enum(*role_types))
    circle = relationship(Circle, backref="roles")


class RoleFocus(Base):
    __tablename__ = "role_focus"
    role_focus_id = Column(
        Integer, primary_key=True, autoincrement=True, nullable=False
    )
    role_id = Column(
        Integer,
        ForeignKey("role.role_id", name="fk_focus_role"),
        nullable=False,
    )
    focus_name = Column(String, default="", nullable=False)
    duration = Column(Integer)
    role = relationship(
        Role, backref=backref("role_focuses", cascade="all, delete-orphan")
    )

    @property
    def latest_user(self):
        users = self.role_focus_users
        for user in users:
            if user.end_date is None:
                return user
            else:
                start, end = user.start_date.date(), user.end_date.date()
                if start <= datetime.date.today() <= end:
                    return user


class RoleFocusUser(Base):
    __tablename__ = "role_focus_user"
    role_focus_user_id = Column(
        Integer, primary_key=True, autoincrement=True, nullable=False
    )
    role_focus_id = Column(
        Integer,
        ForeignKey("role_focus.role_focus_id", name="fk_user_focus"),
        nullable=False,
    )
    user_id = Column(Integer)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    role_focus = relationship(
        RoleFocus,
        backref=backref(
            "role_focus_users",
            cascade="all, delete-orphan",
            order_by=lambda: (
                RoleFocusUser.end_date.desc().nullsfirst(),
                RoleFocusUser.start_date.desc().nullsfirst(),
            ),
        ),
    )


class Item(Base):
    __tablename__ = "item"
    item_id = Column(
        Integer, primary_key=True, autoincrement=True, nullable=False
    )
    role_focus_id = Column(
        Integer,
        ForeignKey("role_focus.role_focus_id", name="fk_item_rolefocus"),
        nullable=False,
    )
    item_type = Column(Enum(*item_types))
    content = Column(Text)
    role_focus = relationship(
        RoleFocus, backref=backref("items", cascade="all, delete-orphan")
    )


class Report(Base):
    __tablename__ = "report"
    report_id = Column(
        Integer, primary_key=True, autoincrement=True, nullable=False
    )
    circle_id = Column(Integer, ForeignKey("circle.circle_id"), nullable=False)
    report_type = Column(Enum(*meeting_types))
    created_at = Column(DateTime, default=datetime.datetime.now)
    author_id = Column(Integer)
    content = Column(Text)
    modified_at = Column(DateTime, onupdate=datetime.datetime.now)
    modified_by = Column(Integer)
    is_submitted = Column(Boolean, default=False, nullable=False)
    circle = relationship(Circle, backref="reports")
    attendees = relationship(
        "ReportAttendee", cascade="all,delete", backref="report"
    )
    actions = relationship(
        "ReportChecklist", cascade="all,delete", backref="report"
    )
    indicators = relationship(
        "ReportIndicator", cascade="all,delete", backref="report"
    )
    projects = relationship(
        "ReportMilestone", cascade="all,delete", backref="report"
    )
    agenda = relationship(
        "ReportAgenda", cascade="all,delete", backref="report"
    )


class MilestoneCircle(Base):
    __tablename__ = "milestone_circle"
    circle_id = Column(
        Integer, ForeignKey("circle.circle_id"), primary_key=True
    )
    milestone_number = Column(Integer, primary_key=True)
    repo_name = Column(String, primary_key=True)
    is_active = Column(Boolean, default=True, nullable=False)


class ReportAttendee(Base):
    __tablename__ = "report_attendee"
    report_id = Column(
        Integer, ForeignKey("report.report_id"), primary_key=True
    )
    user_id = Column(Integer, primary_key=True)
    user = Column(SQLiteJson)
    checked = Column(Boolean, default=True, nullable=False)


class ReportChecklist(Base):
    __tablename__ = "report_checklist"
    report_id = Column(
        Integer, ForeignKey("report.report_id"), primary_key=True
    )
    item_id = Column(Integer, ForeignKey("item.item_id"), primary_key=True)
    content = Column(String)
    checked = Column(Boolean, default=False, nullable=False)


class ReportIndicator(Base):
    __tablename__ = "report_indicator"
    report_id = Column(
        Integer, ForeignKey("report.report_id"), primary_key=True
    )
    item_id = Column(Integer, ForeignKey("item.item_id"), primary_key=True)
    content = Column(String)
    value = Column(Numeric)


class ReportMilestone(Base):
    __tablename__ = "report_milestone"
    report_id = Column(
        Integer, ForeignKey("report.report_id"), primary_key=True
    )
    milestone_number = Column(Integer, primary_key=True)
    repo_name = Column(String, primary_key=True)
    milestone = Column(SQLiteJson)


class ReportAgenda(Base):
    __tablename__ = "report_agenda"
    report_id = Column(
        Integer, ForeignKey("report.report_id"), primary_key=True
    )
    ticket_id = Column(Integer, primary_key=True)
    ticket = Column(SQLiteJson)
