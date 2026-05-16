import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_full_business_flow(client):
    # 1. Клиент
    cl = client.post("/clients/", json={"full_name": "Иван", "phone": "+7", "client_type": "regular"})
    client_id = cl.json()["id"]
    # 2. Устройство
    dev = client.post("/devices/", json={"client_id": client_id, "device_type": "pc", "brand": "Dell", "model": "OptiPlex"})
    device_id = dev.json()["id"]
    # 3. Заявка
    ord = client.post("/orders/", json={"client_id": client_id, "device_id": device_id, "description": "Не грузится", "status": "new"})
    order_id = ord.json()["id"]
    # 4. Мастер
    master = client.post("/masters/", json={"full_name": "Мастер", "phone": "+7"})
    master_id = master.json()["id"]
    # 5. Назначить мастера и изменить статус
    client.put(f"/orders/{order_id}", json={"master_id": master_id, "status": "in_repair"})
    # 6. Завершить
    client.put(f"/orders/{order_id}", json={"status": "ready"})
    final = client.get(f"/orders/{order_id}").json()
    assert final["status"] == "ready"
    assert final["master_id"] == master_id