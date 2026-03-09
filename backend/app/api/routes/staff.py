from datetime import datetime, date, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_admin
from app.models import Staff, Booking, BookingStatus, Service, StaffLeave
from app.schemas.schemas import StaffCreate, StaffUpdate, StaffOut, SlotInfo

router = APIRouter(prefix="/staff", tags=["Staff"])


@router.get("/", response_model=List[StaffOut])
def list_staff(db: Session = Depends(get_db)):
    return db.query(Staff).filter(Staff.is_available == True).all()


@router.post("/", response_model=StaffOut, status_code=201)
def create_staff(
    payload: StaffCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    from datetime import time as dt_time
    start_h, start_m = map(int, payload.work_start.split(":"))
    end_h, end_m = map(int, payload.work_end.split(":"))
    staff = Staff(
        name=payload.name,
        specialization=payload.specialization,
        experience_years=payload.experience_years,
        work_start=dt_time(start_h, start_m),
        work_end=dt_time(end_h, end_m),
        location_id=payload.location_id,
    )
    db.add(staff)
    db.commit()
    db.refresh(staff)
    return staff


@router.put("/{staff_id}", response_model=StaffOut)
def update_staff(
    staff_id: int,
    payload: StaffUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    data = payload.model_dump(exclude_none=True)
    if "work_start" in data:
        h, m = map(int, data.pop("work_start").split(":"))
        from datetime import time as dt_time
        data["work_start"] = dt_time(h, m)
    if "work_end" in data:
        h, m = map(int, data.pop("work_end").split(":"))
        from datetime import time as dt_time
        data["work_end"] = dt_time(h, m)
    for k, v in data.items():
        setattr(staff, k, v)
    db.commit()
    db.refresh(staff)
    return staff


@router.get("/{staff_id}/slots", response_model=List[SlotInfo])
def get_available_slots(
    staff_id: int,
    date: str,  # YYYY-MM-DD
    service_id: int,
    db: Session = Depends(get_db),
):
    """
    Returns all time slots for a staff member on a given date,
    marking which are already booked. Frontend uses this to render
    the slot picker — blocked slots trigger WS broadcasts on booking.
    """
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")

    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    target_date = datetime.strptime(date, "%Y-%m-%d").date()

    # Check if staff is on leave
    leave = (
        db.query(StaffLeave)
        .filter(StaffLeave.staff_id == staff_id, StaffLeave.leave_date == target_date, StaffLeave.is_approved == True)
        .first()
    )
    if leave:
        return []  # No slots on leave day

    # Build all possible slots for the day
    slot_start = datetime.combine(target_date, staff.work_start)
    slot_end = datetime.combine(target_date, staff.work_end)
    duration = timedelta(minutes=service.duration_minutes)

    # Fetch existing bookings for this staff on this date
    day_bookings = (
        db.query(Booking)
        .filter(
            Booking.staff_id == staff_id,
            Booking.status != BookingStatus.cancelled,
            Booking.appointment_date >= slot_start,
            Booking.appointment_date < slot_end,
        )
        .all()
    )
    booked_times = {b.appointment_date for b in day_bookings}

    slots = []
    current = slot_start
    while current + duration <= slot_end:
        slots.append(SlotInfo(datetime=current, is_available=current not in booked_times))
        current += duration

    return slots
