"""Booking model."""

from datetime import datetime
from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import BookingStatus


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    appointment_date = Column(DateTime, nullable=False)
    status = Column(Enum(BookingStatus, native_enum=False), default=BookingStatus.confirmed, nullable=False)
    queue_position = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    refund_amount = Column(Float, nullable=True)
    package_id = Column(Integer, ForeignKey("packages.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="bookings")
    service = relationship("Service", back_populates="bookings")
    staff = relationship("Staff", back_populates="bookings")
    package = relationship("Package", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False)
    review = relationship("Review", back_populates="booking", uselist=False)
