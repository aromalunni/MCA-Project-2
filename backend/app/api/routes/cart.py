"""Shopping cart API."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import CartItem, Product, User
from app.schemas.schemas import CartItemCreate, CartItemOut

router = APIRouter(prefix="/cart", tags=["Cart"])


def _enrich_cart_item(item):
    data = {
        "id": item.id,
        "product_id": item.product_id,
        "quantity": item.quantity,
    }
    if item.product:
        data["product_name"] = item.product.name
        data["product_price"] = item.product.price
        data["product_discount_price"] = item.product.discount_price
        data["product_image"] = item.product.image_url
    return data


@router.get("/", response_model=list[CartItemOut])
def get_cart(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    items = db.query(CartItem).filter(CartItem.user_id == user.id).all()
    return [CartItemOut(**_enrich_cart_item(i)) for i in items]


@router.post("/", response_model=CartItemOut, status_code=201)
def add_to_cart(
    payload: CartItemCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == payload.product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(404, "Product not found")
    if product.stock < payload.quantity:
        raise HTTPException(400, "Insufficient stock")

    existing = db.query(CartItem).filter(
        CartItem.user_id == user.id, CartItem.product_id == payload.product_id
    ).first()
    if existing:
        existing.quantity += payload.quantity
        db.commit()
        db.refresh(existing)
        return CartItemOut(**_enrich_cart_item(existing))

    item = CartItem(user_id=user.id, product_id=payload.product_id, quantity=payload.quantity)
    db.add(item)
    db.commit()
    db.refresh(item)
    return CartItemOut(**_enrich_cart_item(item))


@router.put("/{item_id}", response_model=CartItemOut)
def update_cart_item(
    item_id: int,
    payload: CartItemCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == user.id).first()
    if not item:
        raise HTTPException(404, "Cart item not found")
    item.quantity = payload.quantity
    db.commit()
    db.refresh(item)
    return CartItemOut(**_enrich_cart_item(item))


@router.delete("/{item_id}")
def remove_from_cart(
    item_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == user.id).first()
    if not item:
        raise HTTPException(404, "Cart item not found")
    db.delete(item)
    db.commit()
    return {"message": "Removed from cart"}


@router.delete("/")
def clear_cart(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    db.query(CartItem).filter(CartItem.user_id == user.id).delete()
    db.commit()
    return {"message": "Cart cleared"}
