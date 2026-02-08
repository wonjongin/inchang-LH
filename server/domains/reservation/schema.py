from pydantic import BaseModel
from datetime import date
from typing import Optional
from domains.complex.schema import ComplexResponse
from domains.vendor.schema import VendorResponse
from domains.user.schema import UserResponse
from domains.template.schema import TemplateResponse


class ReservationBase(BaseModel):
    cotis: Optional[str] = None
    reserved_at: date
    is_transfered: bool = False
    description: Optional[str] = None

class ReservationCreate(ReservationBase):
    location: int
    vendor: int
    template: Optional[int] = None

class ReservationUpdate(BaseModel):
    cotis: Optional[str] = None
    reserved_at: Optional[date] = None
    completed_at: Optional[date] = None
    is_transfered: Optional[bool] = None
    description: Optional[str] = None
    location: Optional[int] = None
    vendor: Optional[int] = None
    template: Optional[int] = None
    author: Optional[int] = None

class ReservationResponse(ReservationBase):
    id: int
    location: ComplexResponse
    completed_at: Optional[date] = None
    vendor: VendorResponse
    template: Optional[TemplateResponse] = None
    author: UserResponse
    exists_reservation_photo: Optional[bool] = None

    class Config:
        from_attributes = True
