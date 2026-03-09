"""
Reviews router — ratings & reviews for staff/services after completed bookings.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models import Review, Booking, BookingStatus, User
from app.schemas.schemas import ReviewCreate, ReviewOut

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("/", response_model=ReviewOut, status_code=201)
def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == payload.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")
    if booking.status != BookingStatus.completed:
        raise HTTPException(status_code=400, detail="Can only review completed bookings")

    existing = db.query(Review).filter(Review.booking_id == payload.booking_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already reviewed this booking")

    review = Review(
        booking_id=payload.booking_id,
        user_id=current_user.id,
        staff_id=booking.staff_id,
        service_id=booking.service_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    return ReviewOut(
        id=review.id, booking_id=review.booking_id,
        user_id=review.user_id, staff_id=review.staff_id,
        service_id=review.service_id, rating=review.rating,
        comment=review.comment, created_at=review.created_at,
        user_name=current_user.name,
    )


@router.get("/staff/{staff_id}", response_model=List[ReviewOut])
def staff_reviews(staff_id: int, db: Session = Depends(get_db)):
    reviews = (
        db.query(Review)
        .filter(Review.staff_id == staff_id)
        .order_by(Review.created_at.desc())
        .limit(50)
        .all()
    )
    result = []
    for r in reviews:
        user = db.query(User).filter(User.id == r.user_id).first()
        result.append(ReviewOut(
            id=r.id, booking_id=r.booking_id,
            user_id=r.user_id, staff_id=r.staff_id,
            service_id=r.service_id, rating=r.rating,
            comment=r.comment, created_at=r.created_at,
            user_name=user.name if user else None,
        ))
    return result


@router.get("/service/{service_id}", response_model=List[ReviewOut])
def service_reviews(service_id: int, db: Session = Depends(get_db)):
    reviews = (
        db.query(Review)
        .filter(Review.service_id == service_id)
        .order_by(Review.created_at.desc())
        .limit(50)
        .all()
    )
    result = []
    for r in reviews:
        user = db.query(User).filter(User.id == r.user_id).first()
        result.append(ReviewOut(
            id=r.id, booking_id=r.booking_id,
            user_id=r.user_id, staff_id=r.staff_id,
            service_id=r.service_id, rating=r.rating,
            comment=r.comment, created_at=r.created_at,
            user_name=user.name if user else None,
        ))
    return result


@router.get("/my", response_model=List[ReviewOut])
def my_reviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reviews = (
        db.query(Review)
        .filter(Review.user_id == current_user.id)
        .order_by(Review.created_at.desc())
        .all()
    )
    return [
        ReviewOut(
            id=r.id, booking_id=r.booking_id,
            user_id=r.user_id, staff_id=r.staff_id,
            service_id=r.service_id, rating=r.rating,
            comment=r.comment, created_at=r.created_at,
            user_name=current_user.name,
        )
        for r in reviews
    ]


@router.get("/staff/{staff_id}/average")
def staff_average_rating(staff_id: int, db: Session = Depends(get_db)):
    result = db.query(func.avg(Review.rating), func.count(Review.id)).filter(Review.staff_id == staff_id).first()
    avg_rating = float(result[0]) if result[0] else 0
    count = result[1]
    return {"staff_id": staff_id, "average_rating": round(avg_rating, 1), "total_reviews": count}
