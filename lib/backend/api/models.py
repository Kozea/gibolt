from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class Circle(Base):
    __tablename__ = 'circle'
    circle_id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        nullable=False)
    circle_name = Column(String, unique=True)
    circle_purpose = Column(String)
    circle_domain = Column(String)
    circle_accountabilities = Column(String)


class Role(Base):
    __tablename__ = 'role'
    role_id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        nullable=False)
    user_id = Column(Integer)
    circle_id = Column(
        String,
        ForeignKey('circle.circle_id'))
    role_name = Column(String)
    role_purpose = Column(String)
    role_domain = Column(String)
    role_accountabilities = Column(String)
    role_checklist = Column(String)
    circle = relationship(Circle, backref='roles')


class Report(Base):
    __tablename__ = 'report'
    report_id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        nullable=True)
    circle_id = Column(
        String,
        ForeignKey('circle.circle_id'))
    type = Column(String)
    created_at = Column(DateTime)
