"""Staff attendance and payroll models."""

from datetime import datetime
from sqlalchemy import Column, Date, DateTime, Enum, Float, ForeignKey, Integer, String, Text, Time
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import AttendanceStatus, PayrollStatus


class StaffAttendance(Base):
    __tablename__ = "staff_attendance"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    date = Column(Date, nullable=False)
    check_in = Column(Time, nullable=True)
    check_out = Column(Time, nullable=True)
    status = Column(Enum(AttendanceStatus, native_enum=False), default=AttendanceStatus.present)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    staff = relationship("Staff", back_populates="attendance_records")


class StaffPayroll(Base):
    __tablename__ = "staff_payroll"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    base_salary = Column(Float, nullable=False)
    bonus = Column(Float, default=0)
    deductions = Column(Float, default=0)
    net_salary = Column(Float, nullable=False)
    status = Column(Enum(PayrollStatus, native_enum=False), default=PayrollStatus.pending)
    paid_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    staff = relationship("Staff", back_populates="payroll_records")
