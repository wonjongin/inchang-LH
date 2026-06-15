from fastapi import APIRouter, Depends, HTTPException, status
from core.security import get_current_user
from core.config import settings
from models.models import Permission, User
from sqlalchemy.orm import Session
from typing import List, Optional
import httpx
from db.database import get_db
from schemas.common import CommonResponse
from .schema import ComplexCreate, ComplexUpdate, ComplexResponse, ComplexPaginatedResponse, ComplexQuickSearchResponse, CoordinatesResponse
from . import crud

router = APIRouter()


@router.get("/", response_model=CommonResponse[ComplexPaginatedResponse])
async def get_complexes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    complexes = crud.get_complexes(db, skip=skip, limit=limit)
    return CommonResponse(data=ComplexPaginatedResponse.model_validate(ComplexPaginatedResponse(
        items=complexes,
        total=crud.get_complexes_count(db),
        page=skip + 1,
        limit=limit,
        pages=crud.get_complexes_count(db) // limit + 1
    )))


@router.get("/all_names", response_model=CommonResponse[List[ComplexQuickSearchResponse]])
async def get_all_complex_names(db: Session = Depends(get_db)):
    complexes = crud.get_all_complex_names(db)
    return CommonResponse(data=[ComplexQuickSearchResponse.model_validate(c) for c in complexes])


@router.get("/search/{query}", response_model=CommonResponse[ComplexPaginatedResponse])
async def search_complexes(query: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    complexes = crud.search_complexes(db, query=query, skip=skip, limit=limit)
    return CommonResponse(data=ComplexPaginatedResponse.model_validate(ComplexPaginatedResponse(
        items=complexes,
        total=crud.get_complexes_count_by_query(db, query),
        page=skip + 1,
        limit=limit,
        pages=crud.get_complexes_count_by_query(db, query) // 100 + 1
    )))

@router.get("/{complex_id}/coordinates", response_model=CommonResponse[CoordinatesResponse])
async def get_complex_coordinates(complex_id: int, db: Session = Depends(get_db)):
    complex = crud.get_complex(db, complex_id=complex_id)
    if not complex:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complex not found")

    if complex.lat is not None and complex.lon is not None:
        return CommonResponse(data=CoordinatesResponse(lat=complex.lat, lon=complex.lon))

    if not complex.address:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="단지 주소가 등록되어 있지 않습니다.")

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://apis.openapi.sk.com/tmap/geo/fullAddrGeo",
            params={
                "addressFlag": "F00",
                "coordType": "WGS84GEO",
                "version": "1",
                "format": "json",
                "fullAddr": complex.address,
                "appKey": settings.TMAP_API_KEY,
            },
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="좌표 변환 API 오류")

    coordinates = resp.json().get("coordinateInfo", {}).get("coordinate", [])
    if not coordinates:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="주소에 해당하는 좌표를 찾을 수 없습니다.")

    coord = coordinates[0]
    lat = float(coord.get("newLat") or coord.get("lat") or 0)
    lon = float(coord.get("newLon") or coord.get("lon") or 0)

    if not lat or not lon:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="좌표 값을 파싱할 수 없습니다.")

    crud.save_coordinates(db, complex_id=complex_id, lat=lat, lon=lon)
    return CommonResponse(data=CoordinatesResponse(lat=lat, lon=lon))


@router.get("/{complex_id}", response_model=CommonResponse[ComplexResponse])
async def get_complex(complex_id: int, db: Session = Depends(get_db)):
    complex = crud.get_complex(db, complex_id=complex_id)
    if not complex:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complex not found")
    return CommonResponse(data=ComplexResponse.model_validate(complex))



@router.post("/", response_model=CommonResponse[ComplexResponse], status_code=status.HTTP_201_CREATED)
async def create_complex(complex: ComplexCreate, db: Session = Depends(get_db)):
    db_complex = crud.create_complex(db=db, complex=complex)
    return CommonResponse(data=ComplexResponse.model_validate(db_complex))


@router.put("/{complex_id}", response_model=CommonResponse[ComplexResponse])
async def update_complex(
    complex_id: int,
    complex: ComplexUpdate,
    db: Session = Depends(get_db)
):
    db_complex = crud.update_complex(
        db=db,
        complex_id=complex_id,
        **complex.model_dump(exclude_unset=True)
    )
    if not db_complex:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complex not found")
    return CommonResponse(data=ComplexResponse.model_validate(db_complex))


@router.delete("/{complex_id}", response_model=CommonResponse[dict])
async def delete_complex(complex_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.permission != Permission.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="관리자만 삭제할 수 있습니다.")
    success = crud.delete_complex(db=db, complex_id=complex_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complex not found")
    return CommonResponse(data={"deleted": True})

