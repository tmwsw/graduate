import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_full_order_cycle(client, sample_client_data, sample_device_data):
    # 1. Клиент
    client_resp = client.post("/clients/", json=sample_client_data)
    client_id = client_resp.json()["id"]
    # 2. Устройство
    device_data = sample_device_data.copy()
    device_data["client_id"] = client_id
    dev_resp = client.post("/devices/", json=device_data)
    device_id = dev_resp.json()["id"]
    # 3. Заявка
    order_data = {
        "client_id": client_id,
        "device_id": device_id,
        "description": "Неисправность",
        "status": "new",
        "price": 1000
    }
    resp = client.post("/orders/", json=order_data)
    assert resp.status_code == 200
    order_id = resp.json()["id"]
    # 4. Обновление статуса
    up = client.put(f"/orders/{order_id}", json={"status": "ready"})
    assert up.status_code == 200
    assert up.json()["status"] == "ready"
    # 5. Удаление
    client.delete(f"/orders/{order_id}")
    get_resp = client.get(f"/orders/{order_id}")
    assert get_resp.status_code == 404

def test_get_order_not_found(client):
    resp = client.get("/orders/99999")
    assert resp.status_code == 404

def test_update_order_not_found(client):
    resp = client.put("/orders/99999", json={"status": "ready"})
    assert resp.status_code == 404

def test_delete_order_not_found(client):
    resp = client.delete("/orders/99999")
    assert resp.status_code == 404