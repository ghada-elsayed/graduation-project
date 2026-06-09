# from pydantic import BaseModel, EmailStr
# from enum import Enum

# class RoleEnum(str, Enum):
#     admin   = "admin"
#     player  = "player"
#     fitness = "fitness"

# # بيانات التسجيل الجديد
# class UserCreate(BaseModel):
#     full_name: str
#     email: EmailStr
#     password: str
#     role: RoleEnum = RoleEnum.fitness

# # بيانات تسجيل الدخول
# class UserLogin(BaseModel):
#     email: EmailStr
#     password: str

# # البيانات اللي بترجع للـ frontend (بدون password)
# class UserResponse(BaseModel):
#     id: int
#     full_name: str
#     email: str
#     role: str

#     class Config:
#         from_attributes = True

# # الـ Token اللي بيرجع بعد اللوجين
# class Token(BaseModel):
#     access_token: str
#     token_type: str
#     user: UserResponse




from pydantic import BaseModel, EmailStr
from enum import Enum
from typing import Optional

class RoleEnum(str, Enum):
    admin   = "admin"
    player  = "player"
    fitness = "fitness"
    club    = "club"

class UserCreate(BaseModel):
    full_name: str
    email:     EmailStr
    password:  str
    role:      RoleEnum = RoleEnum.player
    age:       Optional[int]   = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    phone:     Optional[str]   = None
    sport:     Optional[str]   = None
    position:  Optional[str]   = None
    city:      Optional[str]   = None

class UserLogin(BaseModel):
    email:    EmailStr
    password: str

class ResetPassword(BaseModel):
    email:        EmailStr
    new_password: str

class UserResponse(BaseModel):
    id:        int
    full_name: str
    email:     str
    role:      str
    age:       Optional[int]   = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    phone:     Optional[str]   = None
    sport:     Optional[str]   = None
    position:  Optional[str]   = None
    city:      Optional[str]   = None
    # Stats
    goals:         Optional[int]   = None
    assists:        Optional[int]   = None
    matches:        Optional[int]   = None
    shot_accuracy:  Optional[float] = None
    win_rate:       Optional[float] = None
    games_played:   Optional[int]   = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type:   str
    user:         UserResponse