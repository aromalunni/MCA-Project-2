"""
Locations router — multi-branch salon support.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import time as dt_time

from app.core.database import get_db
from app.core.security import require_admin
from app.models import Location
from app.schemas.schemas import LocationCreate, LocationUpdate, LocationOut

router = APIRouter(prefix="/locations", tags=["Locations"])


@router.get("/", response_model=List[LocationOut])
def list_locations(db: Session = Depends(get_db)):
    locations = db.query(Location).filter(Location.is_active == True).all()
    return [LocationOut.model_validate(loc) for loc in locations]


@router.get("/all", response_model=List[LocationOut])
def list_all_locations(db: Session = Depends(get_db), _=Depends(require_admin)):
    locations = db.query(Location).all()
    return [LocationOut.model_validate(loc) for loc in locations]


@router.post("/", response_model=LocationOut, status_code=201)
def create_location(
    payload: LocationCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    opening = None
    closing = None
    if payload.opening_time:
        h, m = map(int, payload.opening_time.split(":"))
        opening = dt_time(h, m)
    if payload.closing_time:
        h, m = map(int, payload.closing_time.split(":"))
        closing = dt_time(h, m)

    loc = Location(
        name=payload.name, address=payload.address, city=payload.city,
        phone=payload.phone, email=payload.email,
        opening_time=opening, closing_time=closing,
    )
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return LocationOut.model_validate(loc)


@router.put("/{loc_id}", response_model=LocationOut)
def update_location(
    loc_id: int,
    payload: LocationUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    loc = db.query(Location).filter(Location.id == loc_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")

    data = payload.model_dump(exclude_none=True)
    if "opening_time" in data:
        h, m = map(int, data.pop("opening_time").split(":"))
        data["opening_time"] = dt_time(h, m)
    if "closing_time" in data:
        h, m = map(int, data.pop("closing_time").split(":"))
        data["closing_time"] = dt_time(h, m)

    for k, v in data.items():
        setattr(loc, k, v)
    db.commit()
    db.refresh(loc)
    return LocationOut.model_validate(loc)


@router.delete("/{loc_id}", status_code=204)
def delete_location(
    loc_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    loc = db.query(Location).filter(Location.id == loc_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    loc.is_active = False
    db.commit()
