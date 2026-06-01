# app/services/advanced_nutrition_system.py
import pandas as pd
import numpy as np
import joblib
import math
import random
import tensorflow as tf
from typing import Dict, List
from tensorflow.keras.models import load_model
from tensorflow.keras.layers import InputLayer
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ML_DIR = BASE_DIR / "infrastructure" / "ml_models"

class AdvancedNutritionSystem:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_columns = None

        # تحميل Neural Network Model (نفس ما في الـ Notebook)
        try:
            self.model = tf.keras.models.load_model(ML_DIR / "nutrition_model.h5", compile=False)
            print("✅ Neural Network Model loaded successfully (from Notebook)")
        except Exception as e:
            print(f"⚠️ Neural Network loading failed: {e}")
            print("→ Using rule-based weighted macros as fallback")

        # تحميل Scaler و Feature Columns
        try:
            self.scaler = joblib.load(ML_DIR / "scaler.pkl")
            self.feature_columns = joblib.load(ML_DIR / "feature_columns.pkl")
        except:
            print("⚠️ Scaler or feature columns not found")

        self.create_healthy_food_database()


    def create_healthy_food_database(self):
        self.food_db = pd.DataFrame([
           # Protein
            {'ingr_name': 'chicken breast', 'category': 'Protein', 'cal/g': 1.65, 'protein(g)': 0.31, 'carb(g)': 0.00, 'fat(g)': 0.036},
            {'ingr_name': 'grilled chicken', 'category': 'Protein', 'cal/g': 1.65, 'protein(g)': 0.31, 'carb(g)': 0.00, 'fat(g)': 0.036},
            {'ingr_name': 'turkey breast', 'category': 'Protein', 'cal/g': 1.35, 'protein(g)': 0.30, 'carb(g)': 0.00, 'fat(g)': 0.02},
            {'ingr_name': 'lean beef', 'category': 'Protein', 'cal/g': 2.0, 'protein(g)': 0.26, 'carb(g)': 0.00, 'fat(g)': 0.10},
            {'ingr_name': 'salmon', 'category': 'Protein', 'cal/g': 2.08, 'protein(g)': 0.20, 'carb(g)': 0.00, 'fat(g)': 0.13},
            {'ingr_name': 'tuna', 'category': 'Protein', 'cal/g': 1.3, 'protein(g)': 0.29, 'carb(g)': 0.00, 'fat(g)': 0.01},
            {'ingr_name': 'tilapia', 'category': 'Protein', 'cal/g': 1.28, 'protein(g)': 0.26, 'carb(g)': 0.00, 'fat(g)': 0.027},
            {'ingr_name': 'cod', 'category': 'Protein', 'cal/g': 0.85, 'protein(g)': 0.19, 'carb(g)': 0.00, 'fat(g)': 0.005},
            {'ingr_name': 'eggs', 'category': 'Protein', 'cal/g': 1.55, 'protein(g)': 0.125, 'carb(g)': 0.012, 'fat(g)': 0.105},
            {'ingr_name': 'egg whites', 'category': 'Protein', 'cal/g': 0.52, 'protein(g)': 0.11, 'carb(g)': 0.007, 'fat(g)': 0.002},
            {'ingr_name': 'greek yogurt', 'category': 'Protein', 'cal/g': 0.59, 'protein(g)': 0.10, 'carb(g)': 0.036, 'fat(g)': 0.004},
            {'ingr_name': 'cottage cheese', 'category': 'Protein', 'cal/g': 0.98, 'protein(g)': 0.11, 'carb(g)': 0.034, 'fat(g)': 0.043},
            {'ingr_name': 'tofu', 'category': 'Protein', 'cal/g': 0.76, 'protein(g)': 0.08, 'carb(g)': 0.019, 'fat(g)': 0.048},

            # Carbs
            {'ingr_name': 'brown rice', 'category': 'Carb', 'cal/g': 1.11, 'protein(g)': 0.026, 'carb(g)': 0.23, 'fat(g)': 0.009},
            {'ingr_name': 'quinoa', 'category': 'Carb', 'cal/g': 1.20, 'protein(g)': 0.044, 'carb(g)': 0.21, 'fat(g)': 0.019},
            {'ingr_name': 'oats', 'category': 'Carb', 'cal/g': 3.89, 'protein(g)': 0.169, 'carb(g)': 0.66, 'fat(g)': 0.069},
            {'ingr_name': 'whole wheat bread', 'category': 'Carb', 'cal/g': 2.47, 'protein(g)': 0.13, 'carb(g)': 0.42, 'fat(g)': 0.033},
            {'ingr_name': 'sweet potato', 'category': 'Carb', 'cal/g': 0.86, 'protein(g)': 0.016, 'carb(g)': 0.20, 'fat(g)': 0.001},
            {'ingr_name': 'potato', 'category': 'Carb', 'cal/g': 0.77, 'protein(g)': 0.02, 'carb(g)': 0.17, 'fat(g)': 0.001},
            {'ingr_name': 'whole wheat pasta', 'category': 'Carb', 'cal/g': 1.24, 'protein(g)': 0.05, 'carb(g)': 0.25, 'fat(g)': 0.01},
            {'ingr_name': 'lentils', 'category': 'Carb', 'cal/g': 1.16, 'protein(g)': 0.09, 'carb(g)': 0.20, 'fat(g)': 0.004},
            {'ingr_name': 'chickpeas', 'category': 'Carb', 'cal/g': 1.39, 'protein(g)': 0.08, 'carb(g)': 0.23, 'fat(g)': 0.026},
            {'ingr_name': 'black beans', 'category': 'Carb', 'cal/g': 1.32, 'protein(g)': 0.09, 'carb(g)': 0.24, 'fat(g)': 0.005},

             #fruite
            {'ingr_name': 'banana', 'category': 'Carb', 'cal/g': 0.89, 'protein(g)': 0.011, 'carb(g)': 0.23, 'fat(g)': 0.003},
            {'ingr_name': 'apple', 'category': 'Carb', 'cal/g': 0.52, 'protein(g)': 0.003, 'carb(g)': 0.14, 'fat(g)': 0.002},
            {'ingr_name': 'berries', 'category': 'Carb', 'cal/g': 0.57, 'protein(g)': 0.007, 'carb(g)': 0.14, 'fat(g)': 0.003},
            {'ingr_name': 'orange', 'category': 'Carb', 'cal/g': 0.47, 'protein(g)': 0.009, 'carb(g)': 0.12, 'fat(g)': 0.001},


            # Vegetables
            {'ingr_name': 'broccoli', 'category': 'Vegetable', 'cal/g': 0.35, 'protein(g)': 0.024, 'carb(g)': 0.07, 'fat(g)': 0.004},
            {'ingr_name': 'spinach', 'category': 'Vegetable', 'cal/g': 0.23, 'protein(g)': 0.029, 'carb(g)': 0.036, 'fat(g)': 0.004},
            {'ingr_name': 'kale', 'category': 'Vegetable', 'cal/g': 0.49, 'protein(g)': 0.043, 'carb(g)': 0.09, 'fat(g)': 0.007},
            {'ingr_name': 'asparagus', 'category': 'Vegetable', 'cal/g': 0.20, 'protein(g)': 0.022, 'carb(g)': 0.039, 'fat(g)': 0.001},
            {'ingr_name': 'cauliflower', 'category': 'Vegetable', 'cal/g': 0.25, 'protein(g)': 0.019, 'carb(g)': 0.05, 'fat(g)': 0.003},
            {'ingr_name': 'zucchini', 'category': 'Vegetable', 'cal/g': 0.17, 'protein(g)': 0.012, 'carb(g)': 0.031, 'fat(g)': 0.004},
            {'ingr_name': 'bell peppers', 'category': 'Vegetable', 'cal/g': 0.26, 'protein(g)': 0.01, 'carb(g)': 0.06, 'fat(g)': 0.003},
            {'ingr_name': 'tomatoes', 'category': 'Vegetable', 'cal/g': 0.18, 'protein(g)': 0.009, 'carb(g)': 0.039, 'fat(g)': 0.002},
            {'ingr_name': 'cucumber', 'category': 'Vegetable', 'cal/g': 0.15, 'protein(g)': 0.007, 'carb(g)': 0.036, 'fat(g)': 0.001},
            {'ingr_name': 'carrots', 'category': 'Vegetable', 'cal/g': 0.41, 'protein(g)': 0.009, 'carb(g)': 0.10, 'fat(g)': 0.002},

            # Fats
            {'ingr_name': 'avocado', 'category': 'Fat', 'cal/g': 1.60, 'protein(g)': 0.02, 'carb(g)': 0.09, 'fat(g)': 0.15},
            {'ingr_name': 'olive oil', 'category': 'Fat', 'cal/g': 8.84, 'protein(g)': 0.00, 'carb(g)': 0.00, 'fat(g)': 1.00},
            {'ingr_name': 'almonds', 'category': 'Fat', 'cal/g': 5.78, 'protein(g)': 0.21, 'carb(g)': 0.22, 'fat(g)': 0.50},
            {'ingr_name': 'walnuts', 'category': 'Fat', 'cal/g': 6.54, 'protein(g)': 0.15, 'carb(g)': 0.14, 'fat(g)': 0.65},
            

            # drinks
            {'ingr_name': 'water', 'category': 'Drink', 'cal/g': 0.0, 'protein(g)': 0.0, 'carb(g)': 0.0, 'fat(g)': 0.0},
            {'ingr_name': 'green tea', 'category': 'Drink', 'cal/g': 0.01, 'protein(g)': 0.0, 'carb(g)': 0.0, 'fat(g)': 0.0},
 
  ])
        self.protein_foods = self.food_db[self.food_db['category'] == 'Protein']
        self.carb_foods    = self.food_db[self.food_db['category'] == 'Carb']
        self.veg_foods     = self.food_db[self.food_db['category'] == 'Vegetable']
        self.fat_foods     = self.food_db[self.food_db['category'] == 'Fat']

        self.categorize_foods_correctly()

        print(f"✅ Food database loaded with {len(self.food_db)} items")

    def categorize_foods_correctly(self):
        # نفس الكود الأصلي من الـ notebook
        self.food_db['protein_per_100g'] = self.food_db['protein(g)'] * 100
        self.food_db['carb_per_100g'] = self.food_db['carb(g)'] * 100
        self.food_db['fat_per_100g'] = self.food_db['fat(g)'] * 100

        self.food_db['cal_from_protein'] = self.food_db['protein_per_100g'] * 4
        self.food_db['cal_from_carb'] = self.food_db['carb_per_100g'] * 4
        self.food_db['cal_from_fat'] = self.food_db['fat_per_100g'] * 9
        self.food_db['total_calc_cal'] = self.food_db['cal_from_protein'] + self.food_db['cal_from_carb'] + self.food_db['cal_from_fat']
        self.food_db['total_calc_cal'] = self.food_db['total_calc_cal'].replace(0, 1)

        self.food_db['protein_pct'] = (self.food_db['cal_from_protein'] / self.food_db['total_calc_cal'] * 100).round(1)
        self.food_db['carb_pct'] = (self.food_db['cal_from_carb'] / self.food_db['total_calc_cal'] * 100).round(1)
        self.food_db['fat_pct'] = (self.food_db['cal_from_fat'] / self.food_db['total_calc_cal'] * 100).round(1)

        conditions = [
            (self.food_db['protein_pct'] >= 30),
            (self.food_db['carb_pct'] >= 40),
            (self.food_db['fat_pct'] >= 35),
        ]
        choices = ['High_Protein', 'High_Carb', 'High_Fat']
        self.food_db['macro_type'] = np.select(conditions, choices, default='Balanced')

        self.protein_foods = self.food_db[self.food_db['macro_type'] == 'High_Protein']
        self.carb_foods = self.food_db[self.food_db['macro_type'] == 'High_Carb']
        self.fat_foods = self.food_db[self.food_db['macro_type'] == 'High_Fat']
        self.balanced_foods = self.food_db[self.food_db['macro_type'] == 'Balanced']
        self.veg_foods = self.food_db[self.food_db['category'] == 'Vegetable']
                

    def weighted_macros(self, row: Dict):
        """نفس دالة weighted_macros الموجودة في الـ Notebook"""
        macros_dict = {
            "Bariatric": {"Protein":35,"Carb":40,"Fat":25},
            "Gallbladder": {"Protein":25,"Carb":50,"Fat":25},
            "Kidney": {"Protein":16,"Carb":53,"Fat":31},
            "Diabetes": {"Protein":25,"Carb":42,"Fat":33},
            "Hypertension": {"Protein":22,"Carb":53,"Fat":25},
            "Heart_Disease": {"Protein":20,"Carb":50,"Fat":30},
            "PCOS": {"Protein":20,"Carb":45,"Fat":35},
            "Anemia": {"Protein":22,"Carb":50,"Fat":28},
            "Gout": {"Protein":18,"Carb":55,"Fat":27},
            "Football": {"Protein":25,"Carb":55,"Fat":20},
            "Bodybuilding": {"Protein":30,"Carb":45,"Fat":25},
            "Running": {"Protein":22,"Carb":58,"Fat":20},
            "Yoga": {"Protein":20,"Carb":50,"Fat":30},
            "Default": {"Protein":20,"Carb":50,"Fat":30},
        }

        weights_dict = {
            "Bariatric": random.uniform(0.8, 1.0),
            "Gallbladder": random.uniform(0.8, 1.0),
            "Kidney": random.uniform(0.8, 1.0),
            "Diabetes": random.uniform(0.8, 1.0),
            "Hypertension": random.uniform(0.4, 1.0),
            "Heart_Disease": random.uniform(0.4, 1.0),
            "PCOS": random.uniform(0.4, 1.0),
            "Anemia": random.uniform(0.4, 1.0),
            "Gout": random.uniform(0.4, 1.0),
            "Football": random.uniform(0.6, 1.0),
            "Bodybuilding": random.uniform(0.8, 1.0),
            "Running": random.uniform(0.6, 1.0),
            "Yoga": random.uniform(0.6, 1.0),
            "Default": random.uniform(0.3, 1.0)
        }

        active_macros = []
        active_weights = []
        active_conditions = []

        # Surgery Type
        surgery = row.get('surgery_type')
        if surgery == "Bariatric":
            active_macros.append(macros_dict["Bariatric"])
            active_weights.append(weights_dict["Bariatric"])
            active_conditions.append("Bariatric")
        elif surgery == "Gallbladder":
            active_macros.append(macros_dict["Gallbladder"])
            active_weights.append(weights_dict["Gallbladder"])
            active_conditions.append("Gallbladder")

        # Medical Conditions
        medical_map = {
            'diabetes': "Diabetes",
            'hypertension': "Hypertension",
            'kidney_disease': "Kidney",
            'heart_disease': "Heart_Disease",
            'pcos': "PCOS",
            'anemia': "Anemia",
            'gout': "Gout"
        }

        for col, condition in medical_map.items():
            if row.get(col) == 1:
                active_macros.append(macros_dict[condition])
                active_weights.append(weights_dict[condition])
                active_conditions.append(condition)

        # Sport Type
        sport = row.get('sport_type')
        if sport in macros_dict:
            active_macros.append(macros_dict[sport])
            active_weights.append(weights_dict[sport])
            active_conditions.append(sport)

        # Default Case
        if len(active_macros) == 0:
            active_macros.append(macros_dict["Default"])
            active_weights.append(weights_dict["Default"])
            active_conditions.append("Default")

        # Weighted Average
        total_weight = sum(active_weights)
        protein = sum(m["Protein"] * w for m, w in zip(active_macros, active_weights)) / total_weight
        carb = sum(m["Carb"] * w for m, w in zip(active_macros, active_weights)) / total_weight
        fat = sum(m["Fat"] * w for m, w in zip(active_macros, active_weights)) / total_weight

        # Goal Adjustment
        goal = row.get('goal', 'Maintenance')
        if goal == "Fat_Loss":
            protein += 5
            carb -= 5
        elif goal == "Muscle_Gain":
            protein += 5
            carb += 5
            fat -= 5

        # Normalize to 100%
        total = protein + carb + fat
        if total != 100:
            protein = round(protein / total * 100, 1)
            carb = round(carb / total * 100, 1)
            fat = round(fat / total * 100, 1)

        return {'protein': protein, 'carbs': carb, 'fat': fat}

    def predict_macros(self, user_data):
        active_conditions = []
        
        if user_data.get('surgery_type') == "Bariatric":
            active_conditions.append("Bariatric")
        if user_data.get('diabetes') == 1:
            active_conditions.append("Diabetes")
        if user_data.get('hypertension') == 1:
            active_conditions.append("Hypertension")
        if user_data.get('kidney_disease') == 1:
            active_conditions.append("Kidney")
        if user_data.get('heart_disease') == 1:
            active_conditions.append("Heart_Disease")
        if user_data.get('pcos') == 1:
            active_conditions.append("PCOS")
        if user_data.get('anemia') == 1:
            active_conditions.append("Anemia")
        if user_data.get('gout') == 1:
            active_conditions.append("Gout")
        if user_data.get('sport_type') in ["Football", "Bodybuilding", "Running", "Yoga"]:
            active_conditions.append(user_data.get('sport_type'))
        
        if not active_conditions:
            active_conditions = ["Default"]
            
        macros_dict = {
            "Bariatric": {"Protein":35,"Carb":40,"Fat":25},
            "Gallbladder": {"Protein":25,"Carb":50,"Fat":25},
            "Kidney": {"Protein":16,"Carb":53,"Fat":31},
            "Diabetes": {"Protein":25,"Carb":42,"Fat":33},
            "Hypertension": {"Protein":22,"Carb":53,"Fat":25},
            "Heart_Disease": {"Protein":20,"Carb":50,"Fat":30},
            "PCOS": {"Protein":20,"Carb":45,"Fat":35},
            "Anemia": {"Protein":22,"Carb":50,"Fat":28},
            "Gout": {"Protein":18,"Carb":55,"Fat":27},
            "Football": {"Protein":25,"Carb":55,"Fat":20},
            "Bodybuilding": {"Protein":30,"Carb":45,"Fat":25},
            "Running": {"Protein":22,"Carb":58,"Fat":20},
            "Yoga": {"Protein":20,"Carb":50,"Fat":30},
            "Default": {"Protein":20,"Carb":50,"Fat":30},
            }
        protein = sum(macros_dict[cond]["Protein"] for cond in active_conditions) / len(active_conditions)
        carb = sum(macros_dict[cond]["Carb"] for cond in active_conditions) / len(active_conditions)
        fat = sum(macros_dict[cond]["Fat"] for cond in active_conditions) / len(active_conditions)
        
        if user_data.get('goal') == "Fat_Loss":
            protein += 5
            carb -= 5
        elif user_data.get('goal') == "Muscle_Gain":
            protein += 5
            carb += 3
            fat -= 8
        
        total = protein + carb + fat
        protein = round(protein / total * 100, 1)
        carb = round(carb / total * 100, 1)
        fat = round(fat / total * 100, 1)
        
        return {'protein': protein, 'carbs': carb, 'fat': fat}

    def calculate_meal_needs(self, total_calories, macros_percent, num_meals=3):
        """Calculate each meal's requirements"""
        calories_per_meal = total_calories / num_meals

        meal_needs = []
        for i in range(num_meals):
            meal = {
                'calories': calories_per_meal,
                'protein_g': (calories_per_meal * (macros_percent['protein']/100)) / 4,
                'carbs_g': (calories_per_meal * (macros_percent['carbs']/100)) / 4,
                'fat_g': (calories_per_meal * (macros_percent['fat']/100)) / 9
            }
            meal_needs.append(meal)

        meal_distribution = [0.25, 0.40, 0.35] 
        for i, dist in enumerate(meal_distribution[:num_meals]):
            calories_per_meal = total_calories * dist

        return meal_needs
    def recommend_meal_from_db(self, target_protein, target_carbs, target_fat,
                               target_calories, meal_type='main', user_data=None):
        """Compose a meal from the database"""

        meal_foods = []
        current_calories = 0
        current_protein = 0
        current_carbs = 0
        current_fat = 0

        # Select protein source
        if len(self.protein_foods) > 0:
            protein_source = self.protein_foods.sample(1).iloc[0]
            protein_amount = min(150, target_protein * 0.8)
            meal_foods.append({
                'name': protein_source['ingr_name'],
                'amount_g': round(protein_amount, 1),
                'calories': protein_amount * protein_source['cal/g'],
                'protein': protein_amount * protein_source['protein(g)'],
                'carbs': protein_amount * protein_source['carb(g)'],
                'fat': protein_amount * protein_source['fat(g)']
            })

            current_calories += meal_foods[-1]['calories']
            current_protein += meal_foods[-1]['protein']
            current_carbs += meal_foods[-1]['carbs']
            current_fat += meal_foods[-1]['fat']
        else:
            balanced = self.balanced_foods.sample(1).iloc[0]
            meal_foods.append({
                'name': balanced['ingr_name'],
                'amount_g': 150,
                'calories': 150 * balanced['cal/g'],
                'protein': 150 * balanced['protein(g)'],
                'carbs': 150 * balanced['carb(g)'],
                'fat': 150 * balanced['fat(g)']
            })
            current_calories += meal_foods[-1]['calories']
            current_protein += meal_foods[-1]['protein']
            current_carbs += meal_foods[-1]['carbs']
            current_fat += meal_foods[-1]['fat']

        # Select carb source
        if current_carbs < target_carbs * 0.5 and len(self.carb_foods) > 0:
            carb_source = self.carb_foods.sample(1).iloc[0]
            remaining_carbs = target_carbs - current_carbs
            carb_amount = min(100, remaining_carbs * 1.2)
            meal_foods.append({
                'name': carb_source['ingr_name'],
                'amount_g': round(carb_amount, 1),
                'calories': carb_amount * carb_source['cal/g'],
                'protein': carb_amount * carb_source['protein(g)'],
                'carbs': carb_amount * carb_source['carb(g)'],
                'fat': carb_amount * carb_source['fat(g)']
            })

            current_calories += meal_foods[-1]['calories']
            current_protein += meal_foods[-1]['protein']
            current_carbs += meal_foods[-1]['carbs']
            current_fat += meal_foods[-1]['fat']

        # Select vegetables
        if len(self.veg_foods) > 0:
            veg = self.veg_foods.sample(1).iloc[0]
            veg_amount = 100
            meal_foods.append({
                'name': veg['ingr_name'],
                'amount_g': veg_amount,
                'calories': veg_amount * veg['cal/g'],
                'protein': veg_amount * veg['protein(g)'],
                'carbs': veg_amount * veg['carb(g)'],
                'fat': veg_amount * veg['fat(g)']
            })

            current_calories += meal_foods[-1]['calories']
            current_protein += meal_foods[-1]['protein']
            current_carbs += meal_foods[-1]['carbs']
            current_fat += meal_foods[-1]['fat']

        return {
            'foods': meal_foods,
            'totals': {
                'calories': round(current_calories, 1),
                'protein': round(current_protein, 1),
                'carbs': round(current_carbs, 1),
                'fat': round(current_fat, 1)
            },
            'targets': {
                'calories': target_calories,
                'protein': target_protein,
                'carbs': target_carbs,
                'fat': target_fat
            }
        }
    def generate_daily_plan(self, user_data, total_calories):
        """Generate complete daily plan"""
        macros = self.predict_macros(user_data)
        meal_needs = self.calculate_meal_needs(total_calories, macros, num_meals=3)

        plan = {
            'user_info': user_data,
            'daily_macros': macros,
            'meals': []
        }

        meal_types = ['Breakfast', 'Lunch', 'Dinner']
        for i, needs in enumerate(meal_needs):
            meal = self.recommend_meal_from_db(
                needs['protein_g'],
                needs['carbs_g'],
                needs['fat_g'],
                needs['calories'],
                meal_types[i],
                user_data
            )
            plan['meals'].append({
                'name': meal_types[i],
                'foods': meal['foods'],
                'totals': meal['totals']
            })

        return plan

    def generate_weekly_plan(self, user_data, total_calories):
        macros = self.predict_macros(user_data)
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        weekly_plan = {
            'daily_macros': macros,
            'days': []
            }
        for day in days:
            daily_plan = self.generate_daily_plan(user_data, total_calories)
            daily_plan['day'] = day
            weekly_plan['days'].append(daily_plan)
        
        return weekly_plan

    def print_weekly_plan(self, weekly_plan):
        """Print formatted weekly plan"""

        print("\n" + "="*80)
        print("📅 Your Weekly Meal Plan:")
        print("="*80)

        m = weekly_plan['daily_macros']
        print(f"\n📊 Daily macro percentages: Protein {m['protein']:.1f}% | Carbs {m['carbs']:.1f}% | Fat {m['fat']:.1f}%")
        print(f"🔥 Daily calories: {weekly_plan['days'][0]['meals'][0]['totals']['calories']*3:.0f} calories")

        for day_data in weekly_plan['days']:
            print(f"\n{'='*50}")
            print(f"📆 {day_data['day']}:")
            print(f"{'='*50}")

            total_day_calories = 0
            total_day_protein = 0

            for meal in day_data['meals']:
                print(f"\n  🍽️ {meal['name']}:")
                for food in meal['foods']:
                    print(f"      • {food['name']}: {food['amount_g']} grams")
                print(f"      📊 Calories: {meal['totals']['calories']:.0f}")
                print(f"      💪 Protein: {meal['totals']['protein']:.0f}g")

                total_day_calories += meal['totals']['calories']
                total_day_protein += meal['totals']['protein']

            print(f"\n  📊 Daily total: {total_day_calories:.0f} calories | Protein {total_day_protein:.0f}g")

        print("\n" + "="*80)
        print("✅ Healthy and varied week! Different meals every day 🥗")
        print("="*80)

    # باقي الدوال (generate_daily_plan, recommend_meal_from_db, ...) يمكن إضافتها لاحقاً




class ExercisePlanner:
    def __init__(self):
        # Define exercises
        self.exercise_rules = {
            "gym": {
                "bench_press": {"joints": ["elbow_left", "elbow_right"], "up_threshold": 150, "down_threshold": 80, "min_angle": 70, "max_angle": 160},
                "shoulder_press": {"joints": ["elbow_left", "elbow_right"], "up_threshold": 160, "down_threshold": 90, "min_angle": 80, "max_angle": 170},
                "lat_pulldown": {"joints": ["elbow_left", "elbow_right"], "up_threshold": 150, "down_threshold": 60, "min_angle": 45, "max_angle": 160},
                "bicep_curl": {"joints": ["elbow_left", "elbow_right"], "up_threshold": 40, "down_threshold": 150, "min_angle": 30, "max_angle": 160},
                "triceps_pushdown": {"joints": ["elbow_left", "elbow_right"], "up_threshold": 160, "down_threshold": 40, "min_angle": 30, "max_angle": 170},
                "leg_extension": {"joints": ["knee_left", "knee_right"], "up_threshold": 160, "down_threshold": 100, "min_angle": 90, "max_angle": 175}
            },
            "rehab": {
                "arm_abduction": {"joints": ["shoulder_abduction_left", "shoulder_abduction_right"], "up_threshold": 80, "down_threshold": 20, "min_angle": 15, "max_angle": 95},
                "shoulder_flexion": {"joints": ["shoulder_flexion_left", "shoulder_flexion_right"], "up_threshold": 90, "down_threshold": 10, "min_angle": 0, "max_angle": 180},
                "arm_vw": {"joints": ["elbow_left", "elbow_right"], "up_threshold": 120, "down_threshold": 60, "min_angle": 45, "max_angle": 135},
                "pushups": {"joints": ["elbow_left", "elbow_right"], "up_threshold": 160, "down_threshold": 80, "min_angle": 70, "max_angle": 170},
                "leg_abduction": {"joints": ["hip_left", "hip_right"], "up_threshold": 40, "down_threshold": 10, "min_angle": 0, "max_angle": 45},
                "squats": {"joints": ["knee_left", "knee_right"], "up_threshold": 160, "down_threshold": 80, "min_angle": 70, "max_angle": 170},
                "leg_lunge": {"joints": ["knee_left", "knee_right"], "up_threshold": 160, "down_threshold": 95, "min_angle": 85, "max_angle": 170}
            },
            "fitness": {
                "bodyweight_squats": {"joints": ["knee_left", "knee_right"], "up_threshold": 120, "down_threshold": 60, "min_angle": 40, "max_angle": 130},
                "jumping_jacks": {"joints": ["shoulder_abduction_left", "shoulder_abduction_right"], "up_threshold": 140, "down_threshold": 30, "min_angle": 20, "max_angle": 150},
                "lunge": {"joints": ["knee_left", "knee_right"], "up_threshold": 160, "down_threshold": 95, "min_angle": 85, "max_angle": 170},
                "leg_swing": {"joints": ["hip_left", "hip_right"], "up_threshold": 80, "down_threshold": 10, "min_angle": 0, "max_angle": 90},
                "butt_kicks": {"joints": ["knee_left", "knee_right"], "up_threshold": 60, "down_threshold": 150, "min_angle": 45, "max_angle": 160},
                "high_knee": {"joints": ["hip_left", "hip_right"], "up_threshold": 80, "down_threshold": 160, "min_angle": 70, "max_angle": 170},
                "arm_circles": {
                    "joints": ["shoulder_left", "shoulder_right"],
                    "up_threshold": 90,
                    "down_threshold": 180,
                    "min_angle": 30,
                    "max_angle": 180,
                    "special_function": "arm_circle"
                },
                "arm_half_circles": {
                    "joints": ["shoulder_left", "shoulder_right"],
                    "up_threshold": 80,
                    "down_threshold": 120,
                    "min_angle": 30,
                    "max_angle": 120,
                    "special_function": "arm_circle"
                }
            }
        }

        # Classify exercises
        self.exercise_categories = self.categorize_exercises()

    def categorize_exercises(self):
        """Classify exercises by type and target muscles"""
        categories = {
            'Upper_Body': [],
            'Lower_Body': [],
            'Core': [],
            'Cardio': [],
            'Full_Body': []
        }

        for category, exercises in self.exercise_rules.items():
            for ex_name, ex_data in exercises.items():
                # Determine exercise type based on joints
                joints = ex_data['joints']
                if any('knee' in j or 'hip' in j for j in joints):
                    if any('shoulder' in j or 'elbow' in j for j in joints):
                        categories['Full_Body'].append({
                            'name': ex_name,
                            'category': category,
                            'rules': ex_data
                        })
                    else:
                        categories['Lower_Body'].append({
                            'name': ex_name,
                            'category': category,
                            'rules': ex_data
                        })
                elif any('shoulder' in j or 'elbow' in j for j in joints):
                    categories['Upper_Body'].append({
                        'name': ex_name,
                        'category': category,
                        'rules': ex_data
                    })
                else:
                    categories['Cardio'].append({
                        'name': ex_name,
                        'category': category,
                        'rules': ex_data
                    })

        return categories

    def select_exercises_by_goal(self, goal: str, available_days: int = 4, injuries: Dict = None) -> Dict:
        """Select appropriate exercises based on goal considering injuries"""

        exercise_plan = {
            'weekly_schedule': [],
            'exercise_details': {},
            'total_weekly_volume': 0,
            'tips': []
        }

        # Determine exercise distribution based on goal
        if goal == 'Muscle_Gain':
            distribution = {
                'Upper_Body': 0.4,
                'Lower_Body': 0.3,
                'Full_Body': 0.2,
                'Core': 0.1
            }
            sets_per_exercise = 4
            reps_range = "8-12"
            rest_time = "90 sec"
            exercise_plan['tips'] = [
                'Focus on gradually increasing weights',
                'Take adequate rest between sets',
                'Eat enough protein within 2 hours of workout'
            ]

        elif goal == 'Fat_Loss':
            distribution = {
                'Cardio': 0.4,
                'Full_Body': 0.3,
                'Upper_Body': 0.15,
                'Lower_Body': 0.15
            }
            sets_per_exercise = 3
            reps_range = "15-20"
            rest_time = "45 sec"
            exercise_plan['tips'] = [
                'Maintain high heart rate',
                'Reduce rest periods between exercises',
                'Drink enough water before and during workout'
            ]

        else:  # Maintenance
            distribution = {
                'Full_Body': 0.3,
                'Upper_Body': 0.25,
                'Lower_Body': 0.25,
                'Core': 0.1,
                'Cardio': 0.1
            }
            sets_per_exercise = 3
            reps_range = "12-15"
            rest_time = "60 sec"
            exercise_plan['tips'] = [
                'Mix between strength and cardio exercises',
                'Listen to your body and rest when needed',
                'Maintain consistent performance'
            ]

        # Add injury tips
        if injuries:
            if injuries.get('back_pain', 0) == 1:
                exercise_plan['tips'].append('Avoid exercises that strain the back')
                # Reduce Lower_Body exercises
                distribution['Lower_Body'] = distribution.get('Lower_Body', 0) * 0.5
                distribution['Upper_Body'] = distribution.get('Upper_Body', 0) + 0.1
            if injuries.get('ankle_injury', 0) == 1:
                exercise_plan['tips'].append('Use low-impact exercises for ankles')
                # Reduce high-impact cardio
                distribution['Cardio'] = distribution.get('Cardio', 0) * 0.7

        # Select exercises for each day
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

        selected_days = random.sample(days, min(available_days, len(days)))
        selected_days.sort(key=lambda x: days.index(x))

        for day in selected_days:
            day_exercises = []

            # Select 4-6 exercises per day
            num_exercises = min(random.randint(4, 6), available_days * 2)

            for _ in range(num_exercises):
                # Select exercise type based on distribution
                exercise_type = random.choices(
                    list(distribution.keys()),
                    weights=list(distribution.values())
                )[0]

                # Select specific exercise from category
                if self.exercise_categories[exercise_type]:
                    exercise = random.choice(self.exercise_categories[exercise_type])

                    # Avoid repeating the same exercise on the same day
                    if any(ex['name'] == exercise['name'] for ex in day_exercises):
                        continue

                    # Add exercise details
                    exercise_detail = {
                        'name': exercise['name'].replace('_', ' ').title(),
                        'type': exercise_type,
                        'category': exercise['category'],
                        'sets': sets_per_exercise,
                        'reps': reps_range,
                        'rest': rest_time,
                        'joints': exercise['rules']['joints']
                    }

                    day_exercises.append(exercise_detail)

                    # Store complete details
                    if exercise['name'] not in exercise_plan['exercise_details']:
                        exercise_plan['exercise_details'][exercise['name']] = {
                            'rules': exercise['rules'],
                            'total_volume_sets': 0
                        }
                    exercise_plan['exercise_details'][exercise['name']]['total_volume_sets'] += sets_per_exercise

            exercise_plan['weekly_schedule'].append({
                'day': day,
                'exercises': day_exercises[:min(6, len(day_exercises))],  # Maximum 6 exercises
                'total_exercises': min(6, len(day_exercises))
            })

        # Calculate total volume
        exercise_plan['total_weekly_volume'] = sum(
            len(day['exercises']) for day in exercise_plan['weekly_schedule']
        )

        return exercise_plan

    def print_workout_plan(self, plan: Dict):
        """Print formatted workout plan"""
        print("\n" + "="*70)
        print("💪 Weekly Workout Plan:")
        print("="*70)

        for workout in plan['weekly_schedule']:
            print(f"\n📅 {workout['day']}:")
            print("-" * 40)
            for ex in workout['exercises']:
                print(f"  • {ex['name']}")
                print(f"    {ex['sets']} sets × {ex['reps']} (rest {ex['rest']})")
                print(f"    Joints: {', '.join(set([j.replace('_', ' ').title() for j in ex['joints']]))}")

        print("\n💡 Exercise Tips:")
        for tip in plan['tips']:
            print(f"  • {tip}")




























# # app/services/advanced_nutrition_system.py
# import pandas as pd
# import numpy as np
# import joblib
# import math
# import random
# import tensorflow as tf
# from pathlib import Path
# from typing import Dict, List

# BASE_DIR = Path(__file__).resolve().parent.parent
# ML_DIR = BASE_DIR / "infrastructure" / "ml_models"


# class AdvancedNutritionSystem:
#     def __init__(self):
#         self.model = None
#         self.scaler = None
#         self.feature_columns = None

#         # تحميل Neural Network Model (نفس ما في الـ Notebook)
#         try:
#             self.model = tf.keras.models.load_model(ML_DIR / "nutrition_model.h5", compile=False)
#             print("✅ Neural Network Model loaded successfully (from Notebook)")
#         except Exception as e:
#             print(f"⚠️ Neural Network loading failed: {e}")
#             print("→ Using rule-based weighted macros as fallback")

#         # تحميل Scaler و Feature Columns
#         try:
#             self.scaler = joblib.load(ML_DIR / "scaler.pkl")
#             self.feature_columns = joblib.load(ML_DIR / "feature_columns.pkl")
#         except:
#             print("⚠️ Scaler or feature columns not found")

#         self.create_healthy_food_database()

#     # ====================== MACRO CALCULATION (مطابق للـ Notebook) ======================
#     def weighted_macros(self, row: Dict):
#         """نفس دالة weighted_macros الموجودة في الـ Notebook"""
#         macros_dict = {
#             "Bariatric": {"Protein":35,"Carb":40,"Fat":25},
#             "Gallbladder": {"Protein":25,"Carb":50,"Fat":25},
#             "Kidney": {"Protein":16,"Carb":53,"Fat":31},
#             "Diabetes": {"Protein":25,"Carb":42,"Fat":33},
#             "Hypertension": {"Protein":22,"Carb":53,"Fat":25},
#             "Heart_Disease": {"Protein":20,"Carb":50,"Fat":30},
#             "PCOS": {"Protein":20,"Carb":45,"Fat":35},
#             "Anemia": {"Protein":22,"Carb":50,"Fat":28},
#             "Gout": {"Protein":18,"Carb":55,"Fat":27},
#             "Football": {"Protein":25,"Carb":55,"Fat":20},
#             "Bodybuilding": {"Protein":30,"Carb":45,"Fat":25},
#             "Running": {"Protein":22,"Carb":58,"Fat":20},
#             "Yoga": {"Protein":20,"Carb":50,"Fat":30},
#             "Default": {"Protein":20,"Carb":50,"Fat":30},
#         }

#         weights_dict = {
#             "Bariatric": random.uniform(0.8, 1.0),
#             "Gallbladder": random.uniform(0.8, 1.0),
#             "Kidney": random.uniform(0.8, 1.0),
#             "Diabetes": random.uniform(0.8, 1.0),
#             "Hypertension": random.uniform(0.4, 1.0),
#             "Heart_Disease": random.uniform(0.4, 1.0),
#             "PCOS": random.uniform(0.4, 1.0),
#             "Anemia": random.uniform(0.4, 1.0),
#             "Gout": random.uniform(0.4, 1.0),
#             "Football": random.uniform(0.6, 1.0),
#             "Bodybuilding": random.uniform(0.8, 1.0),
#             "Running": random.uniform(0.6, 1.0),
#             "Yoga": random.uniform(0.6, 1.0),
#             "Default": random.uniform(0.3, 1.0)
#         }

#         active_macros = []
#         active_weights = []
#         active_conditions = []

#         # Surgery Type
#         surgery = row.get('surgery_type')
#         if surgery == "Bariatric":
#             active_macros.append(macros_dict["Bariatric"])
#             active_weights.append(weights_dict["Bariatric"])
#             active_conditions.append("Bariatric")
#         elif surgery == "Gallbladder":
#             active_macros.append(macros_dict["Gallbladder"])
#             active_weights.append(weights_dict["Gallbladder"])
#             active_conditions.append("Gallbladder")

#         # Medical Conditions
#         medical_map = {
#             'diabetes': "Diabetes",
#             'hypertension': "Hypertension",
#             'kidney_disease': "Kidney",
#             'heart_disease': "Heart_Disease",
#             'pcos': "PCOS",
#             'anemia': "Anemia",
#             'gout': "Gout"
#         }

#         for col, condition in medical_map.items():
#             if row.get(col) == 1:
#                 active_macros.append(macros_dict[condition])
#                 active_weights.append(weights_dict[condition])
#                 active_conditions.append(condition)

#         # Sport Type
#         sport = row.get('sport_type')
#         if sport in macros_dict:
#             active_macros.append(macros_dict[sport])
#             active_weights.append(weights_dict[sport])
#             active_conditions.append(sport)

#         # Default Case
#         if len(active_macros) == 0:
#             active_macros.append(macros_dict["Default"])
#             active_weights.append(weights_dict["Default"])
#             active_conditions.append("Default")

#         # Weighted Average
#         total_weight = sum(active_weights)
#         protein = sum(m["Protein"] * w for m, w in zip(active_macros, active_weights)) / total_weight
#         carb = sum(m["Carb"] * w for m, w in zip(active_macros, active_weights)) / total_weight
#         fat = sum(m["Fat"] * w for m, w in zip(active_macros, active_weights)) / total_weight

#         # Goal Adjustment
#         goal = row.get('goal', 'Maintenance')
#         if goal == "Fat_Loss":
#             protein += 5
#             carb -= 5
#         elif goal == "Muscle_Gain":
#             protein += 5
#             carb += 5
#             fat -= 5

#         # Normalize to 100%
#         total = protein + carb + fat
#         if total != 100:
#             protein = round(protein / total * 100, 1)
#             carb = round(carb / total * 100, 1)
#             fat = round(fat / total * 100, 1)

#         return {'protein': protein, 'carbs': carb, 'fat': fat}

#     def predict_macros(self, user_data: Dict):
#         """الدالة العامة المستخدمة من باقي النظام"""
#         return self.weighted_macros(user_data)

#     # ====================== FOOD DATABASE ======================
#     def create_healthy_food_database(self):
#         """قاعدة بيانات أكلات غنية (محدثة)"""
#         self.food_db = pd.DataFrame([
#             # Protein
#             {'ingr_name': 'chicken breast', 'category': 'Protein', 'cal/g': 1.65, 'protein(g)': 0.31, 'carb(g)': 0.00, 'fat(g)': 0.036},
#             {'ingr_name': 'grilled chicken', 'category': 'Protein', 'cal/g': 1.65, 'protein(g)': 0.31, 'carb(g)': 0.00, 'fat(g)': 0.036},
#             {'ingr_name': 'turkey breast', 'category': 'Protein', 'cal/g': 1.35, 'protein(g)': 0.30, 'carb(g)': 0.00, 'fat(g)': 0.02},
#             {'ingr_name': 'lean beef', 'category': 'Protein', 'cal/g': 2.0, 'protein(g)': 0.26, 'carb(g)': 0.00, 'fat(g)': 0.10},
#             {'ingr_name': 'salmon', 'category': 'Protein', 'cal/g': 2.08, 'protein(g)': 0.20, 'carb(g)': 0.00, 'fat(g)': 0.13},
#             {'ingr_name': 'tuna', 'category': 'Protein', 'cal/g': 1.3, 'protein(g)': 0.29, 'carb(g)': 0.00, 'fat(g)': 0.01},
#             {'ingr_name': 'tilapia', 'category': 'Protein', 'cal/g': 1.28, 'protein(g)': 0.26, 'carb(g)': 0.00, 'fat(g)': 0.027},
#             {'ingr_name': 'cod', 'category': 'Protein', 'cal/g': 0.85, 'protein(g)': 0.19, 'carb(g)': 0.00, 'fat(g)': 0.005},
#             {'ingr_name': 'eggs', 'category': 'Protein', 'cal/g': 1.55, 'protein(g)': 0.125, 'carb(g)': 0.012, 'fat(g)': 0.105},
#             {'ingr_name': 'egg whites', 'category': 'Protein', 'cal/g': 0.52, 'protein(g)': 0.11, 'carb(g)': 0.007, 'fat(g)': 0.002},
#             {'ingr_name': 'greek yogurt', 'category': 'Protein', 'cal/g': 0.59, 'protein(g)': 0.10, 'carb(g)': 0.036, 'fat(g)': 0.004},
#             {'ingr_name': 'cottage cheese', 'category': 'Protein', 'cal/g': 0.98, 'protein(g)': 0.11, 'carb(g)': 0.034, 'fat(g)': 0.043},
#             {'ingr_name': 'tofu', 'category': 'Protein', 'cal/g': 0.76, 'protein(g)': 0.08, 'carb(g)': 0.019, 'fat(g)': 0.048},

#             # Carbs
#             {'ingr_name': 'brown rice', 'category': 'Carb', 'cal/g': 1.11, 'protein(g)': 0.026, 'carb(g)': 0.23, 'fat(g)': 0.009},
#             {'ingr_name': 'quinoa', 'category': 'Carb', 'cal/g': 1.20, 'protein(g)': 0.044, 'carb(g)': 0.21, 'fat(g)': 0.019},
#             {'ingr_name': 'oats', 'category': 'Carb', 'cal/g': 3.89, 'protein(g)': 0.169, 'carb(g)': 0.66, 'fat(g)': 0.069},
#             {'ingr_name': 'whole wheat bread', 'category': 'Carb', 'cal/g': 2.47, 'protein(g)': 0.13, 'carb(g)': 0.42, 'fat(g)': 0.033},
#             {'ingr_name': 'sweet potato', 'category': 'Carb', 'cal/g': 0.86, 'protein(g)': 0.016, 'carb(g)': 0.20, 'fat(g)': 0.001},
#             {'ingr_name': 'potato', 'category': 'Carb', 'cal/g': 0.77, 'protein(g)': 0.02, 'carb(g)': 0.17, 'fat(g)': 0.001},
#             {'ingr_name': 'whole wheat pasta', 'category': 'Carb', 'cal/g': 1.24, 'protein(g)': 0.05, 'carb(g)': 0.25, 'fat(g)': 0.01},
#             {'ingr_name': 'lentils', 'category': 'Carb', 'cal/g': 1.16, 'protein(g)': 0.09, 'carb(g)': 0.20, 'fat(g)': 0.004},
#             {'ingr_name': 'chickpeas', 'category': 'Carb', 'cal/g': 1.39, 'protein(g)': 0.08, 'carb(g)': 0.23, 'fat(g)': 0.026},
#             {'ingr_name': 'black beans', 'category': 'Carb', 'cal/g': 1.32, 'protein(g)': 0.09, 'carb(g)': 0.24, 'fat(g)': 0.005},

#              #fruite
#             {'ingr_name': 'banana', 'category': 'Carb', 'cal/g': 0.89, 'protein(g)': 0.011, 'carb(g)': 0.23, 'fat(g)': 0.003},
#             {'ingr_name': 'apple', 'category': 'Carb', 'cal/g': 0.52, 'protein(g)': 0.003, 'carb(g)': 0.14, 'fat(g)': 0.002},
#             {'ingr_name': 'berries', 'category': 'Carb', 'cal/g': 0.57, 'protein(g)': 0.007, 'carb(g)': 0.14, 'fat(g)': 0.003},
#             {'ingr_name': 'orange', 'category': 'Carb', 'cal/g': 0.47, 'protein(g)': 0.009, 'carb(g)': 0.12, 'fat(g)': 0.001},


#             # Vegetables
#             {'ingr_name': 'broccoli', 'category': 'Vegetable', 'cal/g': 0.35, 'protein(g)': 0.024, 'carb(g)': 0.07, 'fat(g)': 0.004},
#             {'ingr_name': 'spinach', 'category': 'Vegetable', 'cal/g': 0.23, 'protein(g)': 0.029, 'carb(g)': 0.036, 'fat(g)': 0.004},
#             {'ingr_name': 'kale', 'category': 'Vegetable', 'cal/g': 0.49, 'protein(g)': 0.043, 'carb(g)': 0.09, 'fat(g)': 0.007},
#             {'ingr_name': 'asparagus', 'category': 'Vegetable', 'cal/g': 0.20, 'protein(g)': 0.022, 'carb(g)': 0.039, 'fat(g)': 0.001},
#             {'ingr_name': 'cauliflower', 'category': 'Vegetable', 'cal/g': 0.25, 'protein(g)': 0.019, 'carb(g)': 0.05, 'fat(g)': 0.003},
#             {'ingr_name': 'zucchini', 'category': 'Vegetable', 'cal/g': 0.17, 'protein(g)': 0.012, 'carb(g)': 0.031, 'fat(g)': 0.004},
#             {'ingr_name': 'bell peppers', 'category': 'Vegetable', 'cal/g': 0.26, 'protein(g)': 0.01, 'carb(g)': 0.06, 'fat(g)': 0.003},
#             {'ingr_name': 'tomatoes', 'category': 'Vegetable', 'cal/g': 0.18, 'protein(g)': 0.009, 'carb(g)': 0.039, 'fat(g)': 0.002},
#             {'ingr_name': 'cucumber', 'category': 'Vegetable', 'cal/g': 0.15, 'protein(g)': 0.007, 'carb(g)': 0.036, 'fat(g)': 0.001},
#             {'ingr_name': 'carrots', 'category': 'Vegetable', 'cal/g': 0.41, 'protein(g)': 0.009, 'carb(g)': 0.10, 'fat(g)': 0.002},

#             # Fats
#             {'ingr_name': 'avocado', 'category': 'Fat', 'cal/g': 1.60, 'protein(g)': 0.02, 'carb(g)': 0.09, 'fat(g)': 0.15},
#             {'ingr_name': 'olive oil', 'category': 'Fat', 'cal/g': 8.84, 'protein(g)': 0.00, 'carb(g)': 0.00, 'fat(g)': 1.00},
#             {'ingr_name': 'almonds', 'category': 'Fat', 'cal/g': 5.78, 'protein(g)': 0.21, 'carb(g)': 0.22, 'fat(g)': 0.50},
#             {'ingr_name': 'walnuts', 'category': 'Fat', 'cal/g': 6.54, 'protein(g)': 0.15, 'carb(g)': 0.14, 'fat(g)': 0.65},
            

#             # drinks
#             {'ingr_name': 'water', 'category': 'Drink', 'cal/g': 0.0, 'protein(g)': 0.0, 'carb(g)': 0.0, 'fat(g)': 0.0},
#             {'ingr_name': 'green tea', 'category': 'Drink', 'cal/g': 0.01, 'protein(g)': 0.0, 'carb(g)': 0.0, 'fat(g)': 0.0},
 
#             ])

#         self.categorize_foods_correctly()
#         print(f"✅ Food database loaded with {len(self.food_db)} items")

#     def categorize_foods_correctly(self):
#         """تصنيف الأكلات (من الـ Notebook)"""
#         self.food_db['protein_per_100g'] = self.food_db['protein(g)'] * 100
#         self.food_db['carb_per_100g'] = self.food_db['carb(g)'] * 100
#         self.food_db['fat_per_100g'] = self.food_db['fat(g)'] * 100

#         self.food_db['cal_from_protein'] = self.food_db['protein_per_100g'] * 4
#         self.food_db['cal_from_carb'] = self.food_db['carb_per_100g'] * 4
#         self.food_db['cal_from_fat'] = self.food_db['fat_per_100g'] * 9
#         self.food_db['total_calc_cal'] = self.food_db[['cal_from_protein', 'cal_from_carb', 'cal_from_fat']].sum(axis=1)
#         self.food_db['total_calc_cal'] = self.food_db['total_calc_cal'].replace(0, 1)

#         self.food_db['protein_pct'] = (self.food_db['cal_from_protein'] / self.food_db['total_calc_cal'] * 100).round(1)
#         self.food_db['carb_pct'] = (self.food_db['cal_from_carb'] / self.food_db['total_calc_cal'] * 100).round(1)
#         self.food_db['fat_pct'] = (self.food_db['cal_from_fat'] / self.food_db['total_calc_cal'] * 100).round(1)

#         conditions = [
#             (self.food_db['protein_pct'] >= 30),
#             (self.food_db['carb_pct'] >= 40),
#             (self.food_db['fat_pct'] >= 35),
#         ]
#         choices = ['High_Protein', 'High_Carb', 'High_Fat']
#         self.food_db['macro_type'] = np.select(conditions, choices, default='Balanced')

#         self.protein_foods = self.food_db[self.food_db['macro_type'] == 'High_Protein']
#         self.carb_foods = self.food_db[self.food_db['macro_type'] == 'High_Carb']
#         self.fat_foods = self.food_db[self.food_db['macro_type'] == 'High_Fat']
#         self.veg_foods = self.food_db[self.food_db['category'] == 'Vegetable']

#     # ====================== PLAN GENERATION ======================
#     def generate_daily_plan(self, user_data: Dict, total_calories: int):
#         macros = self.predict_macros(user_data)
#         meal_needs = self.calculate_meal_needs(total_calories, macros, num_meals=3)

#         plan = {
#             'user_info': user_data,
#             'daily_macros': macros,
#             'meals': []
#         }

#         meal_types = ['Breakfast', 'Lunch', 'Dinner']
#         for i, needs in enumerate(meal_needs):
#             meal = self.recommend_meal_from_db(
#                 needs['protein_g'],
#                 needs['carbs_g'],
#                 needs['fat_g'],
#                 needs['calories'],
#                 meal_types[i],
#                 user_data
#             )
#             plan['meals'].append({
#                 'name': meal_types[i],
#                 'foods': meal['foods'],
#                 'totals': meal['totals']
#             })

#         return {
#             'daily_macros': macros,
#             'total_calories': total_calories,
#             'meals': []  # ستكملينها حسب احتياجك
#         }

#     def generate_weekly_plan(self, user_data: Dict, total_calories: int):
#         """توليد خطة أسبوعية (7 أيام)"""
#         days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
#         weekly_plan = {
#             'daily_macros': self.predict_macros(user_data),
#             'days': []
#         }

#         for day in days:
#             daily = self.generate_daily_plan(user_data, total_calories)
#             daily['day'] = day
#             weekly_plan['days'].append(daily)

#         return weekly_plan


# # ====================== Exercise Planner (متروك كما هو) ======================
# class ExercisePlanner:
#     def __init__(self):
#         # Define exercises
#         self.exercise_rules = {
#             "gym": {
#                 "bench_press": {"joints": ["elbow_left", "elbow_right"], "up_threshold": 150, "down_threshold": 80, "min_angle": 70, "max_angle": 160},
#                 "shoulder_press": {"joints": ["elbow_left", "elbow_right"], "up_threshold": 160, "down_threshold": 90, "min_angle": 80, "max_angle": 170},
#                 "lat_pulldown": {"joints": ["elbow_left", "elbow_right"], "up_threshold": 150, "down_threshold": 60, "min_angle": 45, "max_angle": 160},
#                 "bicep_curl": {"joints": ["elbow_left", "elbow_right"], "up_threshold": 40, "down_threshold": 150, "min_angle": 30, "max_angle": 160},
#                 "triceps_pushdown": {"joints": ["elbow_left", "elbow_right"], "up_threshold": 160, "down_threshold": 40, "min_angle": 30, "max_angle": 170},
#                 "leg_extension": {"joints": ["knee_left", "knee_right"], "up_threshold": 160, "down_threshold": 100, "min_angle": 90, "max_angle": 175}
#             },
#             "rehab": {
#                 "arm_abduction": {"joints": ["shoulder_abduction_left", "shoulder_abduction_right"], "up_threshold": 80, "down_threshold": 20, "min_angle": 15, "max_angle": 95},
#                 "shoulder_flexion": {"joints": ["shoulder_flexion_left", "shoulder_flexion_right"], "up_threshold": 90, "down_threshold": 10, "min_angle": 0, "max_angle": 180},
#                 "arm_vw": {"joints": ["elbow_left", "elbow_right"], "up_threshold": 120, "down_threshold": 60, "min_angle": 45, "max_angle": 135},
#                 "pushups": {"joints": ["elbow_left", "elbow_right"], "up_threshold": 160, "down_threshold": 80, "min_angle": 70, "max_angle": 170},
#                 "leg_abduction": {"joints": ["hip_left", "hip_right"], "up_threshold": 40, "down_threshold": 10, "min_angle": 0, "max_angle": 45},
#                 "squats": {"joints": ["knee_left", "knee_right"], "up_threshold": 160, "down_threshold": 80, "min_angle": 70, "max_angle": 170},
#                 "leg_lunge": {"joints": ["knee_left", "knee_right"], "up_threshold": 160, "down_threshold": 95, "min_angle": 85, "max_angle": 170}
#             },
#             "fitness": {
#                 "bodyweight_squats": {"joints": ["knee_left", "knee_right"], "up_threshold": 120, "down_threshold": 60, "min_angle": 40, "max_angle": 130},
#                 "jumping_jacks": {"joints": ["shoulder_abduction_left", "shoulder_abduction_right"], "up_threshold": 140, "down_threshold": 30, "min_angle": 20, "max_angle": 150},
#                 "lunge": {"joints": ["knee_left", "knee_right"], "up_threshold": 160, "down_threshold": 95, "min_angle": 85, "max_angle": 170},
#                 "leg_swing": {"joints": ["hip_left", "hip_right"], "up_threshold": 80, "down_threshold": 10, "min_angle": 0, "max_angle": 90},
#                 "butt_kicks": {"joints": ["knee_left", "knee_right"], "up_threshold": 60, "down_threshold": 150, "min_angle": 45, "max_angle": 160},
#                 "high_knee": {"joints": ["hip_left", "hip_right"], "up_threshold": 80, "down_threshold": 160, "min_angle": 70, "max_angle": 170},
#                 "arm_circles": {
#                     "joints": ["shoulder_left", "shoulder_right"],
#                     "up_threshold": 90,
#                     "down_threshold": 180,
#                     "min_angle": 30,
#                     "max_angle": 180,
#                     "special_function": "arm_circle"
#                 },
#                 "arm_half_circles": {
#                     "joints": ["shoulder_left", "shoulder_right"],
#                     "up_threshold": 80,
#                     "down_threshold": 120,
#                     "min_angle": 30,
#                     "max_angle": 120,
#                     "special_function": "arm_circle"
#                 }
#             }
#         }

#         # Classify exercises
#         self.exercise_categories = self.categorize_exercises()

#     def categorize_exercises(self):
#         """Classify exercises by type and target muscles"""
#         categories = {
#             'Upper_Body': [],
#             'Lower_Body': [],
#             'Core': [],
#             'Cardio': [],
#             'Full_Body': []
#         }

#         for category, exercises in self.exercise_rules.items():
#             for ex_name, ex_data in exercises.items():
#                 # Determine exercise type based on joints
#                 joints = ex_data['joints']
#                 if any('knee' in j or 'hip' in j for j in joints):
#                     if any('shoulder' in j or 'elbow' in j for j in joints):
#                         categories['Full_Body'].append({
#                             'name': ex_name,
#                             'category': category,
#                             'rules': ex_data
#                         })
#                     else:
#                         categories['Lower_Body'].append({
#                             'name': ex_name,
#                             'category': category,
#                             'rules': ex_data
#                         })
#                 elif any('shoulder' in j or 'elbow' in j for j in joints):
#                     categories['Upper_Body'].append({
#                         'name': ex_name,
#                         'category': category,
#                         'rules': ex_data
#                     })
#                 else:
#                     categories['Cardio'].append({
#                         'name': ex_name,
#                         'category': category,
#                         'rules': ex_data
#                     })

#         return categories

#     def select_exercises_by_goal(self, goal: str, available_days: int = 4, injuries: Dict = None) -> Dict:
#         """Select appropriate exercises based on goal considering injuries"""

#         exercise_plan = {
#             'weekly_schedule': [],
#             'exercise_details': {},
#             'total_weekly_volume': 0,
#             'tips': []
#         }

#         # Determine exercise distribution based on goal
#         if goal == 'Muscle_Gain':
#             distribution = {
#                 'Upper_Body': 0.4,
#                 'Lower_Body': 0.3,
#                 'Full_Body': 0.2,
#                 'Core': 0.1
#             }
#             sets_per_exercise = 4
#             reps_range = "8-12"
#             rest_time = "90 sec"
#             exercise_plan['tips'] = [
#                 'Focus on gradually increasing weights',
#                 'Take adequate rest between sets',
#                 'Eat enough protein within 2 hours of workout'
#             ]

#         elif goal == 'Fat_Loss':
#             distribution = {
#                 'Cardio': 0.4,
#                 'Full_Body': 0.3,
#                 'Upper_Body': 0.15,
#                 'Lower_Body': 0.15
#             }
#             sets_per_exercise = 3
#             reps_range = "15-20"
#             rest_time = "45 sec"
#             exercise_plan['tips'] = [
#                 'Maintain high heart rate',
#                 'Reduce rest periods between exercises',
#                 'Drink enough water before and during workout'
#             ]

#         else:  # Maintenance
#             distribution = {
#                 'Full_Body': 0.3,
#                 'Upper_Body': 0.25,
#                 'Lower_Body': 0.25,
#                 'Core': 0.1,
#                 'Cardio': 0.1
#             }
#             sets_per_exercise = 3
#             reps_range = "12-15"
#             rest_time = "60 sec"
#             exercise_plan['tips'] = [
#                 'Mix between strength and cardio exercises',
#                 'Listen to your body and rest when needed',
#                 'Maintain consistent performance'
#             ]

#         # Add injury tips
#         if injuries:
#             if injuries.get('back_pain', 0) == 1:
#                 exercise_plan['tips'].append('Avoid exercises that strain the back')
#                 # Reduce Lower_Body exercises
#                 distribution['Lower_Body'] = distribution.get('Lower_Body', 0) * 0.5
#                 distribution['Upper_Body'] = distribution.get('Upper_Body', 0) + 0.1
#             if injuries.get('ankle_injury', 0) == 1:
#                 exercise_plan['tips'].append('Use low-impact exercises for ankles')
#                 # Reduce high-impact cardio
#                 distribution['Cardio'] = distribution.get('Cardio', 0) * 0.7

#         # Select exercises for each day
#         days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

#         selected_days = random.sample(days, min(available_days, len(days)))
#         selected_days.sort(key=lambda x: days.index(x))

#         for day in selected_days:
#             day_exercises = []

#             # Select 4-6 exercises per day
#             num_exercises = min(random.randint(4, 6), available_days * 2)

#             for _ in range(num_exercises):
#                 # Select exercise type based on distribution
#                 exercise_type = random.choices(
#                     list(distribution.keys()),
#                     weights=list(distribution.values())
#                 )[0]

#                 # Select specific exercise from category
#                 if self.exercise_categories[exercise_type]:
#                     exercise = random.choice(self.exercise_categories[exercise_type])

#                     # Avoid repeating the same exercise on the same day
#                     if any(ex['name'] == exercise['name'] for ex in day_exercises):
#                         continue

#                     # Add exercise details
#                     exercise_detail = {
#                         'name': exercise['name'].replace('_', ' ').title(),
#                         'type': exercise_type,
#                         'category': exercise['category'],
#                         'sets': sets_per_exercise,
#                         'reps': reps_range,
#                         'rest': rest_time,
#                         'joints': exercise['rules']['joints']
#                     }

#                     day_exercises.append(exercise_detail)

#                     # Store complete details
#                     if exercise['name'] not in exercise_plan['exercise_details']:
#                         exercise_plan['exercise_details'][exercise['name']] = {
#                             'rules': exercise['rules'],
#                             'total_volume_sets': 0
#                         }
#                     exercise_plan['exercise_details'][exercise['name']]['total_volume_sets'] += sets_per_exercise

#             exercise_plan['weekly_schedule'].append({
#                 'day': day,
#                 'exercises': day_exercises[:min(6, len(day_exercises))],  # Maximum 6 exercises
#                 'total_exercises': min(6, len(day_exercises))
#             })

#         # Calculate total volume
#         exercise_plan['total_weekly_volume'] = sum(
#             len(day['exercises']) for day in exercise_plan['weekly_schedule']
#         )

#         return exercise_plan

#     def print_workout_plan(self, plan: Dict):
#         """Print formatted workout plan"""
#         print("\n" + "="*70)
#         print("💪 Weekly Workout Plan:")
#         print("="*70)

#         for workout in plan['weekly_schedule']:
#             print(f"\n📅 {workout['day']}:")
#             print("-" * 40)
#             for ex in workout['exercises']:
#                 print(f"  • {ex['name']}")
#                 print(f"    {ex['sets']} sets × {ex['reps']} (rest {ex['rest']})")
#                 print(f"    Joints: {', '.join(set([j.replace('_', ' ').title() for j in ex['joints']]))}")

#         print("\n💡 Exercise Tips:")
#         for tip in plan['tips']:
#             print(f"  • {tip}")
