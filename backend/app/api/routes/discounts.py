"""Discount Management — CRUD endpoints (admin only) + public active discounts."""

from datetime import date
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_admin
from app.models import Discount, Service
from app.schemas.schemas import DiscountCreate, DiscountUpdate, DiscountOut

router = APIRouter(prefix="/discounts", tags=["Discounts"])


def _to_out(d: Discount, db: Session) -> dict:
    svc = db.query(Service).filter(Service.id == d.service_id).first()
    return {
        **{c.name: getattr(d, c.name) for c in d.__table__.columns},
        "service_name": svc.name if svc else None,
    }


@router.get("/", response_model=List[DiscountOut])
def list_active_discounts(db: Session = Depends(get_db)):
    """Public — list currently active discounts."""
    today = date.today()
    discounts = (
        db.query(Discount)
        .filter(Discount.is_active == True, Discount.start_date <= today, Discount.end_date >= today)
        .all()
    )
    return [_to_out(d, db) for d in discounts]


@router.get("/all", response_model=List[DiscountOut])
def list_all_discounts(db: Session = Depends(get_db), _=Depends(require_admin)):
    """Admin — list all discounts including inactive/expired."""
    return [_to_out(d, db) for d in db.query(Discount).order_by(Discount.id.desc()).all()]


@router.post("/", response_model=DiscountOut, status_code=201)
def create_discount(payload: DiscountCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    svc = db.query(Service).filter(Service.id == payload.service_id).first()
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")
    if payload.end_date < payload.start_date:
        raise HTTPException(status_code=400, detail="End date must be after start date")
    if payload.discount_type == "percentage" and payload.discount_value > 100:
        raise HTTPException(status_code=400, detail="Percentage discount cannot exceed 100")
    # Deactivate any existing active discount for this service
    db.query(Discount).filter(
        Discount.service_id == payload.service_id, Discount.is_active == True
    ).update({"is_active": False})
    discount = Discount(**payload.model_dump())
    db.add(discount)
    db.commit()
    db.refresh(discount)
    return _to_out(discount, db)


@router.put("/{discount_id}", response_model=DiscountOut)
def update_discount(discount_id: int, payload: DiscountUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    discount = db.query(Discount).filter(Discount.id == discount_id).first()
    if not discount:
        raise HTTPException(status_code=404, detail="Discount not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(discount, k, v)
    db.commit()
    db.refresh(discount)
    return _to_out(discount, db)


@router.delete("/{discount_id}", status_code=204)
def disable_discount(discount_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    discount = db.query(Discount).filter(Discount.id == discount_id).first()
    if not discount:
        raise HTTPException(status_code=404, detail="Discount not found")
    discount.is_active = False
    db.commit()
