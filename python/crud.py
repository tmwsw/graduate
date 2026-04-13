from sqlalchemy.orm import Session
from typing import Optional, List
from . import models, schemas

# -------------------- USERS --------------------
def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_password_hash(password: str) -> str:
    return password

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return plain_password == hashed_password

def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        username=user.username,
        hashed_password=get_password_hash(user.password),
        full_name=user.full_name,      # ← сохраняем
        email=user.email,              # ← сохраняем
        role=user.role,
        master_id=user.master_id,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate) -> Optional[models.User]:
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    update_data = user_update.dict(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    for field, value in update_data.items():
        setattr(db_user, field, value)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int) -> Optional[models.User]:
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    print(f"Попытка входа: username={username}, password={password}")
    user = db.query(models.User).filter(models.User.username == username).first()
    if user:
        print(f"Найден пользователь, пароль в БД: {user.hashed_password}")
    else:
        print("Пользователь не найден")
        return None
    if not verify_password(password, user.hashed_password):
        print("Пароль не совпал")
        return None
    print("Успешная аутентификация")
    return user

# -------------------- CLIENTS --------------------
def get_client(db: Session, client_id: int) -> Optional[models.Client]:
    return db.query(models.Client).filter(models.Client.id == client_id).first()

def get_clients(db: Session, skip: int = 0, limit: int = 100) -> List[models.Client]:
    return db.query(models.Client).offset(skip).limit(limit).all()

def create_client(db: Session, client: schemas.ClientCreate) -> models.Client:
    db_client = models.Client(**client.dict())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def update_client(db: Session, client_id: int, client_update: schemas.ClientUpdate) -> Optional[models.Client]:
    db_client = get_client(db, client_id)
    if not db_client:
        return None
    update_data = client_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_client, field, value)
    db.commit()
    db.refresh(db_client)
    return db_client

def delete_client(db: Session, client_id: int) -> Optional[models.Client]:
    db_client = get_client(db, client_id)
    if db_client:
        db.delete(db_client)
        db.commit()
    return db_client

# -------------------- DEVICES --------------------
def get_device(db: Session, device_id: int) -> Optional[models.Device]:
    return db.query(models.Device).filter(models.Device.id == device_id).first()

def get_devices(db: Session, skip: int = 0, limit: int = 100) -> List[models.Device]:
    return db.query(models.Device).offset(skip).limit(limit).all()

def create_device(db: Session, device: schemas.DeviceCreate) -> models.Device:
    db_device = models.Device(**device.dict())
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device

def update_device(db: Session, device_id: int, device_update: schemas.DeviceUpdate) -> Optional[models.Device]:
    db_device = get_device(db, device_id)
    if not db_device:
        return None
    update_data = device_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_device, field, value)
    db.commit()
    db.refresh(db_device)
    return db_device

def delete_device(db: Session, device_id: int) -> Optional[models.Device]:
    db_device = get_device(db, device_id)
    if db_device:
        db.delete(db_device)
        db.commit()
    return db_device

# -------------------- MASTERS --------------------
def get_master(db: Session, master_id: int) -> Optional[models.Master]:
    return db.query(models.Master).filter(models.Master.id == master_id).first()

def get_masters(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Master).offset(skip).limit(limit).all()

def create_master(db: Session, master: schemas.MasterCreate):
    db_master = models.Master(**master.dict())
    db.add(db_master)
    db.commit()
    db.refresh(db_master)
    return db_master

def update_master(db: Session, master_id: int, master_update: schemas.MasterUpdate) -> Optional[models.Master]:
    db_master = get_master(db, master_id)
    if not db_master:
        return None
    update_data = master_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_master, field, value)
    db.commit()
    db.refresh(db_master)
    return db_master

def delete_master(db: Session, master_id: int) -> Optional[models.Master]:
    db_master = get_master(db, master_id)
    if db_master:
        db.delete(db_master)
        db.commit()
    return db_master

# -------------------- ORDERS --------------------
def get_order(db: Session, order_id: int) -> Optional[models.Order]:
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Order).offset(skip).limit(limit).all()

def create_order(db: Session, order: schemas.OrderCreate):
    db_order = models.Order(**order.dict())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

def update_order(db: Session, order_id: int, order_update: schemas.OrderUpdate) -> Optional[models.Order]:
    db_order = get_order(db, order_id)
    if not db_order:
        return None
    update_data = order_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_order, field, value)
    db.commit()
    db.refresh(db_order)
    return db_order

def delete_order(db: Session, order_id: int) -> Optional[models.Order]:
    db_order = get_order(db, order_id)
    if db_order:
        db.delete(db_order)
        db.commit()
    return db_order