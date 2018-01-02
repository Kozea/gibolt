from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import backref, relationship

Base = declarative_base()


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
    circle_children = relationship('Circle',
                                   backref=backref('parent',
                                                   remote_side=[circle_id]))


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
    item_type = Column(String)
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
    report_type = Column(String)
    created_at = Column(DateTime)
    author_id = Column(Integer)
    content = Column(Text)
    circle = relationship(Circle, backref='reports')


class Milestone_circle(Base):
    __tablename__ = 'milestone_circle'
    circle_id = Column(
        Integer,
        ForeignKey('circle.circle_id'),
        primary_key=True)
    milestone_id = Column(
        Integer,
        primary_key=True)
