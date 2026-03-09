"""
Service Categories router.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_admin
from app.models import ServiceCategory
from app.schemas.schemas import CategoryCreate, CategoryOut

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("/", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(ServiceCategory).filter(ServiceCategory.is_active == True).all()


@router.get("/all", response_model=List[CategoryOut])
def list_all_categories(db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(ServiceCategory).all()


@router.post("/", response_model=CategoryOut, status_code=201)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    existing = db.query(ServiceCategory).filter(ServiceCategory.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    cat = ServiceCategory(**payload.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/{cat_id}", response_model=CategoryOut)
def update_category(
    cat_id: int,
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    cat = db.query(ServiceCategory).filter(ServiceCategory.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(cat, k, v)
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/{cat_id}", status_code=204)
def delete_category(
    cat_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    cat = db.query(ServiceCategory).filter(ServiceCategory.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    cat.is_active = False
    db.commit()
