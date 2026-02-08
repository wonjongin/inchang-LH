from sqlalchemy import Column, Integer, String, Date, Boolean, Text, ForeignKey, ForeignKeyConstraint, DateTime
from sqlalchemy.orm import relationship
from db.base import Base
from datetime import datetime
from enum import Enum


class Permission(Enum):
    ADMIN = 1
    MANAGER = 2
    USER = 3

class User(Base):
    __tablename__ = "user"
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    permission = Column(Integer, nullable=False, default=Permission.USER.value)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    
    # Relationships
    reservations = relationship("Reservation", back_populates="author")


class Complex(Base):
    __tablename__ = "complex"
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    address = Column(String, nullable=True)
    tel = Column(String, nullable=True)
    fax = Column(String, nullable=True)
    email = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    
    # Relationships
    reservations = relationship("Reservation", back_populates="location")


class Template(Base):
    __tablename__ = "template"
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    fmt = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    
    # Relationships
    vendors = relationship("Vendor", back_populates="template")
    reservations = relationship("Reservation", back_populates="template")


class Vendor(Base):
    __tablename__ = "vendor"
    
    id = Column(Integer, primary_key=True)
    template_id = Column(Integer, ForeignKey("template.id"))
    name = Column(String, nullable=False)
    tel = Column(String, nullable=True)
    fax = Column(String, nullable=True)
    email = Column(String, nullable=True)
    control_range = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    
    # Relationships
    template = relationship("Template", back_populates="vendors", foreign_keys=[template_id])
    reservations = relationship("Reservation", back_populates="vendor")


class Reservation(Base):
    __tablename__ = "reservation"
    
    id = Column(Integer, primary_key=True)
    cotis = Column(String, unique=True, nullable=True)
    complex_id = Column(Integer, ForeignKey("complex.id"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendor.id"), nullable=False)
    template_id = Column(Integer, ForeignKey("template.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    reserved_at = Column(Date, nullable=False)
    completed_at = Column(Date, nullable=True)
    is_transfered = Column(Boolean, nullable=False, default=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)

    # Relationships
    location = relationship("Complex", back_populates="reservations", foreign_keys=[complex_id])
    vendor = relationship("Vendor", back_populates="reservations", foreign_keys=[vendor_id])
    template = relationship("Template", back_populates="reservations", foreign_keys=[template_id])
    author = relationship("User", back_populates="reservations", foreign_keys=[user_id])