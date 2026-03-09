from datetime import date
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models import Service, Discount
from app.schemas.schemas import ServiceCreate, ServiceUpdate, ServiceOut

router = APIRouter(prefix="/services", tags=["Services"])


def _enrich_with_discount(service: Service, db: Session) -> dict:
    """Attach active discount info to a service dict."""
    today = date.today()
    discount = (
        db.query(Discount)
        .filter(
            Discount.service_id == service.id,
            Discount.is_active == True,
            Discount.start_date <= today,
            Discount.end_date >= today,
        )
        .first()
    )
    data = {c.name: getattr(service, c.name) for c in service.__table__.columns}
    if discount:
        data["discount_type"] = discount.discount_type.value
        data["discount_value"] = discount.discount_value
        if discount.discount_type.value == "percentage":
            data["discounted_price"] = round(service.price * (1 - discount.discount_value / 100), 2)
        else:
            data["discounted_price"] = round(max(0, service.price - discount.discount_value), 2)
    return data


@router.get("/", response_model=List[ServiceOut])
def list_services(db: Session = Depends(get_db)):
    """Public — anyone can view available services."""
    services = db.query(Service).filter(Service.is_active == True).all()
    return [_enrich_with_discount(s, db) for s in services]


@router.get("/all", response_model=List[ServiceOut])
def list_all_services(db: Session = Depends(get_db), _=Depends(require_admin)):
    """Admin only — includes inactive services."""
    services = db.query(Service).all()
    return [_enrich_with_discount(s, db) for s in services]


@router.post("/", response_model=ServiceOut, status_code=201)
def create_service(
    payload: ServiceCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    service = Service(**payload.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return _enrich_with_discount(service, db)


@router.put("/{service_id}", response_model=ServiceOut)
def update_service(
    service_id: int,
    payload: ServiceUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(service, k, v)
    db.commit()
    db.refresh(service)
    return _enrich_with_discount(service, db)


@router.delete("/{service_id}", status_code=204)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    service.is_active = False  # Soft delete — preserve booking history
    db.commit()
