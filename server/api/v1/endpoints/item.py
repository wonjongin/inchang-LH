from fastapi import APIRouter
from app.schemas.item import ItemCreate, ItemResponse

router = APIRouter()


@router.get("/")
async def get_items():
    return {"items": []}


@router.post("/", response_model=ItemResponse)
async def create_item(item: ItemCreate):
    return {"id": 1, "name": item.name, "description": item.description}

