"""Discount model — one active discount per service."""

from datetime import datetime, date
from sqlalchemy import Boolean, Column, Date, DateTime, Enum, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import DiscountType


class Discount(Base):
    __tablename__ = "discounts"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    discount_type = Column(Enum(DiscountType, native_enum=False), nullable=False)
    discount_value = Column(Float, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    service = relationship("Service", back_populates="discounts")
