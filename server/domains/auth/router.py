from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from core.config import settings
from sqlalchemy.orm import Session
from db.database import get_db
from schemas.common import CommonResponse
from .schema import LoginRequest, LoginResponse, RefreshRequest
from datetime import datetime, timedelta, timezone
from core.security import verify_password, create_access_token, create_refresh_token, verify_token
from domains.user import crud as user_crud

router = APIRouter()

@router.post("/login", response_model=CommonResponse[LoginResponse])
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = user_crud.get_user_by_name(db, name=request.name)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not verify_password(request.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return CommonResponse(
        data=LoginResponse(
            accessToken=create_access_token({"sub": str(user.id)}), 
            accessTokenExpiredAt=datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES), 
            refreshToken=create_refresh_token({"sub": str(user.id)}), 
            refreshTokenExpiredAt=datetime.now(timezone.utc) + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
        )
    )

@router.post("/refresh", response_model=CommonResponse[LoginResponse])
async def refresh(request: RefreshRequest, db: Session = Depends(get_db)):
    payload = verify_token(request.refreshToken)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    user_id_str: Optional[str] = payload.get("sub")
    if user_id_str is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    user = user_crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return CommonResponse(
        data=LoginResponse(
            accessToken=create_access_token({"sub": str(user.id)}), 
            accessTokenExpiredAt=datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES), 
            refreshToken=create_refresh_token({"sub": str(user.id)}), 
            refreshTokenExpiredAt=datetime.now(timezone.utc) + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
        )
    )