"""Package and PackageItem models — service bundles."""

from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Package(Base):
    __tablename__ = "packages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    discount_percent = Column(Float, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("PackageItem", back_populates="package", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="package")


class PackageItem(Base):
    __tablename__ = "package_items"

    id = Column(Integer, primary_key=True, index=True)
    package_id = Column(Integer, ForeignKey("packages.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)

    package = relationship("Package", back_populates="items")
    service = relationship("Service", back_populates="package_items")
