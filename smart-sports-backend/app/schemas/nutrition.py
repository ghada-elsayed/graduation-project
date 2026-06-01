# from pydantic import BaseModel
# from typing import Optional
# from enum import Enum

# class GoalEnum(str, Enum):
#     lose_weight  = "lose_weight"
#     gain_muscle  = "gain_muscle"
#     maintain     = "maintain"

# class ActivityEnum(str, Enum):
#     sedentary = "sedentary"
#     light     = "light"
#     moderate  = "moderate"
#     active    = "active"

# class NutritionRequest(BaseModel):
#     age:        int
#     weight_kg:  float
#     height_cm:  float
#     gender:     str        # male / female
#     activity:   ActivityEnum
#     goal:       GoalEnum

# class NutritionResponse(BaseModel):
#     id:       int
#     goal:     str
#     calories: float
#     protein:  float
#     carbs:    float
#     fat:      float

#     class Config:
#         from_attributes = True
















# # app/schemas/nutrition.py
# from pydantic import BaseModel
# from typing import Optional
# from enum import Enum

# # ====================== Enums ======================
# class GoalEnum(str, Enum):
#     lose_weight = "lose_weight"
#     gain_muscle = "gain_muscle"
#     maintain    = "maintain"

# class ActivityEnum(str, Enum):
#     sedentary = "sedentary"
#     light     = "light"
#     moderate  = "moderate"
#     active    = "active"

# # ====================== Request Model ======================
# class NutritionRequest(BaseModel):
#     age: int
#     gender: str                     # "Male" or "Female"
#     weight_kg: float
#     height_cm: float
#     BMI: float                      # مهم جدًا للموديل
#     goal: GoalEnum
#     activity: ActivityEnum          # هيتم تحويله لـ activity_level داخل الـ service
#     surgery_type: str = "None"
#     sport_type: str = "None"
    
#     # Medical conditions
#     diabetes: int = 0
#     hypertension: int = 0
#     kidney_disease: int = 0
#     heart_disease: int = 0
#     pcos: int = 0
#     anemia: int = 0
#     gout: int = 0

#     class Config:
#         use_enum_values = True   # عشان يبعت القيم كـ string


# # ====================== Response Model ======================
# class NutritionResponse(BaseModel):
#     id: int
#     goal: str
#     calories: float
#     protein: float
#     carbs: float
#     fat: float
#     protein_percent: float
#     carbs_percent: float
#     fat_percent: float
#     source: str = "AI"

#     class Config:
#         from_attributes = True













from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class GoalEnum(str, Enum):
    Fat_Loss    = "Fat_Loss"
    Muscle_Gain = "Muscle_Gain"
    Maintenance = "Maintenance"

class ActivityEnum(str, Enum):
    Sedentary = "Sedentary"
    Light     = "Light"
    Moderate  = "Moderate"
    Active    = "Active"
    Athlete   = "Athlete"

class NutritionRequest(BaseModel):
    # ge = Greater than or Equal (أكبر من أو يساوي)
    age: int = Field(..., ge=1, le=120, description="العمر يجب أن يكون بين 1 و 120")
    weight_kg: float = Field(..., ge=20) # وزن منطقي
    height_cm: float = Field(..., ge=50) # طول منطقي
    gender:     str
    # weight_kg:  float
    # height_cm:  float
    BMI:        float
    goal:       GoalEnum
    activity:   ActivityEnum
    surgery_type:   str = "None"
    sport_type:     str = "None"
    diabetes:       int = 0
    hypertension:   int = 0
    kidney_disease: int = 0
    heart_disease:  int = 0
    pcos:           int = 0
    anemia:         int = 0
    gout:           int = 0
    ankle_injury:   int = 0
    back_pain:      int = 0
    muscle_tear:    int = 0

    class Config:
        use_enum_values = True

class NutritionResponse(BaseModel):
    id:      int
    goal:    str
    calories: float
    protein: float
    carbs:   float
    fat:     float

    class Config:
        from_attributes = True