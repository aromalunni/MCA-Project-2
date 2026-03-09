"""
Packages router — service bundles with discounts.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_admin
from app.models import Package, PackageItem, Service
from app.schemas.schemas import PackageCreate, PackageOut, ServiceOut

router = APIRouter(prefix="/packages", tags=["Packages"])


def _package_to_out(pkg: Package) -> PackageOut:
    services = [ServiceOut.model_validate(item.service) for item in pkg.items if item.service]
    total = sum(s.price for s in services)
    total_price = total * (1 - pkg.discount_percent / 100)
    total_duration = sum(s.duration_minutes for s in services)
    return PackageOut(
        id=pkg.id, name=pkg.name, description=pkg.description,
        discount_percent=pkg.discount_percent, is_active=pkg.is_active,
        total_price=round(total_price, 2), total_duration=total_duration,
        services=services, created_at=pkg.created_at,
    )


@router.get("/", response_model=List[PackageOut])
def list_packages(db: Session = Depends(get_db)):
    packages = db.query(Package).filter(Package.is_active == True).all()
    return [_package_to_out(p) for p in packages]


@router.get("/all", response_model=List[PackageOut])
def list_all_packages(db: Session = Depends(get_db), _=Depends(require_admin)):
    packages = db.query(Package).all()
    return [_package_to_out(p) for p in packages]


@router.post("/", response_model=PackageOut, status_code=201)
def create_package(
    payload: PackageCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    pkg = Package(
        name=payload.name,
        description=payload.description,
        discount_percent=payload.discount_percent,
    )
    db.add(pkg)
    db.flush()

    for sid in payload.service_ids:
        svc = db.query(Service).filter(Service.id == sid).first()
        if not svc:
            raise HTTPException(status_code=404, detail=f"Service {sid} not found")
        db.add(PackageItem(package_id=pkg.id, service_id=sid))

    db.commit()
    db.refresh(pkg)
    return _package_to_out(pkg)


@router.put("/{pkg_id}", response_model=PackageOut)
def update_package(
    pkg_id: int,
    payload: PackageCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    pkg = db.query(Package).filter(Package.id == pkg_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")

    pkg.name = payload.name
    pkg.description = payload.description
    pkg.discount_percent = payload.discount_percent

    # Replace items
    db.query(PackageItem).filter(PackageItem.package_id == pkg_id).delete()
    for sid in payload.service_ids:
        db.add(PackageItem(package_id=pkg_id, service_id=sid))

    db.commit()
    db.refresh(pkg)
    return _package_to_out(pkg)


@router.delete("/{pkg_id}", status_code=204)
def delete_package(
    pkg_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    pkg = db.query(Package).filter(Package.id == pkg_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
    pkg.is_active = False
    db.commit()
