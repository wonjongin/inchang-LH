from pydantic import BaseModel, Field
from typing import Optional


class VendorBase(BaseModel):
    name: str
    tel: Optional[str] = None
    fax: Optional[str] = None
    email: Optional[str] = None
    control_range: Optional[str] = None


class VendorCreate(VendorBase):
    template: Optional[int] = None


class VendorUpdate(BaseModel):
    name: Optional[str] = None
    tel: Optional[str] = None
    fax: Optional[str] = None
    email: Optional[str] = None
    control_range: Optional[str] = None
    template: Optional[int] = None


class VendorResponse(VendorBase):
    id: int
    template: Optional[int] = Field(None, alias="template_id")
    control_range: Optional[str] = Field(None, alias="control_range")
    
    class Config:
        from_attributes = True
        populate_by_name = True

