import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from python import crud, schemas

# -------------------- CRUD unit‑тесты --------------------
def test_create_client(db_session, sample_client_data):
    client_in = schemas.ClientCreate(**sample_client_data)
    db_client = crud.create_client(db=db_session, client=client_in)
    assert db_client.id is not None
    assert db_client.full_name == sample_client_data["full_name"]

def test_get_client(db_session, sample_client_data):
    client_in = schemas.ClientCreate(**sample_client_data)
    created = crud.create_client(db=db_session, client=client_in)
    fetched = crud.get_client(db=db_session, client_id=created.id)
    assert fetched.id == created.id

def test_update_client(db_session, sample_client_data):
    client_in = schemas.ClientCreate(**sample_client_data)
    created = crud.create_client(db=db_session, client=client_in)
    update_data = schemas.ClientUpdate(full_name="Обновлённый Клиент")
    updated = crud.update_client(db=db_session, client_id=created.id, client_update=update_data)
    assert updated.full_name == "Обновлённый Клиент"

def test_delete_client(db_session, sample_client_data):
    client_in = schemas.ClientCreate(**sample_client_data)
    created = crud.create_client(db=db_session, client=client_in)
    deleted = crud.delete_client(db=db_session, client_id=created.id)
    assert deleted.id == created.id
    assert crud.get_client(db=db_session, client_id=created.id) is None

# -------------------- API интеграционные тесты --------------------
def test_api_create_client(client, sample_client_data):
    resp = client.post("/clients/", json=sample_client_data)
    assert resp.status_code == 200
    data = resp.json()
    assert data["full_name"] == sample_client_data["full_name"]
    assert "id" in data

def test_api_get_clients(client, sample_client_data):
    # Создаём клиента
    create_resp = client.post("/clients/", json=sample_client_data)
    created_id = create_resp.json()["id"]
    # Получаем список
    resp = client.get("/clients/")
    assert resp.status_code == 200
    data = resp.json()
    # Ищем созданного клиента в списке
    found = any(c["id"] == created_id for c in data)
    assert found, "Созданный клиент не найден в общем списке"

def test_api_update_client(client, sample_client_data):
    create_resp = client.post("/clients/", json=sample_client_data)
    client_id = create_resp.json()["id"]
    update_payload = {"full_name": "Изменённый Тест"}
    resp = client.put(f"/clients/{client_id}", json=update_payload)
    assert resp.status_code == 200
    assert resp.json()["full_name"] == "Изменённый Тест"

def test_api_delete_client(client, sample_client_data):
    create_resp = client.post("/clients/", json=sample_client_data)
    client_id = create_resp.json()["id"]
    resp = client.delete(f"/clients/{client_id}")
    assert resp.status_code == 200
    get_resp = client.get(f"/clients/{client_id}")
    assert get_resp.status_code == 404

# -------------------- Edge-кейсы --------------------
def test_create_client_invalid_empty_full_name(client):
    invalid = {"full_name": "", "phone": "+7 123", "client_type": "regular"}
    resp = client.post("/clients/", json=invalid)
    assert resp.status_code == 422   # Pydantic validation

def test_create_client_missing_required_field(client):
    invalid = {"phone": "+7 123"}
    resp = client.post("/clients/", json=invalid)
    assert resp.status_code == 422

def test_get_client_not_found(client):
    resp = client.get("/clients/99999")
    assert resp.status_code == 404
    assert resp.json()["detail"] == "Client not found"

def test_update_client_not_found(client):
    resp = client.put("/clients/99999", json={"full_name": "Несуществующий"})
    assert resp.status_code == 404

def test_delete_client_not_found(client):
    resp = client.delete("/clients/99999")
    assert resp.status_code == 404