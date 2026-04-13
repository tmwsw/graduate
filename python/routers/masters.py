from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas
from ..database import SessionLocal

router = APIRouter(prefix="/masters", tags=["masters"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Master)
def create_master(master: schemas.MasterCreate, db: Session = Depends(get_db)):
    return crud.create_master(db=db, master=master)

@router.get("/", response_model=List[schemas.Master])
def read_masters(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_masters(db, skip=skip, limit=limit)

@router.get("/{master_id}", response_model=schemas.Master)
def read_master(master_id: int, db: Session = Depends(get_db)):
    db_master = crud.get_master(db, master_id=master_id)
    if db_master is None:
        raise HTTPException(status_code=404, detail="Master not found")
    return db_master

@router.put("/{master_id}", response_model=schemas.Master)
def update_master(master_id: int, master: schemas.MasterUpdate, db: Session = Depends(get_db)):
    db_master = crud.update_master(db, master_id=master_id, master_update=master)
    if db_master is None:
        raise HTTPException(status_code=404, detail="Master not found")
    return db_master

@router.delete("/{master_id}", response_model=schemas.Master)
def delete_master(master_id: int, db: Session = Depends(get_db)):
    db_master = crud.delete_master(db, master_id=master_id)
    if db_master is None:
        raise HTTPException(status_code=404, detail="Master not found")
    return db_master