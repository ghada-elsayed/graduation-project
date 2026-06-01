# from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
# from sqlalchemy.orm import relationship
# from app.database import Base
# import datetime

# class NutritionPlan(Base):
#     __tablename__ = "nutrition_plans"

#     id           = Column(Integer, primary_key=True, index=True)
#     user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
#     goal         = Column(String, nullable=False)  # lose_weight / gain_muscle / maintain
#     calories     = Column(Float, nullable=False)
#     protein      = Column(Float, nullable=False)
#     carbs        = Column(Float, nullable=False)
#     fat          = Column(Float, nullable=False)
#     created_at   = Column(DateTime, default=datetime.datetime.utcnow)

#     user = relationship("User", backref="nutrition_plans")











# # app/models/nutrition.py
# from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
# from sqlalchemy.orm import relationship
# from app.database import Base
# import datetime

# # ==================== SQLAlchemy Models ====================
# class NutritionPlan(Base):
#     __tablename__ = "nutrition_plans"

#     id           = Column(Integer, primary_key=True, index=True)
#     user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
#     goal         = Column(String, nullable=False)
#     calories     = Column(Float, nullable=False)
#     protein      = Column(Float, nullable=False)
#     carbs        = Column(Float, nullable=False)
#     fat          = Column(Float, nullable=False)
#     created_at   = Column(DateTime, default=datetime.datetime.utcnow)

#     user = relationship("User", backref="nutrition_plans")


# # ==================== Pydantic Schemas ====================
# from pydantic import BaseModel
# from typing import Optional

# class NutritionInput(BaseModel):
#     age: int
#     gender: str                  # "Male" or "Female"
#     BMI: float
#     goal: str                    # "Fat_Loss", "Muscle_Gain", "Maintain"
#     activity_level: str
#     surgery_type: str = "None"
#     sport_type: str = "None"
    
#     # Medical conditions (0 or 1)
#     diabetes: int = 0
#     hypertension: int = 0
#     kidney_disease: int = 0
#     heart_disease: int = 0
#     pcos: int = 0
#     anemia: int = 0
#     gout: int = 0


# class NutritionOutput(BaseModel):
#     protein_percent: float
#     carbs_percent: float
#     fat_percent: float


# class NutritionPlanCreate(BaseModel):
#     goal: str
#     calories: float
#     protein: float
#     carbs: float
#     fat: float


# class NutritionPlanResponse(NutritionPlanCreate):
#     id: int
#     user_id: int
#     created_at: datetime.datetime

#     class Config:
#         from_attributes = True














# app/models/nutrition.py
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base
import datetime

# ==================== SQLAlchemy Models ====================

class NutritionPlan(Base):
    __tablename__ = "nutrition_plans"

    id                = Column(Integer, primary_key=True, index=True)
    user_id           = Column(Integer, ForeignKey("users.id"), nullable=False)
    goal              = Column(String, nullable=False)
    calories          = Column(Float, nullable=False)
    protein_grams     = Column(Float, nullable=False)
    carbs_grams       = Column(Float, nullable=False)
    fat_grams         = Column(Float, nullable=False)
    protein_percent   = Column(Float, nullable=False)
    carbs_percent     = Column(Float, nullable=False)
    fat_percent       = Column(Float, nullable=False)
    
    daily_plan        = Column(JSON, nullable=True)      # حفظ الوجبات كاملة (Breakfast, Lunch, Dinner)
    workout           = Column(JSON, nullable=True)
    tips              = Column(JSON, nullable=True)      # النصائح
    expires_at        = Column(DateTime, nullable=False) # بعد 7 أيام يتم الحذف

    created_at        = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", backref="nutrition_plans")


# ==================== Pydantic Schemas ====================

from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class NutritionInput(BaseModel):
    age: int
    gender: str
    BMI: float
    weight_kg: float
    height_cm: float
    goal: str
    activity: str
    surgery_type: str = "None"
    sport_type: str = "None"
    
    diabetes: int = 0
    hypertension: int = 0
    kidney_disease: int = 0
    heart_disease: int = 0
    pcos: int = 0
    anemia: int = 0
    gout: int = 0


class NutritionResponse(BaseModel):
    calories: float
    protein_grams: float
    carbs_grams: float
    fat_grams: float
    protein_percent: float
    carbs_percent: float
    fat_percent: float
    tips: List[str]
    daily_plan: Optional[Dict[str, Any]] = None
    source: str = "AI Model"
    expires_at: datetime.datetime


class NutritionPlanCreate(BaseModel):
    goal: str
    calories: float
    protein_grams: float
    carbs_grams: float
    fat_grams: float
    protein_percent: float
    carbs_percent: float
    fat_percent: float


class NutritionPlanResponse(NutritionPlanCreate):
    id: int
    user_id: int
    created_at: datetime.datetime
    expires_at: datetime.datetime
    daily_plan: Optional[Dict] = None
    tips: List[str] = []

    class Config:
        from_attributes = True