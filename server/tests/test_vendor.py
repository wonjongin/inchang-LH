import pytest
from fastapi import status


@pytest.fixture
def test_template(client):
    """테스트용 템플릿 생성"""
    template_data = {"name": "테스트 템플릿"}
    response = client.post("/api/v1/templates/", json=template_data)
    return response.json()["data"]


def test_create_vendor(client, test_template):
    """벤더 생성 테스트"""
    vendor_data = {
        "name": "테스트 벤더",
        "tel": "02-1234-5678",
        "range": "서울",
        "template": test_template["id"]
    }
    response = client.post("/api/v1/vendors/", json=vendor_data)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["success"] is True
    assert data["data"]["name"] == vendor_data["name"]


def test_create_vendor_with_invalid_template(client):
    """존재하지 않는 템플릿으로 벤더 생성 시도 테스트"""
    vendor_data = {
        "name": "테스트 벤더",
        "template": 99999  # 존재하지 않는 템플릿 ID
    }
    response = client.post("/api/v1/vendors/", json=vendor_data)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_vendors(client, test_template):
    """벤더 목록 조회 테스트"""
    # 벤더 생성
    vendor_data = {
        "name": "테스트 벤더",
        "template": test_template["id"]
    }
    client.post("/api/v1/vendors/", json=vendor_data)
    
    # 목록 조회
    response = client.get("/api/v1/vendors/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) >= 1


def test_get_vendors_by_template(client, test_template):
    """템플릿별 벤더 목록 조회 테스트"""
    # 벤더 생성
    vendor_data = {
        "name": "테스트 벤더",
        "template": test_template["id"]
    }
    client.post("/api/v1/vendors/", json=vendor_data)
    
    # 템플릿별 필터링 조회
    response = client.get(f"/api/v1/vendors/?template_id={test_template['id']}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) >= 1


def test_get_vendor_by_id(client, test_template):
    """ID로 벤더 조회 테스트"""
    # 벤더 생성
    vendor_data = {
        "name": "테스트 벤더",
        "template": test_template["id"]
    }
    create_response = client.post("/api/v1/vendors/", json=vendor_data)
    vendor_id = create_response.json()["data"]["id"]
    
    # 벤더 조회
    response = client.get(f"/api/v1/vendors/{vendor_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["data"]["id"] == vendor_id


def test_update_vendor(client, test_template):
    """벤더 정보 수정 테스트"""
    # 벤더 생성
    vendor_data = {
        "name": "테스트 벤더",
        "template": test_template["id"]
    }
    create_response = client.post("/api/v1/vendors/", json=vendor_data)
    vendor_id = create_response.json()["data"]["id"]
    
    # 벤더 정보 수정
    response = client.put(
        f"/api/v1/vendors/{vendor_id}",
        params={"name": "수정된 벤더명", "tel": "02-9999-8888"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["data"]["name"] == "수정된 벤더명"
    assert data["data"]["tel"] == "02-9999-8888"


def test_delete_vendor(client, test_template):
    """벤더 삭제 테스트"""
    # 벤더 생성
    vendor_data = {
        "name": "테스트 벤더",
        "template": test_template["id"]
    }
    create_response = client.post("/api/v1/vendors/", json=vendor_data)
    vendor_id = create_response.json()["data"]["id"]
    
    # 벤더 삭제
    response = client.delete(f"/api/v1/vendors/{vendor_id}")
    assert response.status_code == status.HTTP_200_OK
    
    # 삭제 확인
    get_response = client.get(f"/api/v1/vendors/{vendor_id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND

