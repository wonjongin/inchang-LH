from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from domains.user import router as user_router
from domains.complex import router as complex_router
from domains.template import router as template_router
from domains.vendor import router as vendor_router
from domains.reservation import router as reservation_router
from domains.auth import router as auth_router
from core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

# CORS 설정
if settings.ENVIRONMENT == "development":
    # 개발 환경: 모든 origin 허용
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # 개발 환경에서는 모든 origin 허용
        allow_credentials=True,
        allow_methods=["*"],  # 모든 HTTP 메서드 허용
        allow_headers=["*"],  # 모든 헤더 허용
    )
else:
    # 프로덕션 환경: 특정 origin만 허용
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "https://your-production-domain.com",  # 프로덕션 도메인으로 변경 필요
        ],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allow_headers=["*"],
    )

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
app.include_router(auth_router.router, prefix="/api/v1/auth", tags=["auth"])
