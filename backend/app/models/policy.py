"""CancellationPolicy model — refund rules."""

from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String

from app.core.database import Base


class CancellationPolicy(Base):
    __tablename__ = "cancellation_policies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    hours_before = Column(Integer, nullable=False)
    refund_percent = Column(Float, nullable=False)
    penalty_amount = Column(Float, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
