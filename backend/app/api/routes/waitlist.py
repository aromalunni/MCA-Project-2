"""
Waitlist router — join waitlist when slots are fully booked.
When a slot frees up, waitlisted users are notified.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models import WaitlistEntry, WaitlistStatus, User, Notification
from app.schemas.schemas import WaitlistCreate, WaitlistOut
from app.websocket.manager import manager

router = APIRouter(prefix="/waitlist", tags=["Waitlist"])


@router.post("/", response_model=WaitlistOut, status_code=201)
def join_waitlist(
    payload: WaitlistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = (
        db.query(WaitlistEntry)
        .filter(
            WaitlistEntry.user_id == current_user.id,
            WaitlistEntry.staff_id == payload.staff_id,
            WaitlistEntry.preferred_date == payload.preferred_date,
            WaitlistEntry.status == WaitlistStatus.waiting,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already on waitlist for this date & staff")

    entry = WaitlistEntry(
        user_id=current_user.id,
        staff_id=payload.staff_id,
        service_id=payload.service_id,
        preferred_date=payload.preferred_date,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/my", response_model=List[WaitlistOut])
def my_waitlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(WaitlistEntry)
        .filter(WaitlistEntry.user_id == current_user.id)
        .order_by(WaitlistEntry.created_at.desc())
        .all()
    )


@router.delete("/{entry_id}", status_code=204)
def leave_waitlist(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = db.query(WaitlistEntry).filter(WaitlistEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Waitlist entry not found")
    if entry.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(entry)
    db.commit()


@router.get("/admin/all", response_model=List[WaitlistOut])
def admin_all_waitlist(
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    return db.query(WaitlistEntry).order_by(WaitlistEntry.created_at.desc()).all()
