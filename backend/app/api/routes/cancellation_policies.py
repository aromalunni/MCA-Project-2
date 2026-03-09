"""
Cancellation Policies router — define refund rules based on timing.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_admin
from app.models import CancellationPolicy
from app.schemas.schemas import CancellationPolicyCreate, CancellationPolicyOut

router = APIRouter(prefix="/cancellation-policies", tags=["Cancellation Policies"])


@router.get("/", response_model=List[CancellationPolicyOut])
def list_policies(db: Session = Depends(get_db)):
    return db.query(CancellationPolicy).filter(CancellationPolicy.is_active == True).order_by(CancellationPolicy.hours_before.desc()).all()


@router.post("/", response_model=CancellationPolicyOut, status_code=201)
def create_policy(
    payload: CancellationPolicyCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    policy = CancellationPolicy(**payload.model_dump())
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy


@router.put("/{policy_id}", response_model=CancellationPolicyOut)
def update_policy(
    policy_id: int,
    payload: CancellationPolicyCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    policy = db.query(CancellationPolicy).filter(CancellationPolicy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    for k, v in payload.model_dump().items():
        setattr(policy, k, v)
    db.commit()
    db.refresh(policy)
    return policy


@router.delete("/{policy_id}", status_code=204)
def delete_policy(
    policy_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    policy = db.query(CancellationPolicy).filter(CancellationPolicy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    policy.is_active = False
    db.commit()
