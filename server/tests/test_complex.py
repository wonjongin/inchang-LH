import pytest
from fastapi import status


def test_create_complex(client):
    """단지 생성 테스트"""
    complex_data = {
        "name": "테스트 단지",
        "address": "서울시 강남구",
        "tel": "02-1234-5678",
        "email": "test@example.com"
    }
    response = client.post("/api/v1/complexes/", json=complex_data)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["success"] is True
    assert data["data"]["name"] == complex_data["name"]


def test_get_complexes(client):
    """단지 목록 조회 테스트"""
    # 단지 생성
    complex_data = {"name": "테스트 단지"}
    client.post("/api/v1/complexes/", json=complex_data)
    
    # 목록 조회
    response = client.get("/api/v1/complexes/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) >= 1


def test_get_complex_by_id(client):
    """ID로 단지 조회 테스트"""
    # 단지 생성
    complex_data = {"name": "테스트 단지"}
    create_response = client.post("/api/v1/complexes/", json=complex_data)
    complex_id = create_response.json()["data"]["id"]
    
    # 단지 조회
    response = client.get(f"/api/v1/complexes/{complex_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["data"]["id"] == complex_id


def test_update_complex(client):
    """단지 정보 수정 테스트"""
    # 단지 생성
    complex_data = {"name": "테스트 단지"}
    create_response = client.post("/api/v1/complexes/", json=complex_data)
    complex_id = create_response.json()["data"]["id"]
    
    # 단지 정보 수정
    response = client.put(
        f"/api/v1/complexes/{complex_id}",
        params={"name": "수정된 단지명"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["data"]["name"] == "수정된 단지명"


def test_delete_complex(client):
    """단지 삭제 테스트"""
    # 단지 생성
    complex_data = {"name": "테스트 단지"}
    create_response = client.post("/api/v1/complexes/", json=complex_data)
    complex_id = create_response.json()["data"]["id"]
    
    # 단지 삭제
    response = client.delete(f"/api/v1/complexes/{complex_id}")
    assert response.status_code == status.HTTP_200_OK
    
    # 삭제 확인
    get_response = client.get(f"/api/v1/complexes/{complex_id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND

