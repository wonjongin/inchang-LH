from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
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


# API 라우터 등록 (정적 파일보다 먼저 등록해야 함)
app.include_router(user_router.router, prefix="/api/v1/users", tags=["users"])
app.include_router(complex_router.router, prefix="/api/v1/complexes", tags=["complexes"])
app.include_router(template_router.router, prefix="/api/v1/templates", tags=["templates"])
app.include_router(vendor_router.router, prefix="/api/v1/vendors", tags=["vendors"])
app.include_router(reservation_router.router, prefix="/api/v1/reservations", tags=["reservations"])
app.include_router(auth_router.router, prefix="/api/v1/auth", tags=["auth"])


@app.get("/health")
async def health():
    return {"status": "ok"}


# 클라이언트 정적 파일 서빙
client_dist_path = Path(__file__).parent.parent / "client" / "dist"

if client_dist_path.exists():
    # 정적 파일 (assets, images 등) 서빙
    app.mount("/assets", StaticFiles(directory=str(client_dist_path / "assets")), name="assets")
    
    # SPA fallback을 위한 middleware (CORS middleware 이후에 등록)
    @app.middleware("http")
    async def spa_middleware(request: Request, call_next):
        # API 경로와 정적 파일 경로는 그대로 전달
        if request.url.path.startswith("/api/") or request.url.path.startswith("/assets/") or request.url.path == "/health":
            return await call_next(request)
        
        # 정적 파일 요청 처리 (vite.svg 등)
        file_path = client_dist_path / request.url.path.lstrip("/")
        if file_path.exists() and file_path.is_file() and file_path.name != "index.html":
            return FileResponse(str(file_path))
        
        # SPA 라우팅을 위해 index.html 반환
        index_path = client_dist_path / "index.html"
        if index_path.exists():
            return FileResponse(str(index_path))
        
        return await call_next(request)
