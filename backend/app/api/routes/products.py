"""Product store API — CRUD for beauty products and product categories."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models import Product, ProductCategory, User
from app.schemas.schemas import (
    ProductCreate, ProductUpdate, ProductOut,
    ProductCategoryCreate, ProductCategoryOut,
)

router = APIRouter(tags=["Products"])


# ─── Product Categories ──────────────────────────────────────────────────────

@router.get("/product-categories", response_model=list[ProductCategoryOut])
def list_product_categories(db: Session = Depends(get_db)):
    return db.query(ProductCategory).filter(ProductCategory.is_active == True).all()


@router.post("/product-categories", response_model=ProductCategoryOut, status_code=201)
def create_product_category(
    payload: ProductCategoryCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    cat = ProductCategory(**payload.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


# ─── Products ────────────────────────────────────────────────────────────────

def _enrich_product(p, db):
    """Add category_name to product output."""
    data = {c.name: getattr(p, c.name) for c in p.__table__.columns}
    if p.category:
        data["category_name"] = p.category.name
    return data


@router.get("/products", response_model=list[ProductOut])
def list_products(
    category_id: Optional[int] = Query(None),
    gender: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    brand: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Product).filter(Product.is_active == True)
    if category_id:
        q = q.filter(Product.category_id == category_id)
    if gender:
        q = q.filter(Product.gender == gender)
    if search:
        q = q.filter(Product.name.ilike(f"%{search}%"))
    if min_price is not None:
        q = q.filter(Product.price >= min_price)
    if max_price is not None:
        q = q.filter(Product.price <= max_price)
    if brand:
        q = q.filter(Product.brand.ilike(f"%{brand}%"))

    products = q.order_by(Product.created_at.desc()).all()
    result = []
    for p in products:
        data = _enrich_product(p, db)
        result.append(ProductOut(**data))
    return result


@router.get("/products/all", response_model=list[ProductOut])
def list_all_products(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    products = db.query(Product).order_by(Product.created_at.desc()).all()
    return [ProductOut(**_enrich_product(p, db)) for p in products]


@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(404, "Product not found")
    return ProductOut(**_enrich_product(p, db))


@router.post("/products", response_model=ProductOut, status_code=201)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return ProductOut(**_enrich_product(product, db))


@router.put("/products/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(product, k, v)
    db.commit()
    db.refresh(product)
    return ProductOut(**_enrich_product(product, db))


@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")
    product.is_active = False
    db.commit()
    return {"message": "Product deactivated"}
