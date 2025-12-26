from pydantic import BaseModel
from datetime import date
from typing import Optional
from domains.complex.schema import ComplexResponse
from domains.vendor.schema import VendorResponse
from domains.user.schema import UserResponse


class ReservationBase(BaseModel):
    cotis: str
    reserved_at: date
    completed_at: Optional[date] = None
    is_transfered: bool = False
    description: Optional[str] = None

class ReservationCreate(ReservationBase):
    location: int
    vendor: int
    template: Optional[int] = None
    author: int

class ReservationResponse(ReservationBase):
    id: int
    location: ComplexResponse
    vendor: VendorResponse
    template: Optional[int]
    author: UserResponse
    
    class Config:
        from_attributes = True

