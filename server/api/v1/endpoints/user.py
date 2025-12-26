from fastapi import APIRouter
from app.schemas.user import UserCreate, UserResponse

router = APIRouter()


@router.get("/")
async def get_users():
    return {"users": []}


@router.post("/", response_model=UserResponse)
async def create_user(user: UserCreate):
    return {"id": 1, "email": user.email, "name": user.name}

