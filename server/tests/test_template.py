import pytest
from fastapi import status


def test_create_template(client):
    """템플릿 생성 테스트"""
    template_data = {
        "name": "테스트 템플릿",
        "cotis_cell": "A1",
        "cotis_fmt": "YYYY-MM-DD"
    }
    response = client.post("/api/v1/templates/", json=template_data)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["success"] is True
    assert data["data"]["name"] == template_data["name"]


def test_get_templates(client):
    """템플릿 목록 조회 테스트"""
    # 템플릿 생성
    template_data = {"name": "테스트 템플릿"}
    client.post("/api/v1/templates/", json=template_data)
    
    # 목록 조회
    response = client.get("/api/v1/templates/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) >= 1


def test_get_template_by_id(client):
    """ID로 템플릿 조회 테스트"""
    # 템플릿 생성
    template_data = {"name": "테스트 템플릿"}
    create_response = client.post("/api/v1/templates/", json=template_data)
    template_id = create_response.json()["data"]["id"]
    
    # 템플릿 조회
    response = client.get(f"/api/v1/templates/{template_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["data"]["id"] == template_id


def test_update_template(client):
    """템플릿 정보 수정 테스트"""
    # 템플릿 생성
    template_data = {"name": "테스트 템플릿"}
    create_response = client.post("/api/v1/templates/", json=template_data)
    template_id = create_response.json()["data"]["id"]
    
    # 템플릿 정보 수정
    response = client.put(
        f"/api/v1/templates/{template_id}",
        params={"name": "수정된 템플릿명", "cotis_cell": "B2"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["data"]["name"] == "수정된 템플릿명"
    assert data["data"]["cotis_cell"] == "B2"


def test_delete_template(client):
    """템플릿 삭제 테스트"""
    # 템플릿 생성
    template_data = {"name": "테스트 템플릿"}
    create_response = client.post("/api/v1/templates/", json=template_data)
    template_id = create_response.json()["data"]["id"]
    
    # 템플릿 삭제
    response = client.delete(f"/api/v1/templates/{template_id}")
    assert response.status_code == status.HTTP_200_OK
    
    # 삭제 확인
    get_response = client.get(f"/api/v1/templates/{template_id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND

