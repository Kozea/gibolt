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
    circle_name = Column(String, unique=True)
    circle_purpose = Column(String)
    circle_domain = Column(String)
    circle_accountabilities = Column(String)
    is_active = Column(Boolean, default=True, nullable=False)
    circle_children = relationship(
        'Circle', backref=backref('parent', remote_side=[circle_id]))


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
    created_at = Column(DateTime, default=datetime.datetime.now())
    author_id = Column(Integer)
    content = Column(Text)
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
