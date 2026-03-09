"""
Loyalty Points router — earn & redeem points.
Points are earned automatically on payment (10 pts per Rs.100).
Points can be redeemed for discounts (100 pts = Rs.50 off).
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models import User, LoyaltyTransaction
from app.schemas.schemas import LoyaltyTransactionOut, LoyaltyRedeemRequest

router = APIRouter(prefix="/loyalty", tags=["Loyalty"])

POINTS_PER_100 = 10      # earn 10 points per Rs.100 spent
REDEEM_RATE = 0.5         # 1 point = Rs.0.50 discount


@router.get("/balance")
def get_balance(
    current_user: User = Depends(get_current_user),
):
    return {
        "user_id": current_user.id,
        "points": current_user.loyalty_points,
        "value": round(current_user.loyalty_points * REDEEM_RATE, 2),
    }


@router.get("/history", response_model=List[LoyaltyTransactionOut])
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(LoyaltyTransaction)
        .filter(LoyaltyTransaction.user_id == current_user.id)
        .order_by(LoyaltyTransaction.created_at.desc())
        .limit(50)
        .all()
    )


@router.post("/redeem")
def redeem_points(
    payload: LoyaltyRedeemRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.loyalty_points < payload.points:
        raise HTTPException(status_code=400, detail="Insufficient points")

    discount = round(payload.points * REDEEM_RATE, 2)
    current_user.loyalty_points -= payload.points

    tx = LoyaltyTransaction(
        user_id=current_user.id,
        points=-payload.points,
        description=f"Redeemed {payload.points} points for Rs.{discount:.0f} discount",
    )
    db.add(tx)
    db.commit()

    return {
        "redeemed": payload.points,
        "discount_amount": discount,
        "remaining_points": current_user.loyalty_points,
    }


@router.get("/admin/all", response_model=List[LoyaltyTransactionOut])
def admin_all_transactions(
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    return db.query(LoyaltyTransaction).order_by(LoyaltyTransaction.created_at.desc()).limit(100).all()
