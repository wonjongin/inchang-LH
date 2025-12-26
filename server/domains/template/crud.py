from sqlalchemy.orm import Session
from typing import List, Optional
from models.models import Template
from .schema import TemplateCreate


def create_template(db: Session, template: TemplateCreate) -> Template:
    db_template = Template(**template.model_dump())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template


def get_template(db: Session, template_id: int) -> Optional[Template]:
    return db.query(Template).filter(Template.id == template_id).first()


def get_templates(db: Session, skip: int = 0, limit: int = 100) -> List[Template]:
    return db.query(Template).offset(skip).limit(limit).all()


def update_template(db: Session, template_id: int, **kwargs) -> Optional[Template]:
    db_template = get_template(db, template_id)
    if not db_template:
        return None
    for key, value in kwargs.items():
        if value is not None:
            setattr(db_template, key, value)
    db.commit()
    db.refresh(db_template)
    return db_template


def delete_template(db: Session, template_id: int) -> bool:
    db_template = get_template(db, template_id)
    if not db_template:
        return False
    db.delete(db_template)
    db.commit()
    return True

