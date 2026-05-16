import sys
import os
import time
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_register_user(client):
    unique_username = f"testuser_{int(time.time())}"
    user_data = {
        "username": unique_username,
        "password": "secret",
        "full_name": "Test User",
        "email": f"{unique_username}@example.com"
    }
    resp = client.post("/auth/register", json=user_data)
    assert resp.status_code == 200
    assert resp.json()["username"] == unique_username

def test_register_duplicate_username(client):
    user = {"username": "duplicate", "password": "pass"}
    client.post("/auth/register", json=user)
    resp = client.post("/auth/register", json=user)
    assert resp.status_code == 400
    assert "already registered" in resp.text

def test_login_success(client):
    client.post("/auth/register", json={"username": "logintest", "password": "pass"})
    resp = client.post("/auth/login", json={"username": "logintest", "password": "pass"})
    assert resp.status_code == 200
    assert "id" in resp.json()

def test_login_wrong_password(client):
    client.post("/auth/register", json={"username": "wrongpass", "password": "correct"})
    resp = client.post("/auth/login", json={"username": "wrongpass", "password": "wrong"})
    assert resp.status_code == 401

def test_login_user_not_found(client):
    resp = client.post("/auth/login", json={"username": "nobody", "password": "x"})
    assert resp.status_code == 401