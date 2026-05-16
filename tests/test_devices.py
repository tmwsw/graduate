import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from python import crud, schemas

def test_create_device(db_session, sample_device_data):
    device_in = schemas.DeviceCreate(**sample_device_data)
    db_device = crud.create_device(db=db_session, device=device_in)
    assert db_device.id is not None
    assert db_device.brand == sample_device_data["brand"]

def test_api_create_device(client, sample_device_data):
    resp = client.post("/devices/", json=sample_device_data)
    assert resp.status_code == 200
    assert resp.json()["brand"] == sample_device_data["brand"]

def test_api_get_devices(client, sample_device_data):
    client.post("/devices/", json=sample_device_data)
    resp = client.get("/devices/")
    assert resp.status_code == 200
    assert len(resp.json()) >= 1

def test_api_update_device(client, sample_device_data):
    create_resp = client.post("/devices/", json=sample_device_data)
    device_id = create_resp.json()["id"]
    resp = client.put(f"/devices/{device_id}", json={"brand": "UpdatedBrand"})
    assert resp.status_code == 200
    assert resp.json()["brand"] == "UpdatedBrand"

def test_api_delete_device(client, sample_device_data):
    create_resp = client.post("/devices/", json=sample_device_data)
    device_id = create_resp.json()["id"]
    resp = client.delete(f"/devices/{device_id}")
    assert resp.status_code == 200
    get_resp = client.get(f"/devices/{device_id}")
    assert get_resp.status_code == 404

# Edge-кейсы
def test_create_device_invalid_client(client):
    invalid = {"client_id": 99999, "device_type": "pc", "brand": "Test"}
    resp = client.post("/devices/", json=invalid)
    assert resp.status_code == 404

def test_get_device_not_found(client):
    resp = client.get("/devices/99999")
    assert resp.status_code == 404

def test_update_device_not_found(client):
    resp = client.put("/devices/99999", json={"brand": "New"})
    assert resp.status_code == 404

def test_delete_device_not_found(client):
    resp = client.delete("/devices/99999")
    assert resp.status_code == 404