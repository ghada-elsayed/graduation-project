# def calculate_nutrition(age, weight_kg, height_cm, gender, activity, goal):
#     # 1. حساب BMR
#     if gender == "male":
#         bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
#     else:
#         bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161

#     # 2. Activity Factor
#     factors = {
#         "sedentary": 1.2,
#         "light":     1.375,
#         "moderate":  1.55,
#         "active":    1.725
#     }
#     tdee = bmr * factors.get(activity, 1.55)

#     # 3. تعديل حسب الهدف
#     goal_adj = {
#         "lose_weight": -500,
#         "gain_muscle": +300,
#         "maintain":    0
#     }
#     calories = tdee + goal_adj.get(goal, 0)

#     # 4. تقسيم الـ Macros
#     protein = weight_kg * 2.0
#     fat     = calories * 0.25 / 9
#     carbs   = (calories - protein * 4 - fat * 9) / 4

#     return {
#         "calories": round(calories),
#         "protein":  round(protein),
#         "carbs":    round(carbs),
#         "fat":      round(fat)
#     }




# # app/services/nutrition_service.py
# import pandas as pd
# import numpy as np
# import joblib
# from tensorflow.keras.models import load_model
# from pathlib import Path

# from app.models.nutrition import NutritionInput, NutritionOutput

# # ====================== Paths ======================
# BASE_DIR = Path(__file__).resolve().parent.parent
# ML_DIR = BASE_DIR / "infrastructure" / "ml_models"

# MODEL_PATH = ML_DIR / "nutrition_model.h5"
# SCALER_PATH = ML_DIR / "scaler.pkl"
# FEATURES_PATH = ML_DIR / "feature_columns.pkl"

# # ====================== Load AI Model ======================
# print("🔄 Loading Nutrition AI Model...")

# try:
#     ai_model = load_model(MODEL_PATH, compile=False)
#     ai_model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    
#     scaler = joblib.load(SCALER_PATH)
#     feature_columns = joblib.load(FEATURES_PATH)
    
#     print("✅ AI Nutrition Model loaded successfully!")
# except Exception as e:
#     print(f"❌ Failed to load AI model: {e}")
#     ai_model = None
#     scaler = None
#     feature_columns = None


# # ====================== Old Traditional Function ======================
# def calculate_nutrition(age, weight_kg, height_cm, gender, activity, goal):
#     """الطريقة التقليدية (القديمة)"""
#     # 1. حساب BMR
#     if gender.lower() == "male":
#         bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
#     else:
#         bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161

#     # 2. Activity Factor
#     factors = {
#         "sedentary": 1.2,
#         "light":     1.375,
#         "moderate":  1.55,
#         "active":    1.725
#     }
#     tdee = bmr * factors.get(activity.lower(), 1.55)

#     # 3. تعديل حسب الهدف
#     goal_adj = {
#         "lose_weight": -500,
#         "gain_muscle": 300,
#         "maintain":    0
#     }
#     calories = tdee + goal_adj.get(goal.lower(), 0)

#     # 4. تقسيم الـ Macros (تقليدي)
#     protein = weight_kg * 2.0
#     fat     = calories * 0.25 / 9
#     carbs   = (calories - protein * 4 - fat * 9) / 4

#     return {
#         "calories": round(calories),
#         "protein":  round(protein),
#         "carbs":    round(carbs),
#         "fat":      round(fat),
#         "source": "traditional"
#     }


# # ====================== AI Prediction Function ======================
# def prepare_input(user: NutritionInput):
#     """تحضير الإدخال للموديل الـ AI"""
#     data = pd.DataFrame([{
#         'age': user.age,
#         'gender': 0 if str(user.gender).lower() == 'male' else 1,
#         'BMI': user.BMI,
#         'athlete': 0 if str(user.sport_type).strip() in ["", "None", "null"] else 1,
#         'diabetes': user.diabetes,
#         'hypertension': user.hypertension,
#         'kidney_disease': user.kidney_disease,
#         'heart_disease': user.heart_disease,
#         'pcos': user.pcos,
#         'anemia': user.anemia,
#         'gout': user.gout,
#         'goal': user.goal,
#         'activity_level': user.activity_level,
#         'surgery_type': user.surgery_type,
#     }])

#     goal_enc = pd.get_dummies(data['goal'], prefix='goal')
#     act_enc = pd.get_dummies(data['activity_level'], prefix='act')
#     surg_enc = pd.get_dummies(data['surgery_type'], prefix='surg')

#     data = pd.concat([
#         data.drop(['goal', 'activity_level', 'surgery_type'], axis=1),
#         goal_enc, act_enc, surg_enc
#     ], axis=1)

#     for col in feature_columns:
#         if col not in data.columns:
#             data[col] = 0

#     data = data[feature_columns]
#     return scaler.transform(data)


# def predict_macros_ai(user: NutritionInput) -> NutritionOutput:
#     """استخدام الموديل الـ AI للتنبؤ بالماكروز"""
#     if ai_model is None:
#         raise Exception("AI Model is not loaded")

#     try:
#         input_scaled = prepare_input(user)
#         pred = ai_model.predict(input_scaled, verbose=0)[0]
#         pred = pred / pred.sum()   # normalize

#         return NutritionOutput(
#             protein_percent=round(float(pred[0] * 100), 1),
#             carbs_percent=round(float(pred[1] * 100), 1),
#             fat_percent=round(float(pred[2] * 100), 1)
#         )
#     except Exception as e:
#         raise Exception(f"AI Prediction failed: {str(e)}")


# # ====================== Main Combined Function ======================
# def get_nutrition_plan(user: NutritionInput, weight_kg: float, height_cm: float):
#     """
#     الدالة الرئيسية - تجمع بين الطريقة التقليدية والـ AI
#     """
#     # 1. حساب السعرات والماكروز بالطريقة التقليدية
#     traditional = calculate_nutrition(
#         age=user.age,
#         weight_kg=weight_kg,
#         height_cm=height_cm,
#         gender=user.gender,
#         activity=user.activity_level,
#         goal=user.goal
#     )

#     # 2. التنبؤ بالنسب المئوية باستخدام الـ AI
#     try:
#         ai_result = predict_macros_ai(user)
#         ai_percent = {
#             "protein_percent": ai_result.protein_percent,
#             "carbs_percent": ai_result.carbs_percent,
#             "fat_percent": ai_result.fat_percent
#         }
#         source = "AI + Traditional"
#     except Exception as e:
#         print(f"AI failed, using traditional only: {e}")
#         ai_percent = {"protein_percent": 30, "carbs_percent": 45, "fat_percent": 25}
#         source = "traditional (AI failed)"

#     # 3. دمج النتيجة
#     return {
#         "calories": traditional["calories"],
#         "protein_grams": traditional["protein"],
#         "carbs_grams": traditional["carbs"],
#         "fat_grams": traditional["fat"],
#         "protein_percent": ai_percent["protein_percent"],
#         "carbs_percent": ai_percent["carbs_percent"],
#         "fat_percent": ai_percent["fat_percent"],
#         "source": source
#     }



















# # app/services/nutrition_service.py
# import pandas as pd
# import numpy as np
# import joblib
# from tensorflow.keras.models import load_model
# from pathlib import Path

# from app.schemas.nutrition import NutritionRequest

# # ====================== Paths ======================
# BASE_DIR = Path(__file__).resolve().parent.parent
# ML_DIR = BASE_DIR / "infrastructure" / "ml_models"

# MODEL_PATH = ML_DIR / "nutrition_model.h5"
# SCALER_PATH = ML_DIR / "scaler.pkl"
# FEATURES_PATH = ML_DIR / "feature_columns.pkl"

# # Load AI Model
# print("🔄 Loading Nutrition AI Model...")
# try:
#     ai_model = load_model(MODEL_PATH, compile=False)
#     ai_model.compile(optimizer='adam', loss='mse', metrics=['mae'])
#     scaler = joblib.load(SCALER_PATH)
#     feature_columns = joblib.load(FEATURES_PATH)
#     print("✅ AI Model loaded successfully!")
# except Exception as e:
#     print(f"❌ Model loading failed: {e}")
#     ai_model = None

# # ====================== Dynamic Tips ======================
# def get_dynamic_nutrition_tips(goal: str, activity: str):
#     """نصائح ديناميكية بناءً على الهدف والنشاط"""
#     tips = []
    
#     goal_lower = str(goal).lower()
    
#     if "lose" in goal_lower or "fat" in goal_lower:
#         tips = [
#             "ركز على عجز سعري معتدل (500 سعرة يوميًا)",
#             "حافظ على بروتين عالي للحفاظ على العضلات",
#             "قلل الكربوهيدرات البسيطة وزود الخضروات",
#             "اشرب 3 لتر ماء على الأقل يوميًا"
#         ]
#     elif "gain" in goal_lower or "muscle" in goal_lower:
#         tips = [
#             "زود سعراتك بـ 300-500 سعرة فوق احتياجك اليومي",
#             "ركز على البروتين (2 جرام لكل كجم من وزنك)",
#             "كلي كربوهيدرات معقدة بعد التمرين",
#             "نام 7-9 ساعات لدعم نمو العضلات"
#         ]
#     else:  # maintain
#         tips = [
#             "حافظ على توازن بين السعرات المدخلة والمحروقة",
#             "ركز على جودة الطعام أكثر من الكمية",
#             "وزع وجباتك على 4-5 وجبات يوميًا",
#             "اشرب 2.5-3 لتر ماء يوميًا"
#         ]
    
#     if str(activity).lower() in ["active", "moderate"]:
#         tips.append("أضف وجبة غنية بالبروتين بعد التمرين")
    
#     return tips


# # ====================== Main Function ======================
# def get_nutrition_plan(user: NutritionRequest, weight_kg: float, height_cm: float):
#     if ai_model is None:
#         raise Exception("AI Model not loaded")

#     try:
#         # حساب BMI
#         height_m = height_cm / 100
#         bmi = round(weight_kg / (height_m ** 2), 1)

#         # Prepare input for AI model
#         input_data = pd.DataFrame([{
#             'age': user.age,
#             'gender': 0 if str(user.gender).lower() == 'male' else 1,
#             'BMI': bmi,
#             'athlete': 0,
#             'diabetes': getattr(user, 'diabetes', 0),
#             'hypertension': getattr(user, 'hypertension', 0),
#             'kidney_disease': getattr(user, 'kidney_disease', 0),
#             'heart_disease': getattr(user, 'heart_disease', 0),
#             'pcos': getattr(user, 'pcos', 0),
#             'anemia': getattr(user, 'anemia', 0),
#             'gout': getattr(user, 'gout', 0),
#             'goal': user.goal,
#             'activity_level': user.activity,
#             'surgery_type': getattr(user, 'surgery_type', "None"),
#         }])

#         # One-hot encoding
#         goal_enc = pd.get_dummies(input_data['goal'], prefix='goal')
#         act_enc = pd.get_dummies(input_data['activity_level'], prefix='act')
#         surg_enc = pd.get_dummies(input_data['surgery_type'], prefix='surg')

#         input_data = pd.concat([input_data.drop(['goal', 'activity_level', 'surgery_type'], axis=1), 
#                                goal_enc, act_enc, surg_enc], axis=1)

#         for col in feature_columns:
#             if col not in input_data.columns:
#                 input_data[col] = 0

#         input_scaled = scaler.transform(input_data[feature_columns])

#         # AI Prediction
#         pred = ai_model.predict(input_scaled, verbose=0)[0]
#         pred = pred / pred.sum()

#         # Traditional calculation
#         if str(user.gender).lower() == "male":
#             bmr = 10*weight_kg + 6.25*height_cm - 5*user.age + 5
#         else:
#             bmr = 10*weight_kg + 6.25*height_cm - 5*user.age - 161

#         tdee = bmr * 1.55  # متوسط
#         calories = round(tdee - 300 if "lose" in str(user.goal).lower() else tdee)

#         protein_g = round(weight_kg * 2.0)

#         return {
#             "calories": calories,
#             "protein_grams": protein_g,
#             "carbs_grams": round((calories * 0.45) / 4),
#             "fat_grams": round((calories * 0.3) / 9),
#             "protein_percent": round(float(pred[0] * 100), 1),
#             "carbs_percent": round(float(pred[1] * 100), 1),
#             "fat_percent": round(float(pred[2] * 100), 1),
#             "tips": get_dynamic_nutrition_tips(user.goal, user.activity),
#             "source": "AI Model",
#             "tips": get_dynamic_nutrition_tips(user.goal, user.activity)
#         }

#     except Exception as e:
#         raise Exception(f"Error: {str(e)}")






# دة التعديل القبل الاخير







# # app/services/nutrition_service.py
# from app.services.advanced_nutrition_system import AdvancedNutritionSystem
# from app.schemas.nutrition import NutritionRequest
# from fastapi import HTTPException

# # Load the system once
# nutrition_system = AdvancedNutritionSystem()

# # def get_nutrition_plan(user: NutritionRequest, weight_kg: float, height_cm: float):
# #     """
# #     استخدام النظام الأصلي من الـ Notebook
# #     """
# #     try:
# #         # Prepare user data for the original system
# #         user_data = {
# #             'age': user.age,
# #             'gender': user.gender,
# #             'BMI': user.BMI,
# #             'goal': user.goal,
# #             'activity_level': user.activity,
# #             'surgery_type': getattr(user, 'surgery_type', 'None'),
# #             'sport_type': getattr(user, 'sport_type', 'None'),
# #             'diabetes': getattr(user, 'diabetes', 0),
# #             'hypertension': getattr(user, 'hypertension', 0),
# #             'kidney_disease': getattr(user, 'kidney_disease', 0),
# #             'heart_disease': getattr(user, 'heart_disease', 0),
# #             'pcos': getattr(user, 'pcos', 0),
# #             'anemia': getattr(user, 'anemia', 0),
# #             'gout': getattr(user, 'gout', 0),
# #         }

# #         # Generate the plan using the original system
# #         daily_plan = nutrition_system.generate_daily_plan(user_data, weight_kg * 30)  # تقريبي للسعرات

# #         # Extract macros from prediction
# #         macros = nutrition_system.predict_macros(user_data)

# #         return {
# #             "calories": int(daily_plan['meals'][0]['totals']['calories'] * 3),  # تقريبي
# #             "protein_grams": sum(m['totals']['protein'] for m in daily_plan['meals']),
# #             "carbs_grams": sum(m['totals']['carbs'] for m in daily_plan['meals']),
# #             "fat_grams": sum(m['totals']['fat'] for m in daily_plan['meals']),
# #             "protein_percent": round(macros['protein'], 1),
# #             "carbs_percent": round(macros['carbs'], 1),
# #             "fat_percent": round(macros['fat'], 1),
# #             "tips": [
# #                 "Drink at least 2-3 liters of water daily",
# #                 "Spread your meals across 4-6 smaller meals per day",
# #                 "Eat protein with every meal to support muscle recovery"
# #             ],
# #             "daily_plan": daily_plan,   # نرجع الوجبات كاملة
# #             "source": "Advanced AI Nutrition System"
# #         }

# #     except Exception as e:
# #         raise HTTPException(status_code=500, detail=f"Error generating plan: {str(e)}")
# def get_nutrition_plan(user: NutritionRequest, weight_kg: float, height_cm: float):
#     try:
#         user_data = {
#             'age': user.age,
#             'gender': user.gender,
#             'BMI': user.BMI,
#             'goal': user.goal,
#             'activity_level': user.activity,
#             'surgery_type': getattr(user, 'surgery_type', 'None'),
#             'sport_type': getattr(user, 'sport_type', 'None'),
#             'diabetes': getattr(user, 'diabetes', 0),
#             'hypertension': getattr(user, 'hypertension', 0),
#             'kidney_disease': getattr(user, 'kidney_disease', 0),
#             'heart_disease': getattr(user, 'heart_disease', 0),
#             'pcos': getattr(user, 'pcos', 0),
#             'anemia': getattr(user, 'anemia', 0),
#             'gout': getattr(user, 'gout', 0),
#         }

#         # استخدام النظام الأصلي
#         daily_plan = nutrition_system.generate_daily_plan(user_data, weight_kg * 30)  # تقريبي

#         macros = nutrition_system.predict_macros(user_data)

#         return {
#             "calories": int(daily_plan['meals'][0]['totals']['calories'] * 3),
#             "protein_grams": sum(m['totals']['protein'] for m in daily_plan['meals']),
#             "carbs_grams": sum(m['totals']['carbs'] for m in daily_plan['meals']),
#             "fat_grams": sum(m['totals']['fat'] for m in daily_plan['meals']),
#             "protein_percent": float(macros['protein']),
#             "carbs_percent": float(macros['carbs']),
#             "fat_percent": float(macros['fat']),
#             "tips": [
#                 "Drink at least 2-3 liters of water daily",
#                 "Spread your meals across 4-6 smaller meals per day",
#                 "Eat protein with every meal to support muscle recovery"
#             ],
#             "daily_plan": daily_plan,
#             "source": "Advanced AI Nutrition System"
#         }

#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=f"Error generating plan: {str(e)}")



















# from app.services.advanced_nutrition_system import AdvancedNutritionSystem, ExercisePlanner
# from app.schemas.nutrition import NutritionRequest
# from app.models.nutrition import NutritionPlan
# from sqlalchemy.orm import Session
# from fastapi import HTTPException
# import datetime

# nutrition_system = AdvancedNutritionSystem()
# exercise_planner = ExercisePlanner()

# def get_nutrition_plan(user: NutritionRequest, weight_kg: float, height_cm: float):
#     try:
#         # حساب BMI
#         height_m = height_cm / 100
#         bmi = round(weight_kg / (height_m ** 2), 1)

#         # حساب BMR بـ Mifflin-St Jeor
#         if user.gender == 'Male':
#             bmr = 10 * weight_kg + 6.25 * height_cm - 5 * user.age + 5
#         else:
#             bmr = 10 * weight_kg + 6.25 * height_cm - 5 * user.age - 161

#         # حساب TDEE
#         activity_multiplier = {
#             'Sedentary': 1.2,
#             'Light':     1.375,
#             'Moderate':  1.55,
#             'Active':    1.725,
#             'Athlete':   1.9
#         }
#         tdee = bmr * activity_multiplier.get(user.activity, 1.55)

#         # تعديل حسب الهدف
#         if user.goal == 'Fat_Loss':
#             calories = max(int(tdee - 500), 1400)
#         elif user.goal == 'Muscle_Gain':
#             calories = int(tdee + 400)
#         else:
#             calories = int(tdee)

#         # model input
#         user_data = {
#             'age':            user.age,
#             'gender':         user.gender,
#             'BMI':            bmi,
#             'goal':           user.goal,
#             'activity_level': user.activity,
#             'surgery_type':   getattr(user, 'surgery_type', 'None'),
#             'sport_type':     getattr(user, 'sport_type', 'None'),
#             'diabetes':       getattr(user, 'diabetes', 0),
#             'hypertension':   getattr(user, 'hypertension', 0),
#             'kidney_disease': getattr(user, 'kidney_disease', 0),
#             'heart_disease':  getattr(user, 'heart_disease', 0),
#             'pcos':           getattr(user, 'pcos', 0),
#             'anemia':         getattr(user, 'anemia', 0),
#             'gout':           getattr(user, 'gout', 0),
#         }

#         injuries = {
#             'ankle_injury': getattr(user, 'ankle_injury', 0),
#             'back_pain':    getattr(user, 'back_pain', 0),
#             'muscle_tear':  getattr(user, 'muscle_tear', 0),
#         }

#         # weekly meal plan
#         weekly_plan = nutrition_system.generate_weekly_plan(user_data, calories)
#         macros      = nutrition_system.predict_macros(user_data)

#         # exercise plan
#         workout = exercise_planner.select_exercises_by_goal(
#             goal           = user.goal,
#             available_days = 4,
#             injuries       = injuries
#         )

#         # حساب totals من الـ weekly plan
#         first_day = weekly_plan['days'][0]
#         total_protein = sum(m['totals']['protein'] for m in first_day['meals'])
#         total_carbs   = sum(m['totals']['carbs']   for m in first_day['meals'])
#         total_fat     = sum(m['totals']['fat']      for m in first_day['meals'])

#         return {
#             "calories":        calories,
#             "protein_grams":   round(total_protein, 1),
#             "carbs_grams":     round(total_carbs,   1),
#             "fat_grams":       round(total_fat,      1),
#             "protein_percent": round(float(macros['protein']), 1),
#             "carbs_percent":   round(float(macros['carbs']),   1),
#             "fat_percent":     round(float(macros['fat']),     1),
#             "bmi":             bmi,
#             "bmr":             round(bmr),
#             "tdee":            round(tdee),
#             "weekly_plan":     weekly_plan['days'],
#             "workout":         workout,
#             "source":          "Advanced AI Nutrition System"
#         }

#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=f"Error: {str(e)}")









# app/services/nutrition_service.py
from app.services.advanced_nutrition_system import AdvancedNutritionSystem, ExercisePlanner
from app.schemas.nutrition import NutritionRequest
from app.models.nutrition import NutritionPlan
from sqlalchemy.orm import Session
from fastapi import HTTPException
import datetime
import json

nutrition_system = AdvancedNutritionSystem()
exercise_planner = ExercisePlanner()


def get_nutrition_plan(user: NutritionRequest, weight_kg: float, height_cm: float, db: Session, user_id: int):
    try:
        # حساب BMI
        height_m = height_cm / 100
        bmi = round(weight_kg / (height_m ** 2), 1)

        # حساب BMR
        if user.gender.lower() == 'male':
            bmr = 10 * weight_kg + 6.25 * height_cm - 5 * user.age + 5
        else:
            bmr = 10 * weight_kg + 6.25 * height_cm - 5 * user.age - 161

        # حساب TDEE
        activity_multiplier = {
            'Sedentary': 1.2, 'Light': 1.375, 'Moderate': 1.55,
            'Active': 1.725, 'Athlete': 1.9
        }
        tdee = bmr * activity_multiplier.get(user.activity, 1.55)

        # تعديل السعرات حسب الهدف
        if user.goal == 'Fat_Loss':
            calories = max(int(tdee - 500), 1400)
        elif user.goal == 'Muscle_Gain':
            calories = int(tdee + 400)
        else:
            calories = int(tdee)

        # إعداد البيانات للنظام الأصلي
        user_data = {
            'age': user.age,
            'gender': user.gender,
            'BMI': bmi,
            'goal': user.goal,
            'activity_level': user.activity,
            'surgery_type': getattr(user, 'surgery_type', 'None'),
            'sport_type': getattr(user, 'sport_type', 'None'),
            'diabetes': getattr(user, 'diabetes', 0),
            'hypertension': getattr(user, 'hypertension', 0),
            'kidney_disease': getattr(user, 'kidney_disease', 0),
            'heart_disease': getattr(user, 'heart_disease', 0),
            'pcos': getattr(user, 'pcos', 0),
            'anemia': getattr(user, 'anemia', 0),
            'gout': getattr(user, 'gout', 0),
        }

        injuries = {
            'ankle_injury': getattr(user, 'ankle_injury', 0),
            'back_pain': getattr(user, 'back_pain', 0),
            'muscle_tear': getattr(user, 'muscle_tear', 0),
        }

        # توليد الخطة باستخدام النظام الأصلي
        weekly_plan = nutrition_system.generate_weekly_plan(user_data, calories)
        macros = nutrition_system.predict_macros(user_data)

        # توليد التمارين
        workout = exercise_planner.select_exercises_by_goal(
            goal=user.goal,
            available_days=4,
            injuries=injuries
            
        )
        print("WORKOUT DATA:", workout)
        print("WORKOUT TYPE:", type(workout))
        
        def make_json_safe(obj):
            if isinstance(obj, dict):
                return {k: make_json_safe(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [make_json_safe(i) for i in obj]
            elif hasattr(obj, 'item'):  # numpy types
                return obj.item()
            else:
                return obj
        workout_safe = make_json_safe(workout)

        # حساب إجمالي الماكروز من أول يوم
        first_day = weekly_plan['days'][0]
        total_protein = sum(m['totals']['protein'] for m in first_day['meals'])
        total_carbs   = sum(m['totals']['carbs'] for m in first_day['meals'])
        total_fat     = sum(m['totals']['fat'] for m in first_day['meals'])

        # تاريخ الانتهاء (بعد 7 أيام)
        expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)

        # حفظ الخطة في الداتابيز
        plan = NutritionPlan(
            user_id=user_id,
            goal=user.goal,
            calories=calories,
            protein_grams=round(total_protein, 1),
            carbs_grams=round(total_carbs, 1),
            fat_grams=round(total_fat, 1),
            protein_percent=round(float(macros['protein']), 1),
            carbs_percent=round(float(macros['carbs']), 1),
            fat_percent=round(float(macros['fat']), 1),
            daily_plan=weekly_plan,           # حفظ الخطة الأسبوعية كاملة
            workout = workout_safe,
            tips=["Drink plenty of water", "Eat protein with every meal", "Stay consistent with your plan"],
            expires_at=expires_at
        )

        db.add(plan)
        db.commit()
        db.refresh(plan)

        return {
            "id": plan.id,
            "calories": calories,
            "protein_grams": round(total_protein, 1),
            "carbs_grams": round(total_carbs, 1),
            "fat_grams": round(total_fat, 1),
            "protein_percent": round(float(macros['protein']), 1),
            "carbs_percent": round(float(macros['carbs']), 1),
            "fat_percent": round(float(macros['fat']), 1),
            "weekly_plan": weekly_plan['days'],
            "workout": workout_safe,
            "tips": plan.tips,
            "expires_at": expires_at.isoformat(),
            "source": "Advanced AI Nutrition System"
        }


    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating nutrition plan: {str(e)}")
    

    