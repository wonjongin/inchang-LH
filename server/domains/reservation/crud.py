from sqlalchemy.orm import Session
from typing import List, Optional
from models.models import Reservation, Complex, Vendor
from .schema import ReservationCreate


def create_reservation(db: Session, reservation: ReservationCreate, user_id: int) -> Reservation:
    db_reservation = Reservation(
        cotis=reservation.cotis,
        complex_id=reservation.location,
        vendor_id=reservation.vendor,
        template_id=reservation.template,
        user_id=user_id,
        reserved_at=reservation.reserved_at,
        # completed_at=reservation.completed_at,
        is_transfered=reservation.is_transfered,
        description=reservation.description
    )
    db.add(db_reservation)
    db.commit()
    db.refresh(db_reservation)
    return db_reservation


def get_reservation(db: Session, reservation_id: int) -> Optional[Reservation]:
    return db.query(Reservation).filter(Reservation.id == reservation_id).first()


def get_reservation_by_cotis(db: Session, cotis: str) -> Optional[Reservation]:
    return db.query(Reservation).filter(Reservation.cotis == cotis).first()


def get_reservations(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    complex_id: Optional[int] = None,
    vendor_id: Optional[int] = None,
    filter: Optional[str] = None
) -> List[Reservation]:
    query = db.query(Reservation)
    if user_id:
        query = query.filter(Reservation.user_id == user_id)
    if complex_id:
        query = query.filter(Reservation.complex_id == complex_id)
    if vendor_id:
        query = query.filter(Reservation.vendor_id == vendor_id)

    if filter == 'all':
        pass
    elif filter == 'progressing':
        query = query.filter(Reservation.completed_at == None)
    elif filter == 'completed':
        query = query.filter(Reservation.completed_at != None)

    return query.offset(skip).limit(limit).all()


def get_reservations_by_month(db: Session, year: int, month: int) -> List[Reservation]:
    return db.query(Reservation).filter(Reservation.reserved_at.year == year, Reservation.reserved_at.month == month).order_by(Reservation.reserved_at.asc()).all()

def get_reservations_by_year(db: Session, year: int) -> List[Reservation]:
    return db.query(Reservation).filter(Reservation.reserved_at.year == year).order_by(Reservation.reserved_at.asc()).all()

def search_reservations(db: Session, query: str) -> List[Reservation]:
    """예약 검색 (단지명, 벤더명, 설명으로 검색)"""
    from sqlalchemy import or_
    
    return db.query(Reservation).join(
        Complex, Reservation.complex_id == Complex.id
    ).join(
        Vendor, Reservation.vendor_id == Vendor.id
    ).filter(
        or_(
            Complex.name.ilike(f"%{query}%"),
            Vendor.name.ilike(f"%{query}%"),
            Reservation.description.ilike(f"%{query}%"),
            Reservation.cotis.ilike(f"%{query}%")
        )
    ).order_by(Reservation.cotis.asc()).all()

def update_reservation(db: Session, reservation_id: int, **kwargs) -> Optional[Reservation]:
    db_reservation = get_reservation(db, reservation_id)
    if not db_reservation:
        return None
    if 'location' in kwargs:
        kwargs['complex_id'] = kwargs.pop('location')
    if 'vendor' in kwargs:
        kwargs['vendor_id'] = kwargs.pop('vendor')
    if 'author' in kwargs:
        kwargs['user_id'] = kwargs.pop('author')
    for key, value in kwargs.items():
        if value is not None:
            setattr(db_reservation, key, value)
    db.commit()
    db.refresh(db_reservation)
    return db_reservation


def delete_reservation(db: Session, reservation_id: int) -> bool:
    db_reservation = get_reservation(db, reservation_id)
    if not db_reservation:
        return False
    db.delete(db_reservation)
    db.commit()
    return True

