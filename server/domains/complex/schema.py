from pydantic import BaseModel
from typing import List, Optional


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

class ComplexPaginatedResponse(BaseModel):
    items: List[ComplexResponse]
    total: int
    page: int
    limit: int
    pages: int


class ComplexQuickSearchResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class CoordinatesResponse(BaseModel):
    lat: float
    lon: float