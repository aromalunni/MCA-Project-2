"""
SmartSalon — Model registry.

All models are imported here so SQLAlchemy discovers them for table creation.
Import from this package: `from app.models import User, Service, ...`
"""

from app.models.enums import (
    BookingStatus, CrowdLevel, PaymentStatus, PaymentMethod, LeaveType,
    WaitlistStatus, DiscountType, ProductGender, OrderStatus,
    AttendanceStatus, PayrollStatus,
)
from app.models.user import User
from app.models.location import Location
from app.models.service import ServiceCategory, Service
from app.models.staff import Staff, StaffLeave
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.review import Review
from app.models.waitlist import WaitlistEntry
from app.models.package import Package, PackageItem
from app.models.loyalty import LoyaltyTransaction
from app.models.policy import CancellationPolicy
from app.models.notification import Notification
from app.models.discount import Discount
from app.models.product import ProductCategory, Product
from app.models.cart import CartItem
from app.models.order import Order, OrderItem
from app.models.chat import ChatMessage
from app.models.attendance import StaffAttendance, StaffPayroll

__all__ = [
    "BookingStatus", "CrowdLevel", "PaymentStatus", "PaymentMethod",
    "LeaveType", "WaitlistStatus", "DiscountType", "ProductGender",
    "OrderStatus", "AttendanceStatus", "PayrollStatus",
    "User", "Location", "ServiceCategory", "Service",
    "Staff", "StaffLeave", "Booking", "Payment", "Review",
    "WaitlistEntry", "Package", "PackageItem",
    "LoyaltyTransaction", "CancellationPolicy", "Notification", "Discount",
    "ProductCategory", "Product", "CartItem", "Order", "OrderItem",
    "ChatMessage", "StaffAttendance", "StaffPayroll",
]
