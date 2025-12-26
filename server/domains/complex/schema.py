from pydantic import BaseModel
from typing import Optional


class ComplexBase(BaseModel):
    name: str
    address: Optional[str] = None
    tel: Optional[str] = None
    fax: Optional[str] = None
    email: Optional[str] = None

class ComplexCreate(ComplexBase):
    pass

class ComplexUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    tel: Optional[str] = None
    fax: Optional[str] = None
    email: Optional[str] = None

class ComplexResponse(ComplexBase):
    id: int
    
    class Config:
        from_attributes = True

