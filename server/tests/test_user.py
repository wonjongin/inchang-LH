import pytest
from fastapi import status


def test_create_user(client, test_user_data):
    """사용자 생성 테스트"""
    response = client.post("/api/v1/users/", json=test_user_data)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["success"] is True
    assert data["data"]["name"] == test_user_data["name"]
    assert "id" in data["data"]
    assert "password" not in data["data"]  # 비밀번호는 응답에 포함되지 않아야 함


def test_create_user_duplicate_name(client, test_user_data):
    """중복된 이름으로 사용자 생성 시도 테스트"""
    # 첫 번째 사용자 생성
    client.post("/api/v1/users/", json=test_user_data)
    
    # 같은 이름으로 다시 생성 시도
    response = client.post("/api/v1/users/", json=test_user_data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_get_users(client, test_user_data):
    """사용자 목록 조회 테스트"""
    # 사용자 생성
    client.post("/api/v1/users/", json=test_user_data)
    
    # 목록 조회
    response = client.get("/api/v1/users/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) >= 1


def test_get_user_by_id(client, test_user_data):
    """ID로 사용자 조회 테스트"""
    # 사용자 생성
    create_response = client.post("/api/v1/users/", json=test_user_data)
    user_id = create_response.json()["data"]["id"]
    
    # 사용자 조회
    response = client.get(f"/api/v1/users/{user_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["data"]["id"] == user_id
    assert data["data"]["name"] == test_user_data["name"]


def test_get_user_not_found(client):
    """존재하지 않는 사용자 조회 테스트"""
    response = client.get("/api/v1/users/99999")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_update_user(client, test_user_data):
    """사용자 정보 수정 테스트"""
    # 사용자 생성
    create_response = client.post("/api/v1/users/", json=test_user_data)
    user_id = create_response.json()["data"]["id"]
    
    # 사용자 정보 수정
    response = client.put(
        f"/api/v1/users/{user_id}",
        params={"name": "updated_name"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["data"]["name"] == "updated_name"

