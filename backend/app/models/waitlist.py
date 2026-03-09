"""Waitlist model — join when fully booked."""

from datetime import datetime
from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import WaitlistStatus


class WaitlistEntry(Base):
    __tablename__ = "waitlist"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    preferred_date = Column(Date, nullable=False)
    status = Column(Enum(WaitlistStatus, native_enum=False), default=WaitlistStatus.waiting, nullable=False)
    notified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="waitlist_entries")
