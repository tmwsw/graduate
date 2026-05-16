# ========== crud.py — БАЗОВЫЕ ОПЕРАЦИИ С БАЗОЙ ДАННЫХ (SQLAlchemy) ==========
# Содержит функции для работы с каждой моделью: получение, создание, обновление, удаление.
# Используется в эндпоинтах API.

from sqlalchemy.orm import Session
from typing import Optional, List
from . import models, schemas
import hashlib

# ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ПАРОЛЕЙ ====================

def get_password_hash(password: str) -> str:
    """Хеширование пароля через SHA256 с фиксированной солью."""
    salt = "remonttech_salt_2024"  # можно заменить на значение из переменных окружения
    return hashlib.sha256((password + salt).encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверка пароля. Поддерживает как открытые пароли (старые), так и хеши SHA256."""
    # Если хеш не является 64-символьной hex-строкой, считаем его открытым паролем
    if len(hashed_password) != 64 or not all(c in "0123456789abcdef" for c in hashed_password):
        return plain_password == hashed_password
    return get_password_hash(plain_password) == hashed_password

def upgrade_password_if_needed(db: Session, user: models.User, plain_password: str):
    """Если пароль пользователя хранится открыто, заменяем на хеш."""
    if len(user.hashed_password) != 64 or not all(c in "0123456789abcdef" for c in user.hashed_password):
        user.hashed_password = get_password_hash(plain_password)
        db.add(user)
        db.commit()

# ==================== ПОЛЬЗОВАТЕЛИ (USERS) ====================

def get_user(db: Session, user_id: int) -> Optional[models.User]:
    """Получить пользователя по ID."""
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    """Получить пользователя по логину (username)."""
    return db.query(models.User).filter(models.User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    """Получить список пользователей с пагинацией."""
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    db_user = models.User(
        username=user.username,
        hashed_password=get_password_hash(user.password),
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,                 # ← добавить
        bio=user.bio, 
        role=user.role,
        master_id=user.master_id,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate) -> Optional[models.User]:
    """Обновить данные пользователя. Если передан password – хешируется."""
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    update_data = user_update.model_dump(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    for field, value in update_data.items():
        setattr(db_user, field, value)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int) -> Optional[models.User]:
    """Удалить пользователя по ID."""
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

def authenticate_user(db: Session, username: str, password: str) -> Optional[models.User]:
    """Аутентификация пользователя. Возвращает объект User при успехе, иначе None.
       Автоматически обновляет открытые пароли на хешированные."""
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    # Если пароль был открытым – перехешируем и сохраняем
    upgrade_password_if_needed(db, user, password)
    return user

# ==================== КЛИЕНТЫ (CLIENTS) ====================

def get_client(db: Session, client_id: int) -> Optional[models.Client]:
    """Получить клиента по ID."""
    return db.query(models.Client).filter(models.Client.id == client_id).first()

def get_clients(db: Session, skip: int = 0, limit: int = 100) -> List[models.Client]:
    """Получить список клиентов с пагинацией."""
    return db.query(models.Client).offset(skip).limit(limit).all()

def create_client(db: Session, client: schemas.ClientCreate) -> models.Client:
    """Создать нового клиента."""
    db_client = models.Client(**client.model_dump())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def update_client(db: Session, client_id: int, client_update: schemas.ClientUpdate) -> Optional[models.Client]:
    """Обновить данные клиента."""
    db_client = get_client(db, client_id)
    if not db_client:
        return None
    update_data = client_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_client, field, value)
    db.commit()
    db.refresh(db_client)
    return db_client

def delete_client(db: Session, client_id: int) -> Optional[models.Client]:
    """Удалить клиента по ID."""
    db_client = get_client(db, client_id)
    if db_client:
        db.delete(db_client)
        db.commit()
    return db_client

# ==================== УСТРОЙСТВА (DEVICES) ====================

def get_device(db: Session, device_id: int) -> Optional[models.Device]:
    """Получить устройство по ID."""
    return db.query(models.Device).filter(models.Device.id == device_id).first()

def get_devices(db: Session, skip: int = 0, limit: int = 100) -> List[models.Device]:
    """Получить список устройств с пагинацией."""
    return db.query(models.Device).offset(skip).limit(limit).all()

def create_device(db: Session, device: schemas.DeviceCreate) -> models.Device:
    """Создать новое устройство."""
    db_device = models.Device(**device.model_dump())
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device

def update_device(db: Session, device_id: int, device_update: schemas.DeviceUpdate) -> Optional[models.Device]:
    """Обновить данные устройства."""
    db_device = get_device(db, device_id)
    if not db_device:
        return None
    update_data = device_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_device, field, value)
    db.commit()
    db.refresh(db_device)
    return db_device

def delete_device(db: Session, device_id: int) -> Optional[models.Device]:
    """Удалить устройство по ID."""
    db_device = get_device(db, device_id)
    if db_device:
        db.delete(db_device)
        db.commit()
    return db_device

# ==================== МАСТЕРА (MASTERS) ====================

def get_master(db: Session, master_id: int) -> Optional[models.Master]:
    """Получить мастера по ID."""
    return db.query(models.Master).filter(models.Master.id == master_id).first()

def get_masters(db: Session, skip: int = 0, limit: int = 100):
    """Получить список мастеров с пагинацией."""
    return db.query(models.Master).offset(skip).limit(limit).all()

def create_master(db: Session, master: schemas.MasterCreate):
    """Создать нового мастера."""
    db_master = models.Master(**master.model_dump())
    db.add(db_master)
    db.commit()
    db.refresh(db_master)
    return db_master

def update_master(db: Session, master_id: int, master_update: schemas.MasterUpdate) -> Optional[models.Master]:
    """Обновить данные мастера."""
    db_master = get_master(db, master_id)
    if not db_master:
        return None
    update_data = master_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_master, field, value)
    db.commit()
    db.refresh(db_master)
    return db_master

def delete_master(db: Session, master_id: int) -> Optional[models.Master]:
    """Удалить мастера по ID."""
    db_master = get_master(db, master_id)
    if db_master:
        db.delete(db_master)
        db.commit()
    return db_master

# ==================== ЗАЯВКИ (ORDERS) ====================

def get_order(db: Session, order_id: int) -> Optional[models.Order]:
    """Получить заявку по ID."""
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def get_orders(db: Session, skip: int = 0, limit: int = 100):
    """Получить список заявок с пагинацией."""
    return db.query(models.Order).offset(skip).limit(limit).all()

def create_order(db: Session, order: schemas.OrderCreate):
    """Создать новую заявку."""
    db_order = models.Order(**order.model_dump())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

def update_order(db: Session, order_id: int, order_update: schemas.OrderUpdate) -> Optional[models.Order]:
    """Обновить данные заявки."""
    db_order = get_order(db, order_id)
    if not db_order:
        return None
    update_data = order_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_order, field, value)
    db.commit()
    db.refresh(db_order)
    return db_order

def delete_order(db: Session, order_id: int) -> Optional[models.Order]:
    """Удалить заявку по ID."""
    db_order = get_order(db, order_id)
    if db_order:
        db.delete(db_order)
        db.commit()
    return db_order