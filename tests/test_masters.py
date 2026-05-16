import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_api_create_master(client):
    data = {"full_name": "Мастер Петров", "phone": "+7 123", "experience": 5}
    resp = client.post("/masters/", json=data)
    assert resp.status_code == 200
    assert resp.json()["full_name"] == "Мастер Петров"

def test_api_get_masters(client):
    resp = client.get("/masters/")
    assert resp.status_code == 200
    # может быть пустым, не проверяем длину

def test_get_master_not_found(client):
    resp = client.get("/masters/99999")
    assert resp.status_code == 404

def test_update_master_not_found(client):
    resp = client.put("/masters/99999", json={"full_name": "Новый"})
    assert resp.status_code == 404

def test_delete_master_not_found(client):
    resp = client.delete("/masters/99999")
    assert resp.status_code == 404