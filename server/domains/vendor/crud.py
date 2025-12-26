from sqlalchemy.orm import Session
from typing import List, Optional
from models.models import Vendor
from .schema import VendorCreate


def create_vendor(db: Session, vendor: VendorCreate) -> Vendor:
    db_vendor = Vendor(
        name=vendor.name,
        tel=vendor.tel,
        control_range=vendor.control_range,
        template_id=vendor.template
    )
    db.add(db_vendor)
    db.commit()
    db.refresh(db_vendor)
    return db_vendor


def get_vendor(db: Session, vendor_id: int) -> Optional[Vendor]:
    return db.query(Vendor).filter(Vendor.id == vendor_id).first()


def get_vendors(db: Session, skip: int = 0, limit: int = 100, template_id: Optional[int] = None) -> List[Vendor]:
    query = db.query(Vendor)
    if template_id:
        query = query.filter(Vendor.template_id == template_id)
    return query.offset(skip).limit(limit).all()


def search_vendors(db: Session, query: str) -> List[Vendor]:
    return db.query(Vendor).filter(Vendor.name.ilike(f"%{query}%")).order_by(Vendor.name.asc()).all()


def update_vendor(db: Session, vendor_id: int, **kwargs) -> Optional[Vendor]:
    db_vendor = get_vendor(db, vendor_id)
    if not db_vendor:
        return None
    if 'control_range' in kwargs:
        kwargs['control_range'] = kwargs.pop('control_range')
    if 'template' in kwargs:
        kwargs['template_id'] = kwargs.pop('template')
    for key, value in kwargs.items():
        if value is not None:
            setattr(db_vendor, key, value)
    db.commit()
    db.refresh(db_vendor)
    return db_vendor


def delete_vendor(db: Session, vendor_id: int) -> bool:
    db_vendor = get_vendor(db, vendor_id)
    if not db_vendor:
        return False
    db.delete(db_vendor)
    db.commit()
    return True

