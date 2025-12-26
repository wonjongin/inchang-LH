from pydantic import BaseModel
from typing import Optional


class TemplateBase(BaseModel):
    name: str
    fmt: Optional[str] = None


class TemplateCreate(TemplateBase):
    pass


class TemplateResponse(TemplateBase):
    id: int
    
    class Config:
        from_attributes = True

