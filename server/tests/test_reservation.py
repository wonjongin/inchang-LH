import pytest
from fastapi import status
from datetime import date, timedelta


@pytest.fixture
def test_user(client, test_user_data):
    """테스트용 사용자 생성"""
    response = client.post("/api/v1/users/", json=test_user_data)
    return response.json()["data"]


@pytest.fixture
def test_complex(client):
    """테스트용 단지 생성"""
    complex_data = {"name": "테스트 단지"}
    response = client.post("/api/v1/complexes/", json=complex_data)
    return response.json()["data"]


@pytest.fixture
def test_template(client):
    """테스트용 템플릿 생성"""
    template_data = {"name": "테스트 템플릿"}
    response = client.post("/api/v1/templates/", json=template_data)
    return response.json()["data"]


@pytest.fixture
def test_vendor(client, test_template):
    """테스트용 벤더 생성"""
    vendor_data = {
        "name": "테스트 벤더",
        "template": test_template["id"]
    }
    response = client.post("/api/v1/vendors/", json=vendor_data)
    return response.json()["data"]


def test_create_reservation(client, test_user, test_complex, test_vendor):
    """예약 생성 테스트"""
    reservation_data = {
        "cotis": "TEST-001",
        "reserved_at": str(date.today()),
        "location": test_complex["id"],
        "vendor": test_vendor["id"],
        "author": test_user["id"],
        "description": "테스트 예약"
    }
    response = client.post("/api/v1/reservations/", json=reservation_data)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["success"] is True
    assert data["data"]["cotis"] == reservation_data["cotis"]


def test_create_reservation_duplicate_cotis(client, test_user, test_complex, test_vendor):
    """중복된 COTIS로 예약 생성 시도 테스트"""
    reservation_data = {
        "cotis": "TEST-001",
        "reserved_at": str(date.today()),
        "location": test_complex["id"],
        "vendor": test_vendor["id"],
        "author": test_user["id"]
    }
    # 첫 번째 예약 생성
    client.post("/api/v1/reservations/", json=reservation_data)
    
    # 같은 COTIS로 다시 생성 시도
    response = client.post("/api/v1/reservations/", json=reservation_data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_create_reservation_invalid_complex(client, test_user, test_vendor):
    """존재하지 않는 단지로 예약 생성 시도 테스트"""
    reservation_data = {
        "cotis": "TEST-002",
        "reserved_at": str(date.today()),
        "location": 99999,  # 존재하지 않는 단지 ID
        "vendor": test_vendor["id"],
        "author": test_user["id"]
    }
    response = client.post("/api/v1/reservations/", json=reservation_data)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_reservations(client, test_user, test_complex, test_vendor):
    """예약 목록 조회 테스트"""
    # 예약 생성
    reservation_data = {
        "cotis": "TEST-003",
        "reserved_at": str(date.today()),
        "location": test_complex["id"],
        "vendor": test_vendor["id"],
        "author": test_user["id"]
    }
    client.post("/api/v1/reservations/", json=reservation_data)
    
    # 목록 조회
    response = client.get("/api/v1/reservations/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) >= 1


def test_get_reservations_by_user(client, test_user, test_complex, test_vendor):
    """사용자별 예약 목록 조회 테스트"""
    # 예약 생성
    reservation_data = {
        "cotis": "TEST-004",
        "reserved_at": str(date.today()),
        "location": test_complex["id"],
        "vendor": test_vendor["id"],
        "author": test_user["id"]
    }
    client.post("/api/v1/reservations/", json=reservation_data)
    
    # 사용자별 필터링 조회
    response = client.get(f"/api/v1/reservations/?user_id={test_user['id']}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) >= 1


def test_get_reservation_by_id(client, test_user, test_complex, test_vendor):
    """ID로 예약 조회 테스트"""
    # 예약 생성
    reservation_data = {
        "cotis": "TEST-005",
        "reserved_at": str(date.today()),
        "location": test_complex["id"],
        "vendor": test_vendor["id"],
        "author": test_user["id"]
    }
    create_response = client.post("/api/v1/reservations/", json=reservation_data)
    reservation_id = create_response.json()["data"]["id"]
    
    # 예약 조회
    response = client.get(f"/api/v1/reservations/{reservation_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["data"]["id"] == reservation_id
    assert data["data"]["cotis"] == reservation_data["cotis"]


def test_get_reservation_by_cotis(client, test_user, test_complex, test_vendor):
    """COTIS로 예약 조회 테스트"""
    # 예약 생성
    cotis = "TEST-006"
    reservation_data = {
        "cotis": cotis,
        "reserved_at": str(date.today()),
        "location": test_complex["id"],
        "vendor": test_vendor["id"],
        "author": test_user["id"]
    }
    client.post("/api/v1/reservations/", json=reservation_data)
    
    # COTIS로 조회
    response = client.get(f"/api/v1/reservations/cotis/{cotis}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["data"]["cotis"] == cotis


def test_search_reservations(client, test_user, test_complex, test_vendor):
    """예약 검색 테스트"""
    reservation_data = {
        "cotis": "TEST-007",
        "reserved_at": str(date.today()),
        "location": test_complex["id"],
        "vendor": test_vendor["id"],
        "author": test_user["id"]
    }
    client.post("/api/v1/reservations/", json=reservation_data)
    
    # 검색
    response = client.get(f"/api/v1/reservations/search/{test_complex['name']}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data["data"]) >= 1
    assert data["success"] is True

def test_update_reservation(client, test_user, test_complex, test_vendor):
    """예약 정보 수정 테스트"""
    # 예약 생성
    reservation_data = {
        "cotis": "TEST-007",
        "reserved_at": str(date.today()),
        "location": test_complex["id"],
        "vendor": test_vendor["id"],
        "author": test_user["id"]
    }
    create_response = client.post("/api/v1/reservations/", json=reservation_data)
    reservation_id = create_response.json()["data"]["id"]
    
    # 예약 정보 수정
    tomorrow = date.today() + timedelta(days=1)
    response = client.put(
        f"/api/v1/reservations/{reservation_id}",
        params={
            "description": "수정된 설명",
            "completed_at": str(tomorrow)
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["data"]["description"] == "수정된 설명"


def test_delete_reservation(client, test_user, test_complex, test_vendor):
    """예약 삭제 테스트"""
    # 예약 생성
    reservation_data = {
        "cotis": "TEST-008",
        "reserved_at": str(date.today()),
        "location": test_complex["id"],
        "vendor": test_vendor["id"],
        "author": test_user["id"]
    }
    create_response = client.post("/api/v1/reservations/", json=reservation_data)
    reservation_id = create_response.json()["data"]["id"]
    
    # 예약 삭제
    response = client.delete(f"/api/v1/reservations/{reservation_id}")
    assert response.status_code == status.HTTP_200_OK
    
    # 삭제 확인
    get_response = client.get(f"/api/v1/reservations/{reservation_id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND

