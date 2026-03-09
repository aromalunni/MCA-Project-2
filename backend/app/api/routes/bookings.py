"""
Bookings router.

Every mutation (create, cancel, reschedule) broadcasts a WebSocket event
so all connected clients immediately see slot availability changes.
"""

import uuid
from datetime import datetime, date
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models import (
    Booking, BookingStatus, Notification, Staff, Service, User,
    CancellationPolicy, Payment, PaymentStatus, PaymentMethod, LoyaltyTransaction,
    WaitlistEntry, WaitlistStatus,
)
from app.schemas.schemas import BookingCreate, BookingUpdate, BookingOut
from app.websocket.manager import manager

router = APIRouter(prefix="/bookings", tags=["Bookings"])


def _compute_queue_position(db: Session, booking: Booking) -> int:
    """Count how many active bookings exist on the same day before this one."""
    day_start = booking.appointment_date.replace(hour=0, minute=0, second=0)
    day_end = booking.appointment_date.replace(hour=23, minute=59, second=59)
    position = (
        db.query(Booking)
        .filter(
            Booking.appointment_date >= day_start,
            Booking.appointment_date <= day_end,
            Booking.status != BookingStatus.cancelled,
            Booking.id < booking.id,
        )
        .count()
    ) + 1
    return position


async def _notify_user(db: Session, user_id: int, title: str, message: str, ntype: str = "info"):
    notif = Notification(user_id=user_id, title=title, message=message, notification_type=ntype)
    db.add(notif)
    db.commit()
    db.refresh(notif)
    # Push real-time notification to the user's WS connection
    await manager.send_to_user(user_id, {
        "event": "notification",
        "data": {
            "id": notif.id,
            "title": title,
            "message": message,
            "type": ntype,
        }
    })


@router.post("/", response_model=BookingOut, status_code=201)
async def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Reject bookings in the past
    if payload.appointment_date < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Cannot book an appointment in the past")

    # Validate no double-booking for same staff + time
    conflict = (
        db.query(Booking)
        .filter(
            Booking.staff_id == payload.staff_id,
            Booking.appointment_date == payload.appointment_date,
            Booking.status != BookingStatus.cancelled,
        )
        .first()
    )
    if conflict:
        raise HTTPException(status_code=409, detail="This slot is already booked")

    booking = Booking(
        user_id=current_user.id,
        service_id=payload.service_id,
        staff_id=payload.staff_id,
        appointment_date=payload.appointment_date,
        notes=payload.notes,
        status=BookingStatus.confirmed,
        package_id=payload.package_id,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # Assign queue position
    booking.queue_position = _compute_queue_position(db, booking)
    db.commit()
    db.refresh(booking)

    service = db.query(Service).filter(Service.id == payload.service_id).first()
    staff = db.query(Staff).filter(Staff.id == payload.staff_id).first()

    # Auto-create payment if payment_method specified
    if payload.payment_method:
        amount = service.price if service else 0

        # Apply loyalty points discount
        discount = 0
        if payload.redeem_points and payload.redeem_points > 0:
            if current_user.loyalty_points >= payload.redeem_points:
                discount = payload.redeem_points * 0.5  # 1 point = Rs.0.50
                current_user.loyalty_points -= payload.redeem_points
                tx = LoyaltyTransaction(
                    user_id=current_user.id, points=-payload.redeem_points,
                    description=f"Redeemed for booking #{booking.id}",
                    booking_id=booking.id,
                )
                db.add(tx)

        final_amount = max(0, amount - discount)
        payment = Payment(
            booking_id=booking.id, user_id=current_user.id,
            amount=final_amount, payment_method=payload.payment_method,
            status=PaymentStatus.completed,
            transaction_id=f"TXN_{uuid.uuid4().hex[:12].upper()}",
        )
        db.add(payment)

        # Earn loyalty points (10 pts per Rs.100)
        points_earned = int(final_amount // 100) * 10
        if points_earned > 0:
            current_user.loyalty_points += points_earned
            earn_tx = LoyaltyTransaction(
                user_id=current_user.id, points=points_earned,
                description=f"Earned from booking #{booking.id}",
                booking_id=booking.id,
            )
            db.add(earn_tx)
        db.commit()

    # Notify user (in-app)
    await _notify_user(
        db, current_user.id,
        "Booking Confirmed",
        f"Your {service.name} with {staff.name} is confirmed for "
        f"{payload.appointment_date.strftime('%d %b %Y at %I:%M %p')}. "
        f"Queue position: #{booking.queue_position}",
        "success",
    )

    # Send mock Email notification
    email_notif = Notification(
        user_id=current_user.id,
        title="Booking Confirmation (Email)",
        message=f"Confirmation email sent for {service.name} on {payload.appointment_date.strftime('%d %b %Y at %I:%M %p')}.",
        notification_type="info", channel="email",
    )
    # Send mock SMS notification
    sms_notif = Notification(
        user_id=current_user.id,
        title="Booking Reminder (SMS)",
        message=f"SMS reminder scheduled for your {service.name} appointment.",
        notification_type="info", channel="sms",
    )
    db.add_all([email_notif, sms_notif])
    db.commit()

    # Broadcast slot blocked to ALL connected clients
    await manager.broadcast({
        "event": "slot_blocked",
        "staff_id": payload.staff_id,
        "datetime": payload.appointment_date.isoformat(),
    })

    return booking


@router.get("/my", response_model=List[BookingOut])
def my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Booking)
        .filter(Booking.user_id == current_user.id)
        .order_by(Booking.appointment_date.desc())
        .all()
    )


@router.get("/my/queue", response_model=dict)
def my_queue_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns queue info for user's next upcoming booking."""
    now = datetime.utcnow()
    booking = (
        db.query(Booking)
        .filter(
            Booking.user_id == current_user.id,
            Booking.appointment_date >= now,
            Booking.status == BookingStatus.confirmed,
        )
        .order_by(Booking.appointment_date.asc())
        .first()
    )
    if not booking:
        return {"message": "No upcoming bookings", "queue_position": None}

    # Count people ahead who are still confirmed
    day_start = booking.appointment_date.replace(hour=0, minute=0, second=0)
    people_ahead = (
        db.query(Booking)
        .filter(
            Booking.appointment_date >= day_start,
            Booking.appointment_date < booking.appointment_date,
            Booking.status == BookingStatus.confirmed,
        )
        .count()
    )

    service = db.query(Service).filter(Service.id == booking.service_id).first()
    estimated_wait = people_ahead * (service.duration_minutes if service else 30)

    total_today = (
        db.query(Booking)
        .filter(
            Booking.appointment_date >= day_start,
            Booking.status != BookingStatus.cancelled,
        )
        .count()
    )
    crowd_level = "low" if total_today < 5 else ("medium" if total_today < 10 else "high")

    return {
        "booking_id": booking.id,
        "queue_position": booking.queue_position,
        "people_ahead": people_ahead,
        "estimated_wait_minutes": estimated_wait,
        "crowd_level": crowd_level,
        "appointment_date": booking.appointment_date,
    }


@router.put("/{booking_id}/cancel", response_model=BookingOut)
async def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    if booking.status == BookingStatus.cancelled:
        raise HTTPException(status_code=400, detail="Already cancelled")

    old_datetime = booking.appointment_date

    # Apply cancellation policy — find best matching policy
    hours_until = (old_datetime - datetime.utcnow()).total_seconds() / 3600
    policy = (
        db.query(CancellationPolicy)
        .filter(CancellationPolicy.is_active == True, CancellationPolicy.hours_before <= hours_until)
        .order_by(CancellationPolicy.hours_before.desc())
        .first()
    )

    refund_pct = policy.refund_percent if policy else 100
    penalty = policy.penalty_amount if policy else 0

    # Calculate refund
    service = db.query(Service).filter(Service.id == booking.service_id).first()
    original_amount = service.price if service else 0
    refund = max(0, (original_amount * refund_pct / 100) - penalty)

    booking.status = BookingStatus.cancelled
    booking.refund_amount = round(refund, 2)
    booking.cancellation_reason = f"Cancelled by user. Refund: {refund_pct}% (Rs.{refund:.0f})"

    # Process refund on payment if exists
    payment = db.query(Payment).filter(Payment.booking_id == booking.id, Payment.status == PaymentStatus.completed).first()
    if payment:
        payment.status = PaymentStatus.refunded
        payment.refund_amount = round(refund, 2)

    db.commit()
    db.refresh(booking)

    await _notify_user(
        db, booking.user_id,
        "Booking Cancelled",
        f"Your appointment on {old_datetime.strftime('%d %b %Y at %I:%M %p')} has been cancelled. "
        f"Refund: Rs.{refund:.0f}" + (f" (Penalty: Rs.{penalty:.0f})" if penalty > 0 else ""),
        "warning",
    )

    # Notify waitlisted users for this slot
    waitlist_entries = (
        db.query(WaitlistEntry)
        .filter(
            WaitlistEntry.staff_id == booking.staff_id,
            WaitlistEntry.preferred_date == old_datetime.date(),
            WaitlistEntry.status == WaitlistStatus.waiting,
        )
        .all()
    )
    for entry in waitlist_entries:
        entry.status = WaitlistStatus.notified
        entry.notified_at = datetime.utcnow()
        await _notify_user(
            db, entry.user_id,
            "Slot Available!",
            f"A slot has opened up on {old_datetime.strftime('%d %b %Y')}. Book now before it's taken!",
            "success",
        )

    # Broadcast slot freed
    await manager.broadcast({
        "event": "slot_freed",
        "staff_id": booking.staff_id,
        "datetime": old_datetime.isoformat(),
    })

    return booking


@router.put("/{booking_id}/reschedule", response_model=BookingOut)
async def reschedule_booking(
    booking_id: int,
    payload: BookingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    if payload.appointment_date:
        # Check new slot not taken
        conflict = (
            db.query(Booking)
            .filter(
                Booking.staff_id == booking.staff_id,
                Booking.appointment_date == payload.appointment_date,
                Booking.status != BookingStatus.cancelled,
                Booking.id != booking_id,
            )
            .first()
        )
        if conflict:
            raise HTTPException(status_code=409, detail="New slot is already booked")

        old_datetime = booking.appointment_date
        booking.appointment_date = payload.appointment_date

        # Recompute queue
        booking.queue_position = _compute_queue_position(db, booking)
        db.commit()
        db.refresh(booking)

        await _notify_user(
            db, booking.user_id,
            "Booking Rescheduled 📅",
            f"Your appointment has been moved to {payload.appointment_date.strftime('%d %b %Y at %I:%M %p')}.",
            "info",
        )

        # Broadcast old slot freed, new slot blocked
        await manager.broadcast({"event": "slot_freed", "staff_id": booking.staff_id, "datetime": old_datetime.isoformat()})
        await manager.broadcast({"event": "slot_blocked", "staff_id": booking.staff_id, "datetime": payload.appointment_date.isoformat()})

    return booking


# ─── ADMIN ONLY ────────────────────────────────────────────

@router.get("/admin/all", response_model=List[BookingOut])
def admin_all_bookings(
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    return db.query(Booking).order_by(Booking.appointment_date.desc()).all()


@router.put("/admin/{booking_id}/status", response_model=BookingOut)
async def admin_update_status(
    booking_id: int,
    payload: BookingUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if payload.status:
        booking.status = payload.status
        db.commit()
        db.refresh(booking)
        # Fixed: use .value on the enum before calling string methods
        status_label = payload.status.value.capitalize()
        await _notify_user(
            db, booking.user_id,
            f"Booking {status_label}",
            f"Your booking #{booking_id} status has been updated to {payload.status.value}.",
        )
    return booking
