from fastapi import FastAPI
from app.api.v1.endpoints import user, item
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/health")
async def health():
    return {"status": "ok"}


app.include_router(user.router, prefix="/api/v1/users", tags=["users"])
app.include_router(item.router, prefix="/api/v1/items", tags=["items"])

