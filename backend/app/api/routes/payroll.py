"""Staff payroll API — salary management."""

from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_admin
from app.models import StaffPayroll, Staff, User, PayrollStatus
from app.schemas.schemas import PayrollCreate, PayrollOut

router = APIRouter(prefix="/payroll", tags=["Payroll"])


def _enrich(record):
    data = {c.name: getattr(record, c.name) for c in record.__table__.columns}
    if record.staff:
        data["staff_name"] = record.staff.name
    return data


@router.get("/", response_model=list[PayrollOut])
def list_payroll(
    staff_id: Optional[int] = Query(None),
    month: Optional[int] = Query(None),
    year: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    q = db.query(StaffPayroll)
    if staff_id:
        q = q.filter(StaffPayroll.staff_id == staff_id)
    if month:
        q = q.filter(StaffPayroll.month == month)
    if year:
        q = q.filter(StaffPayroll.year == year)
    if status:
        q = q.filter(StaffPayroll.status == status)
    records = q.order_by(StaffPayroll.year.desc(), StaffPayroll.month.desc()).all()
    return [PayrollOut(**_enrich(r)) for r in records]


@router.post("/", response_model=PayrollOut, status_code=201)
def create_payroll(
    payload: PayrollCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    staff = db.query(Staff).filter(Staff.id == payload.staff_id).first()
    if not staff:
        raise HTTPException(404, "Staff not found")

    existing = db.query(StaffPayroll).filter(
        StaffPayroll.staff_id == payload.staff_id,
        StaffPayroll.month == payload.month,
        StaffPayroll.year == payload.year,
    ).first()
    if existing:
        raise HTTPException(400, "Payroll already exists for this month")

    net = payload.base_salary + payload.bonus - payload.deductions
    record = StaffPayroll(
        staff_id=payload.staff_id,
        month=payload.month,
        year=payload.year,
        base_salary=payload.base_salary,
        bonus=payload.bonus,
        deductions=payload.deductions,
        net_salary=round(net, 2),
        notes=payload.notes,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return PayrollOut(**_enrich(record))


@router.put("/{record_id}/pay")
def mark_paid(
    record_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    record = db.query(StaffPayroll).filter(StaffPayroll.id == record_id).first()
    if not record:
        raise HTTPException(404, "Payroll record not found")
    record.status = PayrollStatus.paid
    record.paid_date = date.today()
    db.commit()
    return {"message": "Marked as paid"}


@router.put("/{record_id}/hold")
def hold_payroll(
    record_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    record = db.query(StaffPayroll).filter(StaffPayroll.id == record_id).first()
    if not record:
        raise HTTPException(404, "Payroll record not found")
    record.status = PayrollStatus.hold
    db.commit()
    return {"message": "Payroll on hold"}


@router.delete("/{record_id}")
def delete_payroll(
    record_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    record = db.query(StaffPayroll).filter(StaffPayroll.id == record_id).first()
    if not record:
        raise HTTPException(404, "Payroll record not found")
    db.delete(record)
    db.commit()
    return {"message": "Payroll record deleted"}
