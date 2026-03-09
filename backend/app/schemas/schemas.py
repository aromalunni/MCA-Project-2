"""
Pydantic v2 schemas — request validation and response serialization.
"""

from datetime import datetime, date, time
from typing import Optional, List
from pydantic import BaseModel, EmailStr, field_validator, field_serializer
from app.models import (
    BookingStatus, PaymentStatus, PaymentMethod, LeaveType, WaitlistStatus,
    DiscountType, ProductGender, OrderStatus, AttendanceStatus, PayrollStatus,
)


# ─────────────────────────────────────────
# AUTH
# ─────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserLogin(BaseModel):
    name: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    email: str
    is_admin: bool


class PasswordChange(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError("New password must be at least 6 characters")
        return v


# ─────────────────────────────────────────
# USER
# ─────────────────────────────────────────

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    is_admin: bool
    is_active: bool
    loyalty_points: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# SERVICE CATEGORY
# ─────────────────────────────────────────

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None


class CategoryOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    icon: Optional[str]
    is_active: bool

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# SERVICE
# ─────────────────────────────────────────

class ServiceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    duration_minutes: int
    price: float
    category_id: Optional[int] = None
    location_id: Optional[int] = None


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    price: Optional[float] = None
    is_active: Optional[bool] = None
    category_id: Optional[int] = None
    location_id: Optional[int] = None


class ServiceOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    duration_minutes: int
    price: float
    is_active: bool
    category_id: Optional[int] = None
    location_id: Optional[int] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    discounted_price: Optional[float] = None

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# LOCATION
# ─────────────────────────────────────────

class LocationCreate(BaseModel):
    name: str
    address: str
    city: str
    district: Optional[str] = None
    state: Optional[str] = "Kerala"
    phone: Optional[str] = None
    email: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None


class LocationUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None


class LocationOut(BaseModel):
    id: int
    name: str
    address: str
    city: str
    district: Optional[str] = None
    state: Optional[str] = "Kerala"
    phone: Optional[str]
    email: Optional[str]
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    rating: Optional[float] = 4.5
    is_active: bool
    opening_time: Optional[time] = None
    closing_time: Optional[time] = None

    @field_serializer("opening_time", "closing_time")
    def serialize_time(self, v: Optional[time]) -> Optional[str]:
        return v.strftime("%H:%M") if v else None

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# STAFF
# ─────────────────────────────────────────

class StaffCreate(BaseModel):
    name: str
    specialization: Optional[str] = None
    experience_years: int = 0
    work_start: str
    work_end: str
    location_id: Optional[int] = None


class StaffUpdate(BaseModel):
    name: Optional[str] = None
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    is_available: Optional[bool] = None
    work_start: Optional[str] = None
    work_end: Optional[str] = None
    location_id: Optional[int] = None


class StaffOut(BaseModel):
    id: int
    name: str
    specialization: Optional[str]
    experience_years: int
    is_available: bool
    work_start: time
    work_end: time
    location_id: Optional[int] = None

    @field_serializer("work_start", "work_end")
    def serialize_time(self, v: time) -> str:
        return v.strftime("%H:%M") if v else None

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# STAFF LEAVE
# ─────────────────────────────────────────

class StaffLeaveCreate(BaseModel):
    staff_id: int
    leave_date: date
    leave_type: LeaveType = LeaveType.personal
    reason: Optional[str] = None


class StaffLeaveOut(BaseModel):
    id: int
    staff_id: int
    leave_date: date
    leave_type: LeaveType
    reason: Optional[str]
    is_approved: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# BOOKING
# ─────────────────────────────────────────

class BookingCreate(BaseModel):
    service_id: int
    staff_id: int
    appointment_date: datetime
    notes: Optional[str] = None
    package_id: Optional[int] = None
    payment_method: Optional[PaymentMethod] = None
    redeem_points: Optional[int] = 0


class BookingUpdate(BaseModel):
    appointment_date: Optional[datetime] = None
    status: Optional[BookingStatus] = None
    notes: Optional[str] = None


class BookingOut(BaseModel):
    id: int
    user_id: int
    service_id: int
    staff_id: int
    appointment_date: datetime
    status: BookingStatus
    queue_position: Optional[int]
    notes: Optional[str]
    cancellation_reason: Optional[str] = None
    refund_amount: Optional[float] = None
    package_id: Optional[int] = None
    created_at: datetime
    service: Optional[ServiceOut] = None
    staff: Optional[StaffOut] = None

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# PAYMENT
# ─────────────────────────────────────────

class PaymentCreate(BaseModel):
    booking_id: int
    payment_method: PaymentMethod = PaymentMethod.card


class PaymentOut(BaseModel):
    id: int
    booking_id: int
    user_id: int
    amount: float
    payment_method: PaymentMethod
    status: PaymentStatus
    transaction_id: Optional[str]
    refund_amount: Optional[float]
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# REVIEW
# ─────────────────────────────────────────

class ReviewCreate(BaseModel):
    booking_id: int
    rating: int
    comment: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v):
        if v < 1 or v > 5:
            raise ValueError("Rating must be between 1 and 5")
        return v


class ReviewOut(BaseModel):
    id: int
    booking_id: int
    user_id: int
    staff_id: int
    service_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime
    user_name: Optional[str] = None

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# WAITLIST
# ─────────────────────────────────────────

class WaitlistCreate(BaseModel):
    staff_id: int
    service_id: int
    preferred_date: date


class WaitlistOut(BaseModel):
    id: int
    user_id: int
    staff_id: int
    service_id: int
    preferred_date: date
    status: WaitlistStatus
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# PACKAGE
# ─────────────────────────────────────────

class PackageCreate(BaseModel):
    name: str
    description: Optional[str] = None
    discount_percent: float = 0
    service_ids: List[int] = []


class PackageOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    discount_percent: float
    is_active: bool
    total_price: float = 0
    total_duration: int = 0
    services: List[ServiceOut] = []
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# LOYALTY
# ─────────────────────────────────────────

class LoyaltyTransactionOut(BaseModel):
    id: int
    user_id: int
    points: int
    description: str
    booking_id: Optional[int]
    created_at: datetime

    model_config = {"from_attributes": True}


class LoyaltyRedeemRequest(BaseModel):
    points: int

    @field_validator("points")
    @classmethod
    def positive_points(cls, v):
        if v <= 0:
            raise ValueError("Points must be positive")
        return v


# ─────────────────────────────────────────
# CANCELLATION POLICY
# ─────────────────────────────────────────

class CancellationPolicyCreate(BaseModel):
    name: str
    hours_before: int
    refund_percent: float
    penalty_amount: float = 0


class CancellationPolicyOut(BaseModel):
    id: int
    name: str
    hours_before: int
    refund_percent: float
    penalty_amount: float
    is_active: bool

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# NOTIFICATIONS
# ─────────────────────────────────────────

class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    is_read: bool
    notification_type: str
    channel: str = "in_app"
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# ANALYTICS
# ─────────────────────────────────────────

class AnalyticsSummary(BaseModel):
    total_bookings: int
    todays_bookings: int
    daily_revenue: float
    total_revenue: float
    active_users: int
    crowd_level: str


class PeakHourData(BaseModel):
    hour: int
    booking_count: int


class ServicePopularity(BaseModel):
    service_name: str
    booking_count: int


# ─────────────────────────────────────────
# SLOTS / QUEUE
# ─────────────────────────────────────────

class SlotInfo(BaseModel):
    datetime: datetime
    is_available: bool


class QueueStatus(BaseModel):
    position: int
    people_ahead: int
    estimated_wait_minutes: int
    crowd_level: str


# ─────────────────────────────────────────
# DISCOUNT
# ─────────────────────────────────────────

class DiscountCreate(BaseModel):
    service_id: int
    discount_type: DiscountType
    discount_value: float
    start_date: date
    end_date: date

    @field_validator("discount_value")
    @classmethod
    def positive_value(cls, v):
        if v <= 0:
            raise ValueError("Discount value must be positive")
        return v


class DiscountUpdate(BaseModel):
    discount_type: Optional[DiscountType] = None
    discount_value: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None


class DiscountOut(BaseModel):
    id: int
    service_id: int
    discount_type: DiscountType
    discount_value: float
    start_date: date
    end_date: date
    is_active: bool
    created_at: datetime
    service_name: Optional[str] = None

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# PRODUCT CATEGORY
# ─────────────────────────────────────────

class ProductCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None


class ProductCategoryOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    icon: Optional[str]
    is_active: bool

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# PRODUCT
# ─────────────────────────────────────────

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    discount_price: Optional[float] = None
    category_id: Optional[int] = None
    gender: ProductGender = ProductGender.unisex
    brand: Optional[str] = None
    image_url: Optional[str] = None
    stock: int = 0


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    discount_price: Optional[float] = None
    category_id: Optional[int] = None
    gender: Optional[ProductGender] = None
    brand: Optional[str] = None
    image_url: Optional[str] = None
    stock: Optional[int] = None
    is_active: Optional[bool] = None


class ProductOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    discount_price: Optional[float]
    category_id: Optional[int]
    gender: ProductGender
    brand: Optional[str]
    image_url: Optional[str]
    stock: int
    is_active: bool
    rating: float = 0
    total_reviews: int = 0
    category_name: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# CART
# ─────────────────────────────────────────

class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1


class CartItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    product_name: Optional[str] = None
    product_price: Optional[float] = None
    product_discount_price: Optional[float] = None
    product_image: Optional[str] = None

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# ORDER
# ─────────────────────────────────────────

class OrderCreate(BaseModel):
    payment_method: PaymentMethod = PaymentMethod.card
    shipping_address: Optional[str] = None
    notes: Optional[str] = None


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    product_name: Optional[str] = None
    product_image: Optional[str] = None

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: int
    user_id: int
    total_amount: float
    payment_method: PaymentMethod
    status: OrderStatus
    shipping_address: Optional[str]
    tracking_id: Optional[str]
    notes: Optional[str]
    items: List[OrderItemOut] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# CHAT
# ─────────────────────────────────────────

class ChatMessageCreate(BaseModel):
    message: str


class ChatMessageOut(BaseModel):
    id: int
    user_id: int
    message: str
    response: Optional[str]
    is_bot: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# STAFF ATTENDANCE
# ─────────────────────────────────────────

class AttendanceCreate(BaseModel):
    staff_id: int
    date: date
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    status: AttendanceStatus = AttendanceStatus.present
    notes: Optional[str] = None


class AttendanceOut(BaseModel):
    id: int
    staff_id: int
    date: date
    check_in: Optional[time] = None
    check_out: Optional[time] = None
    status: AttendanceStatus
    notes: Optional[str]
    staff_name: Optional[str] = None
    created_at: datetime

    @field_serializer("check_in", "check_out")
    def serialize_time(self, v: Optional[time]) -> Optional[str]:
        return v.strftime("%H:%M") if v else None

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# STAFF PAYROLL
# ─────────────────────────────────────────

class PayrollCreate(BaseModel):
    staff_id: int
    month: int
    year: int
    base_salary: float
    bonus: float = 0
    deductions: float = 0
    notes: Optional[str] = None


class PayrollOut(BaseModel):
    id: int
    staff_id: int
    month: int
    year: int
    base_salary: float
    bonus: float
    deductions: float
    net_salary: float
    status: PayrollStatus
    paid_date: Optional[date]
    notes: Optional[str]
    staff_name: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
