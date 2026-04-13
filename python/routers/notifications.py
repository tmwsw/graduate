import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from ..database import SessionLocal
from .. import crud, models

router = APIRouter(prefix="/notifications", tags=["notifications"])

# Хранилище токенов (в реальном проекте – в БД)
tracking_tokens = {}  # {order_id: {"token": str, "expires": datetime}}

class EmailRequest(BaseModel):
    recipient_email: str
    subject: str
    body: str

def send_email_smtp(recipient: str, subject: str, body: str):
    smtp_server = "smtp.mail.ru"
    port = 587
    sender_email = "goth_angel.sinner@vk.com"
    password = "57of okuj ipyg oxan"

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = recipient
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain", "utf-8"))

    try:
        with smtplib.SMTP(smtp_server, port) as server:
            server.starttls()
            server.login(sender_email, password)
            server.send_message(msg)
    except Exception as e:
        print(f"Ошибка отправки email: {e}")

def send_order_tracking_email(order_id: int, recipient_email: str):
    token = secrets.token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(days=7)
    tracking_tokens[order_id] = {"token": token, "expires": expires}
    tracking_url = f"http://127.0.0.1:8000/track/order/{order_id}?token={token}"
    subject = f"Статус вашей заявки №{order_id} – РемонтТех"
    body = f"""Здравствуйте!

Ваша заявка на ремонт №{order_id} зарегистрирована.
Вы можете отслеживать её статус по ссылке:
{tracking_url}

Ссылка действительна до {expires.strftime('%d.%m.%Y %H:%M')}.

С уважением,
РемонтТех
"""
    send_email_smtp(recipient_email, subject, body)

@router.post("/send-order-tracking/{order_id}")
async def send_order_tracking(
    order_id: int,
    recipient_email: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(lambda: SessionLocal())
):
    """Генерирует токен и отправляет ссылку для отслеживания заказа."""
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Генерируем уникальный токен
    token = secrets.token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(days=7)  # ссылка активна 7 дней
    tracking_tokens[order_id] = {"token": token, "expires": expires}

    tracking_url = f"http://127.0.0.1:8000/track/order/{order_id}?token={token}"
    subject = f"Статус вашей заявки №{order_id} – РемонтТех"
    body = f"""Здравствуйте!

Ваша заявка на ремонт №{order_id} зарегистрирована.
Вы можете отслеживать её статус по ссылке:
{tracking_url}

Ссылка действительна до {expires.strftime('%d.%m.%Y %H:%M')}.

С уважением,
РемонтТех
"""
    background_tasks.add_task(send_email_smtp, recipient_email, subject, body)
    return {"message": "Tracking link sent to email"}

@router.get("/track/order/{order_id}")
def track_order(order_id: int, token: str, db: Session = Depends(lambda: SessionLocal())):
    """Публичная страница отслеживания заказа (только чтение)."""
    token_data = tracking_tokens.get(order_id)
    if not token_data or token_data["token"] != token:
        raise HTTPException(status_code=403, detail="Invalid or expired token")
    if datetime.utcnow() > token_data["expires"]:
        raise HTTPException(status_code=403, detail="Token expired")

    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Возвращаем только публичную информацию
    return {
        "id": order.id,
        "status": order.status,
        "description": order.description,
        "price": order.price,
        "created_at": order.created_at,
        "updated_at": order.updated_at
    }