# from fastapi import APIRouter, Depends, HTTPException
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from sqlalchemy.orm import Session
# from app.database import get_db
# from app.models.nutrition import NutritionPlan
# from app.models.user import User
# from app.schemas.nutrition import NutritionRequest, NutritionResponse
# from app.services.nutrition_service import calculate_nutrition
# from app.core.security import decode_token

# router = APIRouter(prefix="/nutrition", tags=["Nutrition"])
# security = HTTPBearer()

# def get_current_user(
#     credentials: HTTPAuthorizationCredentials = Depends(security),
#     db: Session = Depends(get_db)
# ):
#     token = credentials.credentials
#     payload = decode_token(token)
#     if not payload:
#         raise HTTPException(status_code=401, detail="Token غير صالح")
#     user = db.query(User).filter(User.id == int(payload.get("sub"))).first()
#     if not user:
#         raise HTTPException(status_code=401, detail="المستخدم مش موجود")
#     return user

# @router.post("/generate", response_model=NutritionResponse)
# def generate_plan(
#     data: NutritionRequest,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     # احسب الخطة
#     result = calculate_nutrition(
#         age=data.age,
#         weight_kg=data.weight_kg,
#         height_cm=data.height_cm,
#         gender=data.gender,
#         activity=data.activity,
#         goal=data.goal
#     )

#     # احفظها في الـ DB
#     plan = NutritionPlan(
#         user_id  = current_user.id,
#         goal     = data.goal,
#         calories = result["calories"],
#         protein  = result["protein"],
#         carbs    = result["carbs"],
#         fat      = result["fat"]
#     )
#     db.add(plan)
#     db.commit()
#     db.refresh(plan)
#     return plan

# @router.get("/my-plan", response_model=NutritionResponse)
# def get_my_plan(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     plan = db.query(NutritionPlan).filter(
#         NutritionPlan.user_id == current_user.id
#     ).order_by(NutritionPlan.id.desc()).first()

#     if not plan:
#         raise HTTPException(status_code=404, detail="مفيش خطة غذائية ليك لحد دلوقتي")
#     return plan











# # app/routers/nutrition.py
# from fastapi import APIRouter, Depends, HTTPException
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from sqlalchemy.orm import Session

# from app.database import get_db
# from app.models.nutrition import NutritionPlan
# from app.models.user import User
# from app.schemas.nutrition import NutritionRequest, NutritionResponse   # لو مش موجود هنعدله بعدين
# from app.services.nutrition_service import get_nutrition_plan
# from app.core.security import decode_token

# router = APIRouter(prefix="/nutrition", tags=["Nutrition"])
# security = HTTPBearer()


# def get_current_user(
#     credentials: HTTPAuthorizationCredentials = Depends(security),
#     db: Session = Depends(get_db)
# ):
#     token = credentials.credentials
#     payload = decode_token(token)
#     if not payload:
#         raise HTTPException(status_code=401, detail="Token غير صالح")
    
#     user = db.query(User).filter(User.id == int(payload.get("sub"))).first()
#     if not user:
#         raise HTTPException(status_code=401, detail="المستخدم مش موجود")
#     return user


# # @router.post("/generate", response_model=NutritionResponse)
# # def generate_plan(
# #     data: NutritionRequest,
# #     weight_kg: float,
# #     height_cm: float,
# #     db: Session = Depends(get_db),
# #     current_user: User = Depends(get_current_user)
# # ):
# #     """
# #     إنشاء خطة غذائية باستخدام الـ AI Model + الطريقة التقليدية
# #     """
# #     try:
# #         # استخدام الدالة الجديدة اللي بتستخدم الـ AI
# #         result = get_nutrition_plan(
# #             user=data,           # NutritionInput
# #             weight_kg=weight_kg,
# #             height_cm=height_cm
# #         )

# #         # حفظ الخطة في الداتابيز
# #         plan = NutritionPlan(
# #             user_id  = current_user.id,
# #             goal     = data.goal,
# #             calories = result["calories"],
# #             protein  = result["protein_grams"],
# #             carbs    = result["carbs_grams"],
# #             fat      = result["fat_grams"]
# #         )

# #         db.add(plan)
# #         db.commit()
# #         db.refresh(plan)

# #         # إرجاع النتيجة مع النسب المئوية من الـ AI
# #         return {
# #             "id": plan.id,
# #             "user_id": plan.user_id,
# #             "goal": plan.goal,
# #             "calories": plan.calories,
# #             "protein": plan.protein,
# #             "carbs": plan.carbs,
# #             "fat": plan.fat,
# #             "protein_percent": result["protein_percent"],
# #             "carbs_percent": result["carbs_percent"],
# #             "fat_percent": result["fat_percent"],
# #             "source": result["source"]
# #         }

# #     except Exception as e:
# #         raise HTTPException(status_code=500, detail=f"حدث خطأ أثناء إنشاء الخطة: {str(e)}")









# # @router.post("/generate", response_model=dict)
# # def generate_plan(
# #     request: NutritionRequest,                    # كل البيانات في Body
# #     db: Session = Depends(get_db),
# #     current_user: User = Depends(get_current_user)
# # ):
# #     try:
# #         result = get_nutrition_plan(
# #             user=request,
# #             weight_kg=request.weight_kg,      # هنجيبها من الـ request
# #             height_cm=request.height_cm
# #         )

# #         # حفظ في الداتابيز
# #         plan = NutritionPlan(
# #             user_id=current_user.id,
# #             goal=request.goal,
# #             calories=result["calories"],
# #             protein=result["protein_grams"],
# #             carbs=result["carbs_grams"],
# #             fat=result["fat_grams"]
# #         )
# #         db.add(plan)
# #         db.commit()
# #         db.refresh(plan)

# #         # إرجاع النتيجة كاملة
# #         return {
# #             "id": plan.id,
# #             "user_id": plan.user_id,
# #             "goal": plan.goal,
# #             "calories": result["calories"],
# #             "protein_grams": result["protein_grams"],
# #             "carbs_grams": result["carbs_grams"],
# #             "fat_grams": result["fat_grams"],
# #             "protein_percent": result["protein_percent"],
# #             "carbs_percent": result["carbs_percent"],
# #             "fat_percent": result["fat_percent"],
# #             "source": result.get("source", "AI"),
# #             "tips": result.get("tips", [])  # ← أضيفي هذا السطر ✅
# #         }

# #     except Exception as e:
# #         raise HTTPException(status_code=500, detail=str(e))



# @router.post("/generate")
# def generate_plan(
#     request: NutritionRequest,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     try:
#         result = get_nutrition_plan(
#             user=request,
#             weight_kg=request.weight_kg,
#             height_cm=request.height_cm
#         )

#         # حفظ في الداتابيز (اختياري)
#         plan = NutritionPlan(
#             user_id=current_user.id,
#             goal=request.goal,
#             calories=result["calories"],
#             protein=result["protein_grams"],
#             carbs=result["carbs_grams"],
#             fat=result["fat_grams"]
#         )
#         db.add(plan)
#         db.commit()
#         db.refresh(plan)

#         return result

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))



# @router.get("/my-plan", response_model=NutritionResponse)
# def get_my_plan(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     """جلب آخر خطة غذائية للمستخدم"""
#     plan = db.query(NutritionPlan).filter(
#         NutritionPlan.user_id == current_user.id
#     ).order_by(NutritionPlan.id.desc()).first()

#     if not plan:
#         raise HTTPException(status_code=404, detail="مفيش خطة غذائية ليك لحد دلوقتي")

#     return plan
















# app/routers/nutrition.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import datetime

from app.database import get_db
from app.models.nutrition import NutritionPlan
from app.models.user import User
from app.schemas.nutrition import NutritionRequest
from app.services.nutrition_service import get_nutrition_plan
from app.core.security import decode_token

router = APIRouter(prefix="/nutrition", tags=["Nutrition"])
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token غير صالح")
    
    user = db.query(User).filter(User.id == int(payload.get("sub"))).first()
    if not user:
        raise HTTPException(status_code=401, detail="المستخدم مش موجود")
    return user


@router.post("/generate")
def generate_plan(
    request: NutritionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    إنشاء خطة تغذية أسبوعية باستخدام Advanced Nutrition System
    """
    try:
        result = get_nutrition_plan(
            user=request,
            weight_kg=request.weight_kg,
            height_cm=request.height_cm,
            db=db,
            user_id=current_user.id
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"حدث خطأ أثناء إنشاء الخطة: {str(e)}")


@router.get("/my-plan")
def get_my_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """جلب آخر خطة غذائية نشطة للمستخدم"""
    plan = db.query(NutritionPlan).filter(
        NutritionPlan.user_id == current_user.id,
        NutritionPlan.expires_at > datetime.datetime.now(datetime.timezone.utc)
    ).order_by(NutritionPlan.created_at.desc()).first()

    if not plan:
        return {
            "has_active_plan": False,
            "message": "مفيش خطة غذائية نشطة حالياً. يرجى إنشاء خطة جديدة.",
            "action": "create_new"
        }

    # إذا كانت الخطة موجودة ونشطة
    return {
        "has_active_plan": True,
        "id": plan.id,
        "calories": plan.calories,
        "protein_grams": plan.protein_grams,
        "carbs_grams": plan.carbs_grams,
        "fat_grams": plan.fat_grams,
        "protein_percent": plan.protein_percent,
        "carbs_percent": plan.carbs_percent,
        "fat_percent": plan.fat_percent,
        "daily_plan": plan.daily_plan,
        "workout": plan.workout,
        "tips": plan.tips,
        "expires_at": plan.expires_at.isoformat(),
        "source": "Advanced AI Nutrition System"
    }