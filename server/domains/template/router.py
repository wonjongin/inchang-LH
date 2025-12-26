from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from db.database import get_db
from schemas.common import CommonResponse
from .schema import TemplateCreate, TemplateResponse
from . import crud

router = APIRouter()


@router.get("/", response_model=CommonResponse[List[TemplateResponse]])
async def get_templates(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    templates = crud.get_templates(db, skip=skip, limit=limit)
    return CommonResponse(data=[TemplateResponse.model_validate(t) for t in templates])


@router.get("/{template_id}", response_model=CommonResponse[TemplateResponse])
async def get_template(template_id: int, db: Session = Depends(get_db)):
    template = crud.get_template(db, template_id=template_id)
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    return CommonResponse(data=TemplateResponse.model_validate(template))


@router.post("/", response_model=CommonResponse[TemplateResponse], status_code=status.HTTP_201_CREATED)
async def create_template(template: TemplateCreate, db: Session = Depends(get_db)):
    db_template = crud.create_template(db=db, template=template)
    return CommonResponse(data=TemplateResponse.model_validate(db_template))


@router.put("/{template_id}", response_model=CommonResponse[TemplateResponse])
async def update_template(
    template_id: int,
    name: Optional[str] = None,
    cotis_cell: Optional[str] = None,
    cotis_fmt: Optional[str] = None,
    reserved_at_cell: Optional[str] = None,
    reserved_at_fmt: Optional[str] = None,
    address_cell: Optional[str] = None,
    address_fmt: Optional[str] = None,
    description_cell: Optional[str] = None,
    descriprion_fmt: Optional[str] = None,
    db: Session = Depends(get_db)
):
    db_template = crud.update_template(
        db=db,
        template_id=template_id,
        name=name,
        cotis_cell=cotis_cell,
        cotis_fmt=cotis_fmt,
        reserved_at_cell=reserved_at_cell,
        reserved_at_fmt=reserved_at_fmt,
        address_cell=address_cell,
        address_fmt=address_fmt,
        description_cell=description_cell,
        descriprion_fmt=descriprion_fmt
    )
    if not db_template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    return CommonResponse(data=TemplateResponse.model_validate(db_template))


@router.delete("/{template_id}", response_model=CommonResponse[dict])
async def delete_template(template_id: int, db: Session = Depends(get_db)):
    success = crud.delete_template(db=db, template_id=template_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    return CommonResponse(data={"deleted": True})

