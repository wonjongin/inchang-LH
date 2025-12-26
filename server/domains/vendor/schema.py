from pydantic import BaseModel, Field
from typing import Optional


class VendorBase(BaseModel):
    name: str
    tel: Optional[str] = None
    fax: Optional[str] = None
    email: Optional[str] = None
    range: Optional[str] = None


class VendorCreate(VendorBase):
    template: int


class VendorResponse(VendorBase):
    id: int
    template: int = Field(alias="template_id")
    control_range: Optional[str] = Field(None, alias="control_range")
    
    class Config:
        from_attributes = True
        populate_by_name = True

