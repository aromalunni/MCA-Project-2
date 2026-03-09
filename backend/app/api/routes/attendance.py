"""Staff attendance API — tracking daily attendance."""

from datetime import time as time_type, date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_admin
from app.models import StaffAttendance, Staff, User, AttendanceStatus
from app.schemas.schemas import AttendanceCreate, AttendanceOut

router = APIRouter(prefix="/attendance", tags=["Attendance"])


def _parse_time(t_str: Optional[str]) -> Optional[time_type]:
    if not t_str:
        return None
    parts = t_str.split(":")
    return time_type(int(parts[0]), int(parts[1]))


def _enrich(record):
    data = {c.name: getattr(record, c.name) for c in record.__table__.columns}
    if record.staff:
        data["staff_name"] = record.staff.name
    return data


@router.get("/", response_model=list[AttendanceOut])
def list_attendance(
    staff_id: Optional[int] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    q = db.query(StaffAttendance)
    if staff_id:
        q = q.filter(StaffAttendance.staff_id == staff_id)
    if date_from:
        q = q.filter(StaffAttendance.date >= date_from)
    if date_to:
        q = q.filter(StaffAttendance.date <= date_to)
    if status:
        q = q.filter(StaffAttendance.status == status)
    records = q.order_by(StaffAttendance.date.desc()).all()
    return [AttendanceOut(**_enrich(r)) for r in records]


@router.post("/", response_model=AttendanceOut, status_code=201)
def mark_attendance(
    payload: AttendanceCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    staff = db.query(Staff).filter(Staff.id == payload.staff_id).first()
    if not staff:
        raise HTTPException(404, "Staff not found")

    existing = db.query(StaffAttendance).filter(
        StaffAttendance.staff_id == payload.staff_id,
        StaffAttendance.date == payload.date,
    ).first()
    if existing:
        raise HTTPException(400, "Attendance already marked for this date")

    record = StaffAttendance(
        staff_id=payload.staff_id,
        date=payload.date,
        check_in=_parse_time(payload.check_in),
        check_out=_parse_time(payload.check_out),
        status=payload.status,
        notes=payload.notes,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return AttendanceOut(**_enrich(record))


@router.put("/{record_id}", response_model=AttendanceOut)
def update_attendance(
    record_id: int,
    payload: AttendanceCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    record = db.query(StaffAttendance).filter(StaffAttendance.id == record_id).first()
    if not record:
        raise HTTPException(404, "Record not found")
    record.check_in = _parse_time(payload.check_in)
    record.check_out = _parse_time(payload.check_out)
    record.status = payload.status
    record.notes = payload.notes
    db.commit()
    db.refresh(record)
    return AttendanceOut(**_enrich(record))


@router.delete("/{record_id}")
def delete_attendance(
    record_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    record = db.query(StaffAttendance).filter(StaffAttendance.id == record_id).first()
    if not record:
        raise HTTPException(404, "Record not found")
    db.delete(record)
    db.commit()
    return {"message": "Attendance record deleted"}


@router.get("/summary")
def attendance_summary(
    month: int = Query(...),
    year: int = Query(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Get monthly attendance summary for all staff."""
    from sqlalchemy import func, extract

    staff_list = db.query(Staff).filter(Staff.is_available == True).all()
    summaries = []
    for s in staff_list:
        records = db.query(StaffAttendance).filter(
            StaffAttendance.staff_id == s.id,
            extract("month", StaffAttendance.date) == month,
            extract("year", StaffAttendance.date) == year,
        ).all()
        present = sum(1 for r in records if r.status == AttendanceStatus.present)
        absent = sum(1 for r in records if r.status == AttendanceStatus.absent)
        half_day = sum(1 for r in records if r.status == AttendanceStatus.half_day)
        late = sum(1 for r in records if r.status == AttendanceStatus.late)
        summaries.append({
            "staff_id": s.id,
            "staff_name": s.name,
            "present": present,
            "absent": absent,
            "half_day": half_day,
            "late": late,
            "total_days": len(records),
        })
    return summaries
