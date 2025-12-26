from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from db.database import get_db
from schemas.common import CommonResponse
from .schema import ComplexCreate, ComplexUpdate, ComplexResponse
from . import crud

router = APIRouter()


@router.get("/", response_model=CommonResponse[List[ComplexResponse]])
async def get_complexes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    complexes = crud.get_complexes(db, skip=skip, limit=limit)
    return CommonResponse(data=[ComplexResponse.model_validate(c) for c in complexes])


@router.get("/{complex_id}", response_model=CommonResponse[ComplexResponse])
async def get_complex(complex_id: int, db: Session = Depends(get_db)):
    complex = crud.get_complex(db, complex_id=complex_id)
    if not complex:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complex not found")
    return CommonResponse(data=ComplexResponse.model_validate(complex))


@router.get("/search/{query}", response_model=CommonResponse[List[ComplexResponse]])
async def search_complexes(query: str, db: Session = Depends(get_db)):
    complexes = crud.search_complexes(db, query=query)
    return CommonResponse(data=[ComplexResponse.model_validate(c) for c in complexes])


@router.post("/", response_model=CommonResponse[ComplexResponse], status_code=status.HTTP_201_CREATED)
async def create_complex(complex: ComplexCreate, db: Session = Depends(get_db)):
    db_complex = crud.create_complex(db=db, complex=complex)
    return CommonResponse(data=ComplexResponse.model_validate(db_complex))


@router.put("/{complex_id}", response_model=CommonResponse[ComplexResponse])
async def update_complex(
    complex_id: int,
    complex: ComplexUpdate,
    db: Session = Depends(get_db)
):
    db_complex = crud.update_complex(
        db=db,
        complex_id=complex_id,
        **complex.model_dump(exclude_unset=True)
    )
    if not db_complex:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complex not found")
    return CommonResponse(data=ComplexResponse.model_validate(db_complex))


@router.delete("/{complex_id}", response_model=CommonResponse[dict])
async def delete_complex(complex_id: int, db: Session = Depends(get_db)):
    success = crud.delete_complex(db=db, complex_id=complex_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complex not found")
    return CommonResponse(data={"deleted": True})

