from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from db.database import get_db
from schemas.common import CommonResponse
from .schema import ReservationCreate, ReservationResponse
from . import crud

router = APIRouter()


@router.get("/", response_model=CommonResponse[List[ReservationResponse]])
async def get_reservations(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    complex_id: Optional[int] = None,
    vendor_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    reservations = crud.get_reservations(
        db,
        skip=skip,
        limit=limit,
        user_id=user_id,
        complex_id=complex_id,
        vendor_id=vendor_id
    )
    return CommonResponse(data=[ReservationResponse.model_validate(r) for r in reservations])


@router.get("/{reservation_id}", response_model=CommonResponse[ReservationResponse])
async def get_reservation(reservation_id: int, db: Session = Depends(get_db)):
    reservation = crud.get_reservation(db, reservation_id=reservation_id)
    if not reservation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
    return CommonResponse(data=ReservationResponse.model_validate(reservation))


@router.get("/cotis/{cotis}", response_model=CommonResponse[ReservationResponse])
async def get_reservation_by_cotis(cotis: str, db: Session = Depends(get_db)):
    reservation = crud.get_reservation_by_cotis(db, cotis=cotis)
    if not reservation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
    return CommonResponse(data=ReservationResponse.model_validate(reservation))


@router.get("/search/{query}", response_model=CommonResponse[List[ReservationResponse]])
async def search_reservations(query: str, db: Session = Depends(get_db)):
    reservations = crud.search_reservations(db, query=query)
    return CommonResponse(data=[ReservationResponse.model_validate(r) for r in reservations])


@router.post("/", response_model=CommonResponse[ReservationResponse], status_code=status.HTTP_201_CREATED)
async def create_reservation(reservation: ReservationCreate, db: Session = Depends(get_db)):
    # COTIS 중복 체크
    existing = crud.get_reservation_by_cotis(db, cotis=reservation.cotis)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="COTIS already exists")
    
    # 관련 엔티티 존재 확인
    from domains.complex import crud as complex_crud
    complex = complex_crud.get_complex(db, complex_id=reservation.location)
    if not complex:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complex not found")
    
    from domains.vendor import crud as vendor_crud
    vendor = vendor_crud.get_vendor(db, vendor_id=reservation.vendor)
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
    
    from domains.user import crud as user_crud
    user = user_crud.get_user(db, user_id=reservation.author)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if reservation.template:
        from domains.template import crud as template_crud
        template = template_crud.get_template(db, template_id=reservation.template)
        if not template:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    
    db_reservation = crud.create_reservation(db=db, reservation=reservation)
    return CommonResponse(data=ReservationResponse.model_validate(db_reservation))


@router.put("/{reservation_id}", response_model=CommonResponse[ReservationResponse])
async def update_reservation(
    reservation_id: int,
    cotis: Optional[str] = None,
    location: Optional[int] = None,
    vendor: Optional[int] = None,
    template: Optional[int] = None,
    author: Optional[int] = None,
    reserved_at: Optional[date] = None,
    completed_at: Optional[date] = None,
    is_transfered: Optional[bool] = None,
    description: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # COTIS 중복 체크 (다른 예약과 중복되지 않는지)
    if cotis:
        existing = crud.get_reservation_by_cotis(db, cotis=cotis)
        if existing and existing.id != reservation_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="COTIS already exists")
    
    # 관련 엔티티 존재 확인
    if location:
        from domains.complex import crud as complex_crud
        complex = complex_crud.get_complex(db, complex_id=location)
        if not complex:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complex not found")
    
    if vendor:
        from domains.vendor import crud as vendor_crud
        vendor_obj = vendor_crud.get_vendor(db, vendor_id=vendor)
        if not vendor_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
    
    if author:
        from domains.user import crud as user_crud
        user = user_crud.get_user(db, user_id=author)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if template:
        from domains.template import crud as template_crud
        template_obj = template_crud.get_template(db, template_id=template)
        if not template_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    
    db_reservation = crud.update_reservation(
        db=db,
        reservation_id=reservation_id,
        cotis=cotis,
        location=location,
        vendor=vendor,
        template=template,
        author=author,
        reserved_at=reserved_at,
        completed_at=completed_at,
        is_transfered=is_transfered,
        description=description
    )
    if not db_reservation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
    return CommonResponse(data=ReservationResponse.model_validate(db_reservation))


@router.delete("/{reservation_id}", response_model=CommonResponse[dict])
async def delete_reservation(reservation_id: int, db: Session = Depends(get_db)):
    success = crud.delete_reservation(db=db, reservation_id=reservation_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
    return CommonResponse(data={"deleted": True})

