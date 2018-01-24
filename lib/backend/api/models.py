import datetime

from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey, Integer, String, Text
)
from sqlalchemy.event import listens_for
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import backref, relationship
from sqlalchemy.types import Enum

from .. import app

Base = declarative_base()
item_types = ['checklist', 'indicator']
meeting_types = [
    type_name for type_id, type_name in app.config['MEETINGS_TYPES']]


class Label_type(Base):
    __tablename__ = 'label_type'
    label_type_id = Column(
        Integer,
        autoincrement=True,
        primary_key=True,
        nullable=False)
    label_type_name = Column(String)


class Label(Base):
    __tablename__ = 'label'
    label_id = Column(
        Integer,
        autoincrement=True,
        primary_key=True,
        nullable=False)
    label_type_id = Column(
        Integer,
        ForeignKey('label_type.label_type_id', name='fk_labeltype_label'),
        nullable=False)
    label_name = Column(String)
    label_color = Column(String)
    label_types = relationship(Label_type, backref='labels')


class Priority(Base):
    __tablename__ = 'priority'
    priority_id = Column(
        Integer,
        autoincrement=True,
        primary_key=True,
        nullable=False)
    label_id = Column(
        Integer,
        ForeignKey('label.label_id', name='fk_priority_label'),
        nullable=False)
    value = Column(Integer)
    labels = relationship(Label, backref='priorities')


class Circle(Base):
    __tablename__ = 'circle'
    circle_id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        nullable=False)
    parent_circle_id = Column(
        Integer,
        ForeignKey('circle.circle_id'),
        nullable=True)
    label_id = Column(
        Integer,
        ForeignKey('label.label_id', name='fk_circle_label'),
        nullable=True)
    circle_name = Column(String, unique=True)
    circle_purpose = Column(String)
    circle_domain = Column(String)
    circle_accountabilities = Column(String)
    is_active = Column(Boolean, default=True, nullable=False)
    circle_children = relationship(
        'Circle', backref=backref('parent', remote_side=[circle_id]))
    circle_milestones = relationship(
        'Milestone_circle', backref=backref(
            'milestone_circle', remote_side=[circle_id]))
    label = relationship(Label, backref='circle')


@listens_for(Circle.is_active, 'set')
def receive_attribute_change(target, value, oldvalue, initiator):
    if target.circle_children:
        for child in target.circle_children:
            child.is_active = value


class Role(Base):
    __tablename__ = 'role'
    role_id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        nullable=False)
    circle_id = Column(
        Integer,
        ForeignKey('circle.circle_id'),
        nullable=False)
    user_id = Column(Integer)
    role_name = Column(String)
    role_purpose = Column(String)
    role_domain = Column(String)
    role_accountabilities = Column(String)
    circle = relationship(Circle, backref='roles')


class Item(Base):
    __tablename__ = 'item'
    item_id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        nullable=False)
    role_id = Column(
        Integer,
        ForeignKey('role.role_id'),
        nullable=False)
    item_type = Column(Enum(*item_types))
    content = Column(Text)
    role = relationship(Role, backref='items')


class Report(Base):
    __tablename__ = 'report'
    report_id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        nullable=False)
    circle_id = Column(
        Integer,
        ForeignKey('circle.circle_id'),
        nullable=False)
    report_type = Column(Enum(*meeting_types))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    author_id = Column(Integer)
    content = Column(Text)
    modified_at = Column(DateTime, onupdate=datetime.datetime.utcnow)
    modified_by = Column(Integer)
    circle = relationship(Circle, backref='reports')


class Milestone_circle(Base):
    __tablename__ = 'milestone_circle'
    circle_id = Column(
        Integer,
        ForeignKey('circle.circle_id'),
        primary_key=True)
    milestone_number = Column(
        Integer,
        primary_key=True)
    repo_name = Column(
        String,
        primary_key=True)
