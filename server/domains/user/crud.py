from sqlalchemy.orm import Session
from typing import List, Optional
from models.models import User
from core.security import get_password_hash
from .schema import UserCreate


def create_user(db: Session, user: UserCreate) -> User:
    hashed_password = get_password_hash(user.password)
    db_user = User(name=user.name, password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_name(db: Session, name: str) -> Optional[User]:
    return db.query(User).filter(User.name == name).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    return db.query(User).offset(skip).limit(limit).all()


def update_user(db: Session, user_id: int, name: Optional[str] = None, password: Optional[str] = None) -> Optional[User]:
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    if name:
        db_user.name = name
    if password:
        db_user.password = get_password_hash(password)
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int) -> bool:
    db_user = get_user(db, user_id)
    if not db_user:
        return False
    db.delete(db_user)
    db.commit()
    return True

