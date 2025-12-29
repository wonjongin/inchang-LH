from pydantic import BaseModel


class UserBase(BaseModel):
    name: str

class UserCreate(UserBase):
    password: str
    admin_pw: str

class UserResponse(UserBase):
    id: int
    
    class Config:
        from_attributes = True

