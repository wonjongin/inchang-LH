from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from pathlib import Path
import os
import shutil
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


@router.get("/{reservation_id}/generate-certificate-template")
async def generate_certificate_template(reservation_id: int, db: Session = Depends(get_db)):
    reservation = crud.get_reservation(db, reservation_id=reservation_id)
    if not reservation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
    if not reservation.template_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    from domains.template import util as template_util
    from domains.template import crud as template_crud
    template = template_crud.get_template(db, template_id=reservation.template_id)
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    template_util.generate_certificate_template(template, reservation)
    
    # 생성된 파일 경로
    file_path = Path(f"data/certificates_template/{reservation_id}.xlsx")
    if not file_path.exists():
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="File generation failed")
    
    # 파일 다운로드 응답
    return FileResponse(
        path=str(file_path),
        filename=f"완료확인양식_{reservation.cotis}.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

@router.post("/{reservation_id}/complete", response_model=CommonResponse[ReservationResponse])
async def complete_reservation(
    reservation_id: int,
    completed_at: Optional[str] = Form(None),
    certificate: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    reservation = crud.get_reservation(db, reservation_id=reservation_id)
    if not reservation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
    
    # 완료일 처리
    update_data = {}
    if completed_at:
        try:
            update_data['completed_at'] = datetime.strptime(completed_at, '%Y-%m-%d').date()
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date format. Use YYYY-MM-DD")
    
    # PDF 파일 저장
    if certificate and certificate.filename:
        # 업로드 디렉토리 생성
        upload_dir = Path("data/certificates")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # 파일 저장
        file_path = upload_dir / f"{reservation_id}.pdf"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(certificate.file, buffer)
    
    # 예약 정보 업데이트
    if update_data:
        db_reservation = crud.update_reservation(
            db=db,
            reservation_id=reservation_id,
            **update_data
        )
        if not db_reservation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
        return CommonResponse(data=ReservationResponse.model_validate(db_reservation))
    
    return CommonResponse(data=ReservationResponse.model_validate(reservation))

@router.get("/{reservation_id}/generate-certificate")
async def generate_certificate(reservation_id: int, db: Session = Depends(get_db)):
    reservation = crud.get_reservation(db, reservation_id=reservation_id)
    if not reservation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
    file_path = Path(f"data/certificates/{reservation_id}.pdf")
    if not file_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certificate not found")
    return FileResponse(path=str(file_path), filename=f"완료확인서_{reservation.cotis}.pdf", media_type="application/pdf")