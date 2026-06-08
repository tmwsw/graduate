from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine
from .models import Base
from .routers import items, devices, masters, orders, users, auth, notifications, import_data

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="РемонтТех API",
    description="Бэкенд для сервиса ремонта техники",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем все роутеры
app.include_router(items.router)      # /Клиенты
app.include_router(devices.router)    # /Устройства
app.include_router(masters.router)    # /Мастера
app.include_router(orders.router)     # /Заявки
app.include_router(users.router)      # /Пользователи
app.include_router(auth.router)       # /Аутентификация
app.include_router(notifications.router)    # /Уведомления
app.include_router(import_data.router)  # /Импорт данных из вне

@app.get("/")
def read_root():
    return {"message": "Добро пожаловать в API сервиса РемонтТех"}