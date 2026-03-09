"""SmartSalon — Enum definitions for model fields."""

import enum


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"


class CrowdLevel(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    refunded = "refunded"
    failed = "failed"


class PaymentMethod(str, enum.Enum):
    cash = "cash"
    card = "card"
    upi = "upi"
    wallet = "wallet"


class LeaveType(str, enum.Enum):
    vacation = "vacation"
    sick = "sick"
    personal = "personal"
    holiday = "holiday"


class WaitlistStatus(str, enum.Enum):
    waiting = "waiting"
    notified = "notified"
    booked = "booked"
    expired = "expired"


class DiscountType(str, enum.Enum):
    percentage = "percentage"
    flat = "flat"


class ProductGender(str, enum.Enum):
    men = "men"
    women = "women"
    unisex = "unisex"


class OrderStatus(str, enum.Enum):
    placed = "placed"
    confirmed = "confirmed"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"
    returned = "returned"


class AttendanceStatus(str, enum.Enum):
    present = "present"
    absent = "absent"
    half_day = "half_day"
    late = "late"


class PayrollStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    hold = "hold"
