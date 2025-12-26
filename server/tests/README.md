# API 테스트

FastAPI 애플리케이션의 API 엔드포인트를 테스트합니다.

## 설치

```bash
pip3 install -r requirements.txt
```

## 테스트 실행

```bash
# 모든 테스트 실행
pytest

# 특정 파일만 실행
pytest tests/test_user.py

# 상세한 출력과 함께 실행
pytest -v

# 커버리지와 함께 실행
pytest --cov=.

# 특정 테스트만 실행
pytest tests/test_user.py::test_create_user
```

## 테스트 구조

- `conftest.py`: 테스트 설정 및 공통 fixture
- `test_main.py`: 메인 엔드포인트 테스트
- `test_user.py`: 사용자 API 테스트
- `test_complex.py`: 단지 API 테스트
- `test_template.py`: 템플릿 API 테스트
- `test_vendor.py`: 벤더 API 테스트
- `test_reservation.py`: 예약 API 테스트

## Fixture

- `client`: TestClient 인스턴스 (각 테스트마다 새로운 DB 세션)
- `db_session`: 데이터베이스 세션
- `test_user_data`: 테스트용 사용자 데이터

## 주의사항

- 각 테스트는 독립적으로 실행됩니다
- 테스트용 인메모리 SQLite 데이터베이스를 사용합니다
- 테스트 후 데이터베이스는 자동으로 정리됩니다
