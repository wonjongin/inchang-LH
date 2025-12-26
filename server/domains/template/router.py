from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from db.database import get_db
from schemas.common import CommonResponse
from .schema import TemplateCreate, TemplateResponse
from . import crud
import os
import shutil
from pathlib import Path

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
async def create_template(
    name: str = Form(...),
    fmt: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
     # 파일이 업로드된 경우 저장 (template_id 사용)
    if file:
        template_data = TemplateCreate(
            name=name,
            fmt=fmt
        )
        
        # 먼저 템플릿 생성하여 template_id 얻기
        db_template = crud.create_template(db=db, template=template_data)

   
        # 업로드 디렉토리 생성
        upload_dir = Path("data/templates")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # template_id를 사용하여 파일 저장
        file_path = upload_dir / f"{db_template.id}.xlsx"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    
    return CommonResponse(data=TemplateResponse.model_validate(db_template))


@router.put("/{template_id}", response_model=CommonResponse[TemplateResponse])
async def update_template(
    template_id: int,
    name: Optional[str] = Form(None),
    fmt: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # 파일이 업로드된 경우 저장
    if file:
        # 업로드 디렉토리 생성
        upload_dir = Path("data/templates")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # template_id를 사용하여 파일 저장
        file_path = upload_dir / f"{template_id}.xlsx"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    
    db_template = crud.update_template(
        db=db,
        template_id=template_id,
        name=name,
        fmt=fmt
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

