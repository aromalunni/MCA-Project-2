"""Location model — multi-branch support with Kerala districts."""

from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text, Time
from sqlalchemy.orm import relationship

from app.core.database import Base


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    district = Column(String(100), nullable=True)
    state = Column(String(50), default="Kerala")
    phone = Column(String(20), nullable=True)
    email = Column(String(150), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    image_url = Column(String(500), nullable=True)
    rating = Column(Float, default=4.5)
    is_active = Column(Boolean, default=True)
    opening_time = Column(Time, nullable=True)
    closing_time = Column(Time, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    services = relationship("Service", back_populates="location")
    staff_members = relationship("Staff", back_populates="location")
