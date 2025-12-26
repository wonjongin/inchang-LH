from fastapi import FastAPI
from domains.user import router as user_router
from domains.complex import router as complex_router
from domains.template import router as template_router
from domains.vendor import router as vendor_router
from domains.reservation import router as reservation_router
from core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

# 개발 환경에서만 테이블 자동 생성
if settings.ENVIRONMENT == "development":
    from db.base import Base
    from db.database import engine
    Base.metadata.create_all(bind=engine)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/health")
async def health():
    return {"status": "ok"}


# API 라우터 등록
app.include_router(user_router.router, prefix="/api/v1/users", tags=["users"])
app.include_router(complex_router.router, prefix="/api/v1/complexes", tags=["complexes"])
app.include_router(template_router.router, prefix="/api/v1/templates", tags=["templates"])
app.include_router(vendor_router.router, prefix="/api/v1/vendors", tags=["vendors"])
app.include_router(reservation_router.router, prefix="/api/v1/reservations", tags=["reservations"])

