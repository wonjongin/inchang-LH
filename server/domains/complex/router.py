from fastapi import APIRouter, Depends, HTTPException, status
from core.security import get_current_user
from models.models import Permission, User
from sqlalchemy.orm import Session
from typing import List, Optional
from db.database import get_db
from schemas.common import CommonResponse
from .schema import ComplexCreate, ComplexUpdate, ComplexResponse, ComplexPaginatedResponse, ComplexQuickSearchResponse
from . import crud

router = APIRouter()


@router.get("/", response_model=CommonResponse[ComplexPaginatedResponse])
async def get_complexes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    complexes = crud.get_complexes(db, skip=skip, limit=limit)
    return CommonResponse(data=ComplexPaginatedResponse.model_validate(ComplexPaginatedResponse(
        items=complexes,
        total=crud.get_complexes_count(db),
        page=skip + 1,
        limit=limit,
        pages=crud.get_complexes_count(db) // limit + 1
    )))


@router.get("/all_names", response_model=CommonResponse[List[ComplexQuickSearchResponse]])
async def get_all_complex_names(db: Session = Depends(get_db)):
    complexes = crud.get_all_complex_names(db)
    return CommonResponse(data=[ComplexQuickSearchResponse.model_validate(c) for c in complexes])


@router.get("/search/{query}", response_model=CommonResponse[ComplexPaginatedResponse])
async def search_complexes(query: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    complexes = crud.search_complexes(db, query=query, skip=skip, limit=limit)
    return CommonResponse(data=ComplexPaginatedResponse.model_validate(ComplexPaginatedResponse(
        items=complexes,
        total=crud.get_complexes_count_by_query(db, query),
        page=skip + 1,
        limit=limit,
        pages=crud.get_complexes_count_by_query(db, query) // 100 + 1
    )))

@router.get("/{complex_id}", response_model=CommonResponse[ComplexResponse])
async def get_complex(complex_id: int, db: Session = Depends(get_db)):
    complex = crud.get_complex(db, complex_id=complex_id)
    if not complex:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complex not found")
    return CommonResponse(data=ComplexResponse.model_validate(complex))



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
async def delete_complex(complex_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.permission != Permission.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="관리자만 삭제할 수 있습니다.")
    success = crud.delete_complex(db=db, complex_id=complex_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complex not found")
    return CommonResponse(data={"deleted": True})

