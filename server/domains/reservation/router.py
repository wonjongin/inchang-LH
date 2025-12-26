from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from db.database import get_db
from schemas.common import CommonResponse
from .schema import ReservationCreate, ReservationUpdate, ReservationResponse
from . import crud
from models.models import User
from core.security import get_current_user

router = APIRouter()


@router.get("/", response_model=CommonResponse[List[ReservationResponse]])
async def get_reservations(
    skip: int = 0,
    limit: int = 100,
    filter: Optional[str] = None,
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
        filter=filter,
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
async def create_reservation(reservation: ReservationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # COTIS 중복 체크
    existing = crud.get_reservation_by_cotis(db, cotis=reservation.cotis)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="COTIS 번호가 이미 존재합니다.")
    
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
    user = user_crud.get_user(db, user_id=current_user.id)
    
    if reservation.template:
        from domains.template import crud as template_crud
        template = template_crud.get_template(db, template_id=reservation.template)
        if not template:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    
    db_reservation = crud.create_reservation(db=db, reservation=reservation, user_id=current_user.id)
    return CommonResponse(data=ReservationResponse.model_validate(db_reservation))


@router.put("/{reservation_id}", response_model=CommonResponse[ReservationResponse])
async def update_reservation(
    reservation_id: int,
    reservation: ReservationUpdate,
    db: Session = Depends(get_db)
):
    update_data = reservation.model_dump(exclude_unset=True)
    
    # COTIS 중복 체크 (다른 예약과 중복되지 않는지)
    if 'cotis' in update_data:
        existing = crud.get_reservation_by_cotis(db, cotis=update_data['cotis'])
        if existing and existing.id != reservation_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="COTIS already exists")
    
    # 관련 엔티티 존재 확인
    if 'location' in update_data and update_data['location'] is not None:
        from domains.complex import crud as complex_crud
        complex = complex_crud.get_complex(db, complex_id=update_data['location'])
        if not complex:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complex not found")
    
    if 'vendor' in update_data and update_data['vendor'] is not None:
        from domains.vendor import crud as vendor_crud
        vendor_obj = vendor_crud.get_vendor(db, vendor_id=update_data['vendor'])
        if not vendor_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
    
    if 'author' in update_data and update_data['author'] is not None:
        from domains.user import crud as user_crud
        user = user_crud.get_user(db, user_id=update_data['author'])
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if 'template' in update_data and update_data['template'] is not None:
        from domains.template import crud as template_crud
        template_obj = template_crud.get_template(db, template_id=update_data['template'])
        if not template_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    
    db_reservation = crud.update_reservation(
        db=db,
        reservation_id=reservation_id,
        **update_data
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

