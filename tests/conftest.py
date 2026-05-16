# tests/conftest.py
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from python.database import Base
from python.main import app

# ==================== ТЕСТОВАЯ БАЗА ДАННЫХ В ПАМЯТИ ====================
TEST_DATABASE_URL = "sqlite:///:memory:?check_same_thread=False"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,          # гарантирует изоляцию
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Создаём таблицы один раз
Base.metadata.create_all(bind=engine)

# ==================== ПОДМЕНА ЗАВИСИМОСТИ get_db ====================
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Убедись, что get_db импортируется правильно (функция должна быть в python/database.py)
from python.database import get_db
app.dependency_overrides[get_db] = override_get_db

# ==================== ФИКСТУРА ДЛЯ ОЧИСТКИ БД ПЕРЕД КАЖДЫМ ТЕСТОМ ====================
@pytest.fixture(scope="function", autouse=True)
def clean_db():
    """Очищает все таблицы перед каждым тестом."""
    for table in reversed(Base.metadata.sorted_tables):
        with engine.connect() as conn:
            conn.execute(table.delete())
    yield

# ==================== ФИКСТУРЫ ДЛЯ ТЕСТОВ ====================
@pytest.fixture(scope="function")
def client():
    """Тестовый клиент FastAPI."""
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture(scope="function")
def db_session():
    """Сессия БД для прямых CRUD-тестов."""
    db = TestingSessionLocal()
    yield db
    db.close()

@pytest.fixture
def sample_client_data():
    return {
        "full_name": "Тестовый Клиент",
        "phone": "+7 (999) 111-22-33",
        "email": "test@example.com",
        "address": "ул. Тестовая, д. 1",
        "client_type": "regular",
        "notes": "Тестовый клиент"
    }

@pytest.fixture
def sample_device_data(db_session, sample_client_data):
    from python import crud, schemas
    client_in = schemas.ClientCreate(**sample_client_data)
    db_client = crud.create_client(db=db_session, client=client_in)
    return {
        "client_id": db_client.id,
        "device_type": "notebook",
        "brand": "Apple",
        "model": "MacBook Pro",
        "serial_number": "SN123456",
        "status": "new"
    }