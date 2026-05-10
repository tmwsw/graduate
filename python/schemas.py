from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum
import enum

# --- Enums для совместимости с Pydantic и строковыми значениями ---
class UserRoleEnum(str, enum.Enum):
    ADMIN = "admin"
    MASTER = "master"
    MANAGER = "manager"

class ClientTypeEnum(str, Enum):
    REGULAR = "regular"
    NEW = "new"
    VIP = "vip"
    CORPORATE = "corporate"

# ========== User ==========
class UserBase(BaseModel):
    username: str
    role: UserRoleEnum = UserRoleEnum.ADMIN
    master_id: Optional[int] = None

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: UserRoleEnum = UserRoleEnum.MASTER
    master_id: Optional[int] = None

class UserUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[UserRoleEnum] = None
    master_id: Optional[int] = None
    password: Optional[str] = None 

class User(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: UserRoleEnum
    master_id: Optional[int] = None

    class Config:
        from_attributes = True
        
class UserOut(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: str
    avatar: Optional[str] = None

    class Config:
        orm_mode = True   # ← позволяет работать с объектами SQLAlchemy

# ========== Client ==========
class ClientBase(BaseModel):
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    client_type: ClientTypeEnum
    notes: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    client_type: Optional[ClientTypeEnum] = None
    notes: Optional[str] = None

class Client(ClientBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ========== Device ==========
class DeviceBase(BaseModel):
    client_id: int
    device_type: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    purchase_year: Optional[int] = None
    specifications: Optional[str] = None
    warranty_until: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    last_repair_date: Optional[datetime] = None

class DeviceCreate(DeviceBase):
    pass

class DeviceUpdate(BaseModel):
    client_id: Optional[int] = None
    device_type: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    purchase_year: Optional[int] = None
    specifications: Optional[str] = None
    warranty_until: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    last_repair_date: Optional[datetime] = None

class Device(DeviceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ========== Master ==========
class MasterBase(BaseModel):
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    experience: Optional[int] = None
    specialization: Optional[str] = None
    skills: Optional[str] = None
    hourly_rate: Optional[float] = None
    status: Optional[str] = None
    rating: float = 0.0
    notes: Optional[str] = None

class MasterCreate(MasterBase):
    pass

class MasterUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    experience: Optional[int] = None
    specialization: Optional[str] = None
    skills: Optional[str] = None
    hourly_rate: Optional[float] = None
    status: Optional[str] = None
    rating: Optional[float] = None
    notes: Optional[str] = None

class Master(MasterBase):
    id: int
    hire_date: datetime

    class Config:
        from_attributes = True

# ========== Order ==========
class OrderBase(BaseModel):
    client_id: int
    device_id: int
    master_id: Optional[int] = None
    status: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None


class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    client_id: Optional[int] = None
    device_id: Optional[int] = None
    master_id: Optional[int] = None
    status: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None

class Order(OrderBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
        
class UserLogin(BaseModel):
    username: str
    password: str