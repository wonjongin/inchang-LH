from pydantic import BaseModel
from datetime import datetime

class LoginRequest(BaseModel):
    name: str
    password: str

class LoginResponse(BaseModel):
    accessToken: str
    accessTokenExpiredAt: datetime
    refreshToken: str
    refreshTokenExpiredAt: datetime

class RefreshRequest(BaseModel):
    refreshToken: str