import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models
import json
from datetime import datetime

router = APIRouter(prefix="/import", tags=["import"])

# ---------- вспомогательные функции ----------
def read_file_to_df(file: UploadFile) -> pd.DataFrame:
    if file.filename.endswith('.csv'):
        df = pd.read_csv(file.file, dtype=str)
    elif file.filename.endswith(('.xls', '.xlsx')):
        df = pd.read_excel(file.file, dtype=str)
    else:
        raise HTTPException(400, "Поддерживаются только CSV и Excel")
    df = df.dropna(how='all')
    return df

def clean_val(val):
    if pd.isna(val):
        return None
    s = str(val).strip()
    return s if s else None

# ---------- импорт клиентов ----------
@router.post("/clients")
async def import_clients(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)  # временно отключено
):
    # if current_user.role != "admin":
    #     raise HTTPException(403, "Доступ запрещён")
    
    df = read_file_to_df(file)
    required = ["full_name", "phone"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise HTTPException(400, f"Отсутствуют колонки: {', '.join(missing)}")
    
    success = 0
    errors = []
    for idx, row in df.iterrows():
        row_num = idx + 2
        try:
            full_name = clean_val(row.get("full_name"))
            phone = clean_val(row.get("phone"))
            if not full_name or not phone:
                errors.append(f"Строка {row_num}: обязательные поля full_name, phone")
                continue
            existing = db.query(models.Client).filter(models.Client.phone == phone).first()
            if existing:
                errors.append(f"Строка {row_num}: клиент с телефоном '{phone}' уже есть")
                continue
            new_client = models.Client(
                full_name=full_name,
                phone=phone,
                email=clean_val(row.get("email")),
                address=clean_val(row.get("address")),
                client_type=clean_val(row.get("client_type")) or "regular",
                notes=clean_val(row.get("notes"))
            )
            db.add(new_client)
            db.commit()
            success += 1
        except Exception as e:
            db.rollback()
            errors.append(f"Строка {row_num}: {str(e)}")
    return {"imported": success, "errors": errors}

# ---------- импорт мастеров ----------
@router.post("/masters")
async def import_masters(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    df = read_file_to_df(file)
    required = ["full_name", "phone"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise HTTPException(400, f"Отсутствуют колонки: {', '.join(missing)}")
    
    success = 0
    errors = []
    for idx, row in df.iterrows():
        row_num = idx + 2
        try:
            full_name = clean_val(row.get("full_name"))
            phone = clean_val(row.get("phone"))
            if not full_name or not phone:
                errors.append(f"Строка {row_num}: обязательные поля full_name, phone")
                continue
            existing = db.query(models.Master).filter(models.Master.phone == phone).first()
            if existing:
                errors.append(f"Строка {row_num}: мастер с телефоном '{phone}' уже есть")
                continue
            experience = clean_val(row.get("experience"))
            if experience:
                try:
                    experience = int(experience)
                except:
                    experience = None
            specialization_raw = clean_val(row.get("specialization"))
            specialization = []
            if specialization_raw:
                try:
                    specialization = json.loads(specialization_raw)
                except:
                    specialization = [s.strip() for s in specialization_raw.split(',')]
            new_master = models.Master(
                full_name=full_name,
                phone=phone,
                email=clean_val(row.get("email")),
                experience=experience,
                specialization=json.dumps(specialization) if specialization else None,
                skills=clean_val(row.get("skills")),
                hourly_rate=float(clean_val(row.get("hourly_rate"))) if clean_val(row.get("hourly_rate")) else 0,
                status=clean_val(row.get("status")) or "active",
                notes=clean_val(row.get("notes"))
            )
            db.add(new_master)
            db.commit()
            success += 1
        except Exception as e:
            db.rollback()
            errors.append(f"Строка {row_num}: {str(e)}")
    return {"imported": success, "errors": errors}

# ---------- импорт устройств ----------
@router.post("/devices")
async def import_devices(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    df = read_file_to_df(file)
    required = ["brand", "model", "device_type", "client_phone"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise HTTPException(400, f"Отсутствуют колонки: {', '.join(missing)}")
    
    success = 0
    errors = []
    for idx, row in df.iterrows():
        row_num = idx + 2
        try:
            brand = clean_val(row.get("brand"))
            model = clean_val(row.get("model"))
            device_type = clean_val(row.get("device_type"))
            client_phone = clean_val(row.get("client_phone"))
            if not brand or not model or not device_type or not client_phone:
                errors.append(f"Строка {row_num}: обязательные поля brand, model, device_type, client_phone")
                continue

            client = db.query(models.Client).filter(models.Client.phone == client_phone).first()
            if not client:
                errors.append(f"Строка {row_num}: клиент с телефоном '{client_phone}' не найден")
                continue

            serial_number = clean_val(row.get("serial_number"))
            if serial_number:
                existing = db.query(models.Device).filter(models.Device.serial_number == serial_number).first()
                if existing:
                    errors.append(f"Строка {row_num}: устройство с серийным номером '{serial_number}' уже есть")
                    continue

            purchase_year = clean_val(row.get("purchase_year"))
            if purchase_year:
                try:
                    purchase_year = int(purchase_year)
                except:
                    purchase_year = None

            specifications = clean_val(row.get("specifications"))
            status = clean_val(row.get("status")) or "new"
            notes = clean_val(row.get("notes"))

            # Обработка warranty_until (строку -> date)
            warranty_until_str = clean_val(row.get("warranty_until"))
            warranty_until = None
            if warranty_until_str:
                try:
                    # Пытаемся распарсить ISO формат YYYY-MM-DD
                    date_part = warranty_until_str.split()[0]  # отсекаем время, если есть
                    warranty_until = datetime.strptime(date_part, '%Y-%m-%d').date()
                except:
                    try:
                        warranty_until = datetime.strptime(warranty_until_str, '%Y-%m-%d %H:%M:%S').date()
                    except:
                        errors.append(f"Строка {row_num}: неверный формат даты в колонке warranty_until (ожидается YYYY-MM-DD)")
                        continue

            new_device = models.Device(
                client_id=client.id,
                brand=brand,
                model=model,
                device_type=device_type,
                serial_number=serial_number,
                purchase_year=purchase_year,
                specifications=specifications,
                warranty_until=warranty_until,
                status=status,
                notes=notes
            )
            db.add(new_device)
            db.commit()
            success += 1
        except Exception as e:
            db.rollback()
            errors.append(f"Строка {row_num}: {str(e)}")
    return {"imported": success, "errors": errors}

# ---------- импорт заказов ----------
@router.post("/orders")
async def import_orders(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    df = read_file_to_df(file)
    required = ["client_phone", "device_serial", "description"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise HTTPException(400, f"Отсутствуют колонки: {', '.join(missing)}")
    
    success = 0
    errors = []
    for idx, row in df.iterrows():
        row_num = idx + 2
        try:
            client_phone = clean_val(row.get("client_phone"))
            device_serial = clean_val(row.get("device_serial"))
            description = clean_val(row.get("description"))
            if not client_phone or not device_serial or not description:
                errors.append(f"Строка {row_num}: обязательные поля client_phone, device_serial, description")
                continue

            # Поиск клиента по телефону
            client = db.query(models.Client).filter(models.Client.phone == client_phone).first()
            if not client:
                errors.append(f"Строка {row_num}: клиент с телефоном '{client_phone}' не найден")
                continue

            # Поиск устройства по серийному номеру
            device = db.query(models.Device).filter(models.Device.serial_number == device_serial).first()
            if not device:
                errors.append(f"Строка {row_num}: устройство с серийным номером '{device_serial}' не найдено")
                continue

            # Опционально мастер
            master_phone = clean_val(row.get("master_phone"))
            master_id = None
            if master_phone:
                master = db.query(models.Master).filter(models.Master.phone == master_phone).first()
                if not master:
                    errors.append(f"Строка {row_num}: мастер с телефоном '{master_phone}' не найден")
                    continue
                master_id = master.id

            price = clean_val(row.get("price"))
            if price:
                try:
                    price = float(price)
                except:
                    price = 0
            else:
                price = 0

            status = clean_val(row.get("status")) or "new"
            # Приводим статус к одному из допустимых (new, in_repair, ready, returned)
            if status not in ["new", "in_repair", "ready", "returned"]:
                status = "new"

            new_order = models.Order(
                client_id=client.id,
                device_id=device.id,
                master_id=master_id,
                description=description,
                price=price,
                status=status
            )
            db.add(new_order)
            db.commit()
            success += 1
        except Exception as e:
            db.rollback()
            errors.append(f"Строка {row_num}: {str(e)}")
    return {"imported": success, "errors": errors}