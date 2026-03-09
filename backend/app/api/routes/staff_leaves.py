"""
Staff Leaves router — manage staff holidays/leave days.
"""

from datetime import date
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_admin
from app.models import StaffLeave, Staff
from app.schemas.schemas import StaffLeaveCreate, StaffLeaveOut

router = APIRouter(prefix="/staff-leaves", tags=["Staff Leaves"])


@router.post("/", response_model=StaffLeaveOut, status_code=201)
def create_leave(
    payload: StaffLeaveCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    staff = db.query(Staff).filter(Staff.id == payload.staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")

    existing = (
        db.query(StaffLeave)
        .filter(StaffLeave.staff_id == payload.staff_id, StaffLeave.leave_date == payload.leave_date)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Leave already exists for this date")

    leave = StaffLeave(
        staff_id=payload.staff_id,
        leave_date=payload.leave_date,
        leave_type=payload.leave_type,
        reason=payload.reason,
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return leave


@router.get("/", response_model=List[StaffLeaveOut])
def list_leaves(
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    return db.query(StaffLeave).order_by(StaffLeave.leave_date.desc()).all()


@router.get("/staff/{staff_id}", response_model=List[StaffLeaveOut])
def staff_leaves(staff_id: int, db: Session = Depends(get_db)):
    return (
        db.query(StaffLeave)
        .filter(StaffLeave.staff_id == staff_id, StaffLeave.leave_date >= date.today())
        .order_by(StaffLeave.leave_date.asc())
        .all()
    )


@router.get("/staff/{staff_id}/check")
def check_staff_available(staff_id: int, check_date: str, db: Session = Depends(get_db)):
    """Check if staff is available on a specific date."""
    target = date.fromisoformat(check_date)
    leave = (
        db.query(StaffLeave)
        .filter(
            StaffLeave.staff_id == staff_id,
            StaffLeave.leave_date == target,
            StaffLeave.is_approved == True,
        )
        .first()
    )
    return {"available": leave is None, "leave": leave.leave_type if leave else None}


@router.delete("/{leave_id}", status_code=204)
def delete_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    leave = db.query(StaffLeave).filter(StaffLeave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    db.delete(leave)
    db.commit()
