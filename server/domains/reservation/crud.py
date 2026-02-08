from sqlalchemy.orm import Session, joinedload
from sqlalchemy import extract
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

    total = query.count()
    items = query.order_by(Reservation.reserved_at.desc()).offset(skip).limit(limit).all()
    return items, total


def get_reservations_by_month(db: Session, year: int, month: int, filter: Optional[str] = None) -> List[Reservation]:
    query = db.query(Reservation).options(
        joinedload(Reservation.location),
        joinedload(Reservation.vendor),
        joinedload(Reservation.template),
        joinedload(Reservation.author)
    )
    if filter == 'all':
        pass
    elif filter == 'progressing':
        query = query.filter(Reservation.completed_at == None)
    elif filter == 'completed':
        query = query.filter(Reservation.completed_at != None)   
    query = query.filter(
        extract('year', Reservation.reserved_at) == year,
        extract('month', Reservation.reserved_at) == month
    )
    return query.order_by(Reservation.reserved_at.desc()).all()

def get_reservations_by_year(db: Session, year: int) -> List[Reservation]:
    return db.query(Reservation).options(
        joinedload(Reservation.location),
        joinedload(Reservation.vendor),
        joinedload(Reservation.template),
        joinedload(Reservation.author)
    ).filter(
        extract('year', Reservation.reserved_at) == year
    ).order_by(Reservation.reserved_at.asc()).all()

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
    from datetime import datetime, date
    
    db_reservation = get_reservation(db, reservation_id)
    if not db_reservation:
        return None
    
    # 필드명 변환 (API 필드명 -> DB 컬럼명)
    if 'location' in kwargs:
        kwargs['complex_id'] = kwargs.pop('location')
    if 'vendor' in kwargs:
        kwargs['vendor_id'] = kwargs.pop('vendor')
    if 'author' in kwargs:
        kwargs['user_id'] = kwargs.pop('author')
    if 'template' in kwargs:
        kwargs['template_id'] = kwargs.pop('template')
    
    # 날짜 필드 변환 (문자열 또는 date 객체를 date 객체로)
    if 'reserved_at' in kwargs:
        if kwargs['reserved_at'] is not None:
            if isinstance(kwargs['reserved_at'], str):
                kwargs['reserved_at'] = datetime.strptime(kwargs['reserved_at'], '%Y-%m-%d').date()
            elif isinstance(kwargs['reserved_at'], date):
                pass  # 이미 date 객체
    if 'completed_at' in kwargs:
        if kwargs['completed_at'] is not None:
            if isinstance(kwargs['completed_at'], str):
                kwargs['completed_at'] = datetime.strptime(kwargs['completed_at'], '%Y-%m-%d').date()
            elif isinstance(kwargs['completed_at'], date):
                pass  # 이미 date 객체
    
    # 외래 키 필드만 업데이트 (관계 필드가 아닌)
    allowed_fields = ['cotis', 'complex_id', 'vendor_id', 'template_id', 'user_id', 
                      'reserved_at', 'completed_at', 'is_transfered', 'description']
    
    for key, value in kwargs.items():
        if key in allowed_fields:
            if value is not None or key in ['completed_at', 'description']:  # None 허용 필드
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

