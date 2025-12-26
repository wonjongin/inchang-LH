from typing import Generic, TypeVar, Optional, List
from pydantic import BaseModel

T = TypeVar("T")

class CommonResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "success"
    data: Optional[T] = None


class PaginatedResponse(BaseModel, Generic[T]):
    """페이지네이션 응답 모델"""
    items: List[T]
    total: int
    page: int
    limit: int
    pages: int  # 전체 페이지 수
    
    @classmethod
    def create(cls, items: List[T], total: int, page: int, limit: int):
        pages = (total + limit - 1) // limit if limit > 0 else 0
        return cls(
            items=items,
            total=total,
            page=page,
            limit=limit,
            pages=pages
        )