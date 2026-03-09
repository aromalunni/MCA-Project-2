"""
Payments router — mock payment gateway (no real API keys needed).
Simulates: initiate payment, confirm, refund.
"""

import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models import Payment, PaymentStatus, PaymentMethod, Booking, BookingStatus, User, Service, Notification, LoyaltyTransaction
from app.schemas.schemas import PaymentCreate, PaymentOut
from app.websocket.manager import manager

router = APIRouter(prefix="/payments", tags=["Payments"])


def _mock_transaction_id():
    return f"TXN_{uuid.uuid4().hex[:12].upper()}"


async def _notify_user(db: Session, user_id: int, title: str, message: str, ntype: str = "info"):
    notif = Notification(user_id=user_id, title=title, message=message, notification_type=ntype)
    db.add(notif)
    db.commit()
    db.refresh(notif)
    await manager.send_to_user(user_id, {
        "event": "notification",
        "data": {"id": notif.id, "title": title, "message": message, "type": ntype}
    })


@router.post("/initiate", response_model=PaymentOut, status_code=201)
async def initiate_payment(
    payload: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == payload.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")

    existing = db.query(Payment).filter(Payment.booking_id == payload.booking_id).first()
    if existing and existing.status == PaymentStatus.completed:
        raise HTTPException(status_code=400, detail="Payment already completed")

    service = db.query(Service).filter(Service.id == booking.service_id).first()
    amount = service.price if service else 0

    if existing:
        existing.payment_method = payload.payment_method
        existing.status = PaymentStatus.pending
        db.commit()
        db.refresh(existing)
        return existing

    payment = Payment(
        booking_id=payload.booking_id,
        user_id=current_user.id,
        amount=amount,
        payment_method=payload.payment_method,
        status=PaymentStatus.pending,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


@router.put("/{payment_id}/confirm", response_model=PaymentOut)
async def confirm_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    if payment.status == PaymentStatus.completed:
        raise HTTPException(status_code=400, detail="Already completed")

    # Mock: simulate successful payment
    payment.status = PaymentStatus.completed
    payment.transaction_id = _mock_transaction_id()
    db.commit()
    db.refresh(payment)

    # Award loyalty points (10 points per 100 spent)
    points_earned = int(payment.amount // 100) * 10
    if points_earned > 0:
        current_user.loyalty_points += points_earned
        tx = LoyaltyTransaction(
            user_id=current_user.id, points=points_earned,
            description=f"Earned from booking #{payment.booking_id}",
            booking_id=payment.booking_id,
        )
        db.add(tx)
        db.commit()

    await _notify_user(
        db, current_user.id,
        "Payment Successful",
        f"Payment of Rs.{payment.amount:.0f} confirmed. Transaction: {payment.transaction_id}",
        "success",
    )

    # Also send mock email/SMS notification
    email_notif = Notification(
        user_id=current_user.id,
        title="Payment Receipt (Email)",
        message=f"Receipt for Rs.{payment.amount:.0f} sent to your email.",
        notification_type="info",
        channel="email",
    )
    sms_notif = Notification(
        user_id=current_user.id,
        title="Booking Confirmed (SMS)",
        message=f"Your booking #{payment.booking_id} is confirmed. Amount: Rs.{payment.amount:.0f}",
        notification_type="info",
        channel="sms",
    )
    db.add_all([email_notif, sms_notif])
    db.commit()

    return payment


@router.put("/{payment_id}/refund", response_model=PaymentOut)
async def refund_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    if payment.status != PaymentStatus.completed:
        raise HTTPException(status_code=400, detail="Can only refund completed payments")

    payment.status = PaymentStatus.refunded
    payment.refund_amount = payment.amount

    # Update booking
    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    if booking:
        booking.refund_amount = payment.amount

    db.commit()
    db.refresh(payment)

    await _notify_user(
        db, payment.user_id,
        "Refund Processed",
        f"Refund of Rs.{payment.amount:.0f} has been processed for booking #{payment.booking_id}.",
        "info",
    )

    return payment


@router.get("/my", response_model=List[PaymentOut])
def my_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Payment).filter(Payment.user_id == current_user.id).order_by(Payment.created_at.desc()).all()


@router.get("/booking/{booking_id}", response_model=PaymentOut)
def get_booking_payment(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payment = db.query(Payment).filter(Payment.booking_id == booking_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="No payment for this booking")
    if payment.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return payment


@router.get("/admin/all", response_model=List[PaymentOut])
def admin_all_payments(
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    return db.query(Payment).order_by(Payment.created_at.desc()).all()
