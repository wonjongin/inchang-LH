from pydantic import BaseModel
from typing import Optional


class TemplateBase(BaseModel):
    name: str
    cotis_cell: Optional[str] = None
    cotis_fmt: Optional[str] = None
    reserved_at_cell: Optional[str] = None
    reserved_at_fmt: Optional[str] = None
    address_cell: Optional[str] = None
    address_fmt: Optional[str] = None
    description_cell: Optional[str] = None
    descriprion_fmt: Optional[str] = None


class TemplateCreate(TemplateBase):
    pass


class TemplateResponse(TemplateBase):
    id: int
    
    class Config:
        from_attributes = True

