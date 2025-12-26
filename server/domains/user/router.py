from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from db.database import get_db
from schemas.common import CommonResponse
from models.models import User
from core.security import get_current_user
from .schema import UserCreate, UserResponse
from . import crud

router = APIRouter()


@router.get("/", response_model=CommonResponse[List[UserResponse]])
async def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return CommonResponse(data=[UserResponse.model_validate(user) for user in users])


@router.get("/{user_id}", response_model=CommonResponse[UserResponse])
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return CommonResponse(data=UserResponse.model_validate(user))

@router.get("/me", response_model=CommonResponse[UserResponse])
async def get_me(current_user: User = Depends(get_current_user)):
    """현재 로그인한 사용자 정보를 가져옵니다."""
    return CommonResponse(data=UserResponse.model_validate(current_user))


@router.post("/", response_model=CommonResponse[UserResponse], status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # 중복 이름 체크
    existing_user = crud.get_user_by_name(db, name=user.name)
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User name already exists")
    
    db_user = crud.create_user(db=db, user=user)
    return CommonResponse(data=UserResponse.model_validate(db_user))


@router.put("/{user_id}", response_model=CommonResponse[UserResponse])
async def update_user(user_id: int, name: str = None, password: str = None, db: Session = Depends(get_db)):
    db_user = crud.update_user(db=db, user_id=user_id, name=name, password=password)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return CommonResponse(data=UserResponse.model_validate(db_user))

