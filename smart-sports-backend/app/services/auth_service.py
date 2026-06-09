from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password, verify_password, create_access_token

def register_user(user_data: UserCreate, db: Session):
    # تحقق إن الإيميل مش موجود قبل كده
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="الإيميل ده موجود بالفعل")

    # اعمل المستخدم الجديد
    new_user = User(
        full_name       = user_data.full_name,
        email           = user_data.email,
        hashed_password = hash_password(user_data.password),
        role            = user_data.role,
        age             = user_data.age,
        weight_kg       = user_data.weight_kg,
        height_cm       = user_data.height_cm,
        phone           = user_data.phone,
        sport           = user_data.sport,
        position        = user_data.position,
        city            = user_data.city,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def login_user(email: str, password: str, db: Session):
    # جيب المستخدم
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="إيميل أو باسورد غلط")

    # تحقق من الباسورد
    if not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="إيميل أو باسورد غلط")

    # عمل الـ token
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return token, user


def reset_user_password(email: str, new_password: str, db: Session):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")

    user.hashed_password = hash_password(new_password)
    db.commit()
    db.refresh(user)
    return user