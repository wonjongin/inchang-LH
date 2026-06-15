from sqlalchemy.orm import Session, load_only
from typing import List, Optional
from models.models import Complex
from .schema import ComplexCreate, ComplexQuickSearchResponse, ComplexResponse


def create_complex(db: Session, complex: ComplexCreate) -> Complex:
    db_complex = Complex(**complex.model_dump())
    db.add(db_complex)
    db.commit()
    db.refresh(db_complex)
    return db_complex


def get_complex(db: Session, complex_id: int) -> Optional[Complex]:
    return db.query(Complex).filter(Complex.id == complex_id).first()


def get_complexes(db: Session, skip: int = 0, limit: int = 100) -> List[Complex]:
    return db.query(Complex).order_by(Complex.name.asc()).offset(skip).limit(limit).all()

def get_complexes_count(db: Session) -> int:
    return db.query(Complex).count()

def get_complexes_count_by_query(db: Session, query: str) -> int:
    return db.query(Complex).filter(Complex.name.ilike(f"%{query}%")).count()

def get_all_complex_names(db: Session) -> List[ComplexQuickSearchResponse]:
    return db.query(Complex).options(
        load_only(Complex.id, Complex.name)
    ).order_by(Complex.name.asc()).all()


def search_complexes(db: Session, query: str, skip: int = 0, limit: int = 100) -> List[ComplexResponse]:
    return db.query(Complex).filter(Complex.name.ilike(f"%{query}%")).order_by(Complex.name.asc()).offset(skip).limit(limit).all()


def update_complex(db: Session, complex_id: int, **kwargs) -> Optional[Complex]:
    db_complex = get_complex(db, complex_id)
    if not db_complex:
        return None
    for key, value in kwargs.items():
        if value is not None:
            setattr(db_complex, key, value)
    db.commit()
    db.refresh(db_complex)
    return db_complex


def save_coordinates(db: Session, complex_id: int, lat: float, lon: float) -> Optional[Complex]:
    db_complex = get_complex(db, complex_id)
    if not db_complex:
        return None
    db_complex.lat = lat
    db_complex.lon = lon
    db.commit()
    db.refresh(db_complex)
    return db_complex


def delete_complex(db: Session, complex_id: int) -> bool:
    db_complex = get_complex(db, complex_id)
    if not db_complex:
        return False
    db.delete(db_complex)
    db.commit()
    return True

