"""Orders API — checkout, order tracking, admin management."""

import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models import Order, OrderItem, CartItem, Product, User, OrderStatus
from app.schemas.schemas import OrderCreate, OrderOut, OrderItemOut

router = APIRouter(prefix="/orders", tags=["Orders"])


def _enrich_order(order):
    items = []
    for item in order.items:
        item_data = {
            "id": item.id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price": item.price,
        }
        if item.product:
            item_data["product_name"] = item.product.name
            item_data["product_image"] = item.product.image_url
        items.append(item_data)

    return {
        "id": order.id,
        "user_id": order.user_id,
        "total_amount": order.total_amount,
        "payment_method": order.payment_method,
        "status": order.status,
        "shipping_address": order.shipping_address,
        "tracking_id": order.tracking_id,
        "notes": order.notes,
        "items": items,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
    }


@router.post("/", response_model=OrderOut, status_code=201)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    cart_items = db.query(CartItem).filter(CartItem.user_id == user.id).all()
    if not cart_items:
        raise HTTPException(400, "Cart is empty")

    total = 0
    order_items = []
    for ci in cart_items:
        product = db.query(Product).filter(Product.id == ci.product_id).first()
        if not product or not product.is_active:
            raise HTTPException(400, f"Product {ci.product_id} not available")
        if product.stock < ci.quantity:
            raise HTTPException(400, f"Insufficient stock for {product.name}")

        price = product.discount_price if product.discount_price else product.price
        total += price * ci.quantity
        order_items.append(OrderItem(
            product_id=ci.product_id,
            quantity=ci.quantity,
            price=price,
        ))
        product.stock -= ci.quantity

    order = Order(
        user_id=user.id,
        total_amount=round(total, 2),
        payment_method=payload.payment_method,
        shipping_address=payload.shipping_address,
        notes=payload.notes,
        tracking_id=f"SS-{uuid.uuid4().hex[:8].upper()}",
        status=OrderStatus.placed,
    )
    order.items = order_items
    db.add(order)

    db.query(CartItem).filter(CartItem.user_id == user.id).delete()
    db.commit()
    db.refresh(order)
    return OrderOut(**_enrich_order(order))


@router.get("/my", response_model=list[OrderOut])
def my_orders(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    orders = db.query(Order).filter(Order.user_id == user.id).order_by(Order.created_at.desc()).all()
    return [OrderOut(**_enrich_order(o)) for o in orders]


@router.get("/my/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == user.id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    return OrderOut(**_enrich_order(order))


@router.get("/track/{tracking_id}", response_model=OrderOut)
def track_order(tracking_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.tracking_id == tracking_id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    return OrderOut(**_enrich_order(order))


@router.put("/my/{order_id}/cancel")
def cancel_order(order_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == user.id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    if order.status not in [OrderStatus.placed, OrderStatus.confirmed]:
        raise HTTPException(400, "Cannot cancel this order")
    order.status = OrderStatus.cancelled
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.stock += item.quantity
    db.commit()
    return {"message": "Order cancelled"}


# ─── Admin ────────────────────────────────────────────────────────────────────

@router.get("/admin/all", response_model=list[OrderOut])
def admin_all_orders(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    q = db.query(Order)
    if status:
        q = q.filter(Order.status == status)
    orders = q.order_by(Order.created_at.desc()).all()
    return [OrderOut(**_enrich_order(o)) for o in orders]


@router.put("/admin/{order_id}/status")
def admin_update_order_status(
    order_id: int,
    status: str = Query(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    try:
        order.status = OrderStatus(status)
    except ValueError:
        raise HTTPException(400, "Invalid status")
    db.commit()
    return {"message": f"Order status updated to {status}"}
