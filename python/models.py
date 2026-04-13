import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Float, Enum
from sqlalchemy.orm import relationship

from .database import Base

# --- Перечисления (Enums) ---
class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MASTER = "master"
    MANAGER = "manager"

class ClientType(str, enum.Enum):
    REGULAR = "regular"      # Постоянный
    NEW = "new"              # Новый
    VIP = "vip"              # VIP
    CORPORATE = "corporate"  # Корпоративный

# --- Модели таблиц ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)      # ← новое поле
    email = Column(String, unique=True, nullable=True)  # ← новое поле
    role = Column(Enum(UserRole), default=UserRole.MASTER)
    master_id = Column(Integer, ForeignKey("masters.id"), nullable=True)

    master_profile = relationship("Master", back_populates="user")
    
class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    email = Column(String)
    address = Column(String)
    client_type = Column(Enum(ClientType), nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    devices = relationship("Device", back_populates="owner")
    orders = relationship("Order", back_populates="client")

class Device(Base):
    __tablename__ = "devices"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))

    device_type = Column(String)
    brand = Column(String)
    model = Column(String)
    serial_number = Column(String)
    purchase_year = Column(Integer)
    specifications = Column(Text)
    warranty_until = Column(DateTime)
    status = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_repair_date = Column(DateTime)

    owner = relationship("Client", back_populates="devices")
    orders = relationship("Order", back_populates="device")

class Master(Base):
    __tablename__ = "masters"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    email = Column(String)
    experience = Column(Integer)
    specialization = Column(String)
    skills = Column(Text)
    hourly_rate = Column(Float)
    status = Column(String)
    rating = Column(Float, default=0.0)
    notes = Column(Text)
    hire_date = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="master_profile", uselist=False)
    orders = relationship("Order", back_populates="master")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    device_id = Column(Integer, ForeignKey("devices.id"))
    master_id = Column(Integer, ForeignKey("masters.id"))

    status = Column(String)
    description = Column(Text)
    price = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    client = relationship("Client", back_populates="orders")
    device = relationship("Device", back_populates="orders")
    master = relationship("Master", back_populates="orders")