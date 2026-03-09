"""
Analytics router — powers the admin dashboard charts.
All queries are against the bookings table, no separate analytics table needed.
"""

from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import func, extract
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_admin
from app.models import Booking, BookingStatus, Service, User, Payment, PaymentStatus
from app.schemas.schemas import AnalyticsSummary, PeakHourData, ServicePopularity

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
def get_summary(db: Session = Depends(get_db), _=Depends(require_admin)):
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)

    total_bookings = db.query(Booking).count()

    todays_bookings = (
        db.query(Booking)
        .filter(
            Booking.appointment_date >= today_start,
            Booking.appointment_date < today_end,
            Booking.status != BookingStatus.cancelled,
        )
        .count()
    )

    # Daily revenue = sum of ACTUAL payment amounts for today's completed payments
    daily_revenue_result = (
        db.query(func.sum(Payment.amount))
        .join(Booking, Booking.id == Payment.booking_id)
        .filter(
            Booking.appointment_date >= today_start,
            Booking.appointment_date < today_end,
            Payment.status == PaymentStatus.completed,
        )
        .scalar()
    )
    daily_revenue = float(daily_revenue_result or 0)

    # Total revenue all time = sum of all completed payments
    total_revenue_result = (
        db.query(func.sum(Payment.amount))
        .filter(Payment.status == PaymentStatus.completed)
        .scalar()
    )
    total_revenue = float(total_revenue_result or 0)

    active_users = db.query(User).filter(User.is_active == True, User.is_admin == False).count()

    crowd_level = "low" if todays_bookings < 5 else ("medium" if todays_bookings < 10 else "high")

    return AnalyticsSummary(
        total_bookings=total_bookings,
        todays_bookings=todays_bookings,
        daily_revenue=daily_revenue,
        total_revenue=total_revenue,
        active_users=active_users,
        crowd_level=crowd_level,
    )


@router.get("/peak-hours", response_model=List[PeakHourData])
def peak_hours(db: Session = Depends(get_db), _=Depends(require_admin)):
    """Returns booking count grouped by hour of day for the past 30 days."""
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    results = (
        db.query(
            extract("hour", Booking.appointment_date).label("hour"),
            func.count(Booking.id).label("booking_count"),
        )
        .filter(
            Booking.appointment_date >= thirty_days_ago,
            Booking.status != BookingStatus.cancelled,
        )
        .group_by("hour")
        .order_by("hour")
        .all()
    )
    return [PeakHourData(hour=int(r.hour), booking_count=r.booking_count) for r in results]


@router.get("/popular-services", response_model=List[ServicePopularity])
def popular_services(db: Session = Depends(get_db), _=Depends(require_admin)):
    results = (
        db.query(Service.name, func.count(Booking.id).label("booking_count"))
        .join(Booking, Booking.service_id == Service.id)
        .filter(Booking.status != BookingStatus.cancelled)
        .group_by(Service.name)
        .order_by(func.count(Booking.id).desc())
        .limit(10)
        .all()
    )
    return [ServicePopularity(service_name=r.name, booking_count=r.booking_count) for r in results]


@router.get("/daily-bookings")
def daily_bookings_last_7(db: Session = Depends(get_db), _=Depends(require_admin)):
    """Returns booking counts for the last 7 days — used for line chart."""
    results = []
    for i in range(6, -1, -1):
        day_start = (datetime.utcnow() - timedelta(days=i)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        day_end = day_start + timedelta(days=1)
        count = (
            db.query(Booking)
            .filter(
                Booking.appointment_date >= day_start,
                Booking.appointment_date < day_end,
                Booking.status != BookingStatus.cancelled,
            )
            .count()
        )
        results.append({"date": day_start.strftime("%d %b"), "count": count})
    return results


@router.get("/users/all")
def admin_list_users(db: Session = Depends(get_db), _=Depends(require_admin)):
    users = db.query(User).all()
    return [
        {
            "id": u.id, "name": u.name, "email": u.email,
            "is_admin": u.is_admin, "is_active": u.is_active,
            "created_at": u.created_at,
        }
        for u in users
    ]


@router.put("/users/{user_id}/toggle-active")
def toggle_user_active(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.is_active = not user.is_active
        db.commit()
    return {"ok": True, "is_active": user.is_active if user else None}
