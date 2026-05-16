from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from python import crud
from .. import crud, schemas
from ..database import SessionLocal

router = APIRouter(prefix="/devices", tags=["devices"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Device)
def create_device(device: schemas.DeviceCreate, db: Session = Depends(get_db)):
    # Проверяем существование клиента
    db_client = crud.get_client(db, client_id=device.client_id)
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    return crud.create_device(db=db, device=device)

@router.get("/", response_model=List[schemas.Device])
def read_devices(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_devices(db, skip=skip, limit=limit)

@router.get("/{device_id}", response_model=schemas.Device)
def read_device(device_id: int, db: Session = Depends(get_db)):
    db_device = crud.get_device(db, device_id=device_id)
    if db_device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    return db_device

@router.put("/{device_id}", response_model=schemas.Device)
def update_device(device_id: int, device: schemas.DeviceUpdate, db: Session = Depends(get_db)):
    db_device = crud.update_device(db, device_id=device_id, device_update=device)
    if db_device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    return db_device

@router.delete("/{device_id}", response_model=schemas.Device)
def delete_device(device_id: int, db: Session = Depends(get_db)):
    db_device = crud.delete_device(db, device_id=device_id)
    if db_device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    return db_device