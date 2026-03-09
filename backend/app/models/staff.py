"""Staff and StaffLeave models."""

from datetime import datetime
from sqlalchemy import (
    Boolean, Column, Date, DateTime, Enum, ForeignKey,
    Integer, String, Text, Time,
)
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import LeaveType


class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    specialization = Column(String(100), nullable=True)
    experience_years = Column(Integer, default=0)
    is_available = Column(Boolean, default=True)
    work_start = Column(Time, nullable=False)
    work_end = Column(Time, nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    location = relationship("Location", back_populates="staff_members")
    bookings = relationship("Booking", back_populates="staff")
    reviews = relationship("Review", back_populates="staff")
    leaves = relationship("StaffLeave", back_populates="staff", cascade="all, delete-orphan")
    attendance_records = relationship("StaffAttendance", back_populates="staff", cascade="all, delete-orphan")
    payroll_records = relationship("StaffPayroll", back_populates="staff", cascade="all, delete-orphan")


class StaffLeave(Base):
    __tablename__ = "staff_leaves"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    leave_date = Column(Date, nullable=False)
    leave_type = Column(Enum(LeaveType, native_enum=False), default=LeaveType.personal, nullable=False)
    reason = Column(Text, nullable=True)
    is_approved = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    staff = relationship("Staff", back_populates="leaves")
