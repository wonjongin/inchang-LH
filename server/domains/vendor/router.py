from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from db.database import get_db
from schemas.common import CommonResponse
from .schema import VendorCreate, VendorResponse
from . import crud

router = APIRouter()


@router.get("/", response_model=CommonResponse[List[VendorResponse]])
async def get_vendors(
    skip: int = 0,
    limit: int = 100,
    template_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    vendors = crud.get_vendors(db, skip=skip, limit=limit, template_id=template_id)
    return CommonResponse(data=[VendorResponse.model_validate(v) for v in vendors])


@router.get("/{vendor_id}", response_model=CommonResponse[VendorResponse])
async def get_vendor(vendor_id: int, db: Session = Depends(get_db)):
    vendor = crud.get_vendor(db, vendor_id=vendor_id)
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
    return CommonResponse(data=VendorResponse.model_validate(vendor))


@router.get("/search/{query}", response_model=CommonResponse[List[VendorResponse]])
async def search_vendors(query: str, db: Session = Depends(get_db)):
    vendors = crud.search_vendors(db, query=query)
    return CommonResponse(data=[VendorResponse.model_validate(v) for v in vendors])

@router.post("/", response_model=CommonResponse[VendorResponse], status_code=status.HTTP_201_CREATED)
async def create_vendor(vendor: VendorCreate, db: Session = Depends(get_db)):
    # Template 존재 확인
    from domains.template import crud as template_crud
    template = template_crud.get_template(db, template_id=vendor.template)
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    
    db_vendor = crud.create_vendor(db=db, vendor=vendor)
    return CommonResponse(data=VendorResponse.model_validate(db_vendor))


@router.put("/{vendor_id}", response_model=CommonResponse[VendorResponse])
async def update_vendor(
    vendor_id: int,
    name: Optional[str] = None,
    tel: Optional[str] = None,
    range: Optional[str] = None,
    template: Optional[int] = None,
    db: Session = Depends(get_db)
):
    if template:
        # Template 존재 확인
        from domains.template import crud as template_crud
        template_obj = template_crud.get_template(db, template_id=template)
        if not template_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    
    db_vendor = crud.update_vendor(
        db=db,
        vendor_id=vendor_id,
        name=name,
        tel=tel,
        range=range,
        template=template
    )
    if not db_vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
    return CommonResponse(data=VendorResponse.model_validate(db_vendor))


@router.delete("/{vendor_id}", response_model=CommonResponse[dict])
async def delete_vendor(vendor_id: int, db: Session = Depends(get_db)):
    success = crud.delete_vendor(db=db, vendor_id=vendor_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
    return CommonResponse(data={"deleted": True})

