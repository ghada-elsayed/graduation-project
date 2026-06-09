from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
import os, shutil
import uuid
from app.database import get_db
from app.core.security import decode_token
from app.models.user import User
from app.services.exercise_analysis_service import analyze_exercise_video, get_all_exercises, get_ai_voice_feedback

router   = APIRouter(prefix="/exercise", tags=["Exercise Analysis"])
security = HTTPBearer()


class LiveFeedbackRequest(BaseModel):
    exercise_name: str = "exercise"
    total_reps: int = 0
    good_reps: int = 0
    bad_reps: int = 0
    min_angle: float = 0
    max_angle: float = 0
    range_of_motion: float = 0

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == int(payload.get("sub"))).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.get("/exercises-list")
def list_exercises():
    return get_all_exercises()

# @router.post("/analyze")
# async def analyze_exercise(
#     file:          UploadFile = File(...),
#     exercise_name: str        = Form(...),
#     db:            Session    = Depends(get_db),
#     current_user:  User       = Depends(get_current_user)
# ):
#     if not file.filename.lower().endswith(('.mp4', '.avi', '.mov', '.mkv')):
#         raise HTTPException(status_code=400, detail="Only video files allowed")

#     try:
#         video_bytes = await file.read()
#         files = {
#             "file": (
#                 file.filename,
#                 video_bytes,
#                 file.content_type or "application/octet-stream",
#             )
#         }
#         data = {"exercise_name": exercise_name}
#         async with httpx.AsyncClient(timeout=120) as client:
#             response = await client.post(
#                 "https://pessimism-channel-sixtyfold.ngrok-free.dev/generate_feedback",
#                 files=files,
#                 data=data,
#             )
#         response.raise_for_status()
#         return response.json()
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
@router.post("/analyze")
async def analyze_exercise(
    file:          UploadFile = File(...),
    exercise_name: str        = Form(...),
    db:            Session    = Depends(get_db),
    current_user:  User       = Depends(get_current_user)
):
    filename = file.filename or ""
    if not filename.lower().endswith(('.mp4', '.avi', '.mov', '.mkv', '.webm')):
        raise HTTPException(status_code=400, detail="Only video files allowed")

    supported_names = {exercise["name"] for exercise in get_all_exercises()}
    if exercise_name not in supported_names:
        raise HTTPException(status_code=400, detail=f"Exercise '{exercise_name}' not found")

    upload_dir = os.path.join("uploads", "exercise")
    os.makedirs(upload_dir, exist_ok=True)
    _, ext = os.path.splitext(filename)
    temp_video_path = os.path.join(upload_dir, f"{current_user.id}_{exercise_name}_{uuid.uuid4().hex}{ext}")

    video_saved = False
    try:
        with open(temp_video_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        video_saved = True

        result = analyze_exercise_video(
            video_path=temp_video_path,
            exercise_name=exercise_name,
            groq_api_key=os.getenv("GROQ_API_KEY", ""),
        )

        if result.get("error"):
            raise HTTPException(status_code=400, detail=result["error"])

        good_reps = int(result.get("total_reps", 0) or 0)
        bad_reps = int(result.get("bad_reps", 0) or 0)
        total_reps = good_reps + bad_reps
        result["good_reps"] = good_reps
        result["bad_reps"] = bad_reps
        result["total_reps"] = total_reps

        if total_reps == 0:
            result["ai_feedback"] = "No repetitions detected. Try again!"
            result["audio_url"] = None
            return result

        feedback = get_ai_voice_feedback(
            exercise_name=exercise_name,
            total_reps=total_reps,
            min_angle=result.get("min_angle", 0),
            max_angle=result.get("max_angle", 0),
        )

        if feedback:
            audio_path, ai_text = feedback
            result["ai_feedback"] = ai_text

            if audio_path and os.path.exists(audio_path):
                audio_dir = "uploads/audio"
                os.makedirs(audio_dir, exist_ok=True)
                audio_dest = os.path.join(audio_dir, f"{current_user.id}_{exercise_name}_upload.mp3")
                shutil.copy(audio_path, audio_dest)
                result["audio_url"] = f"/exercise/audio/{current_user.id}_{exercise_name}_upload.mp3"

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if video_saved and os.path.exists(temp_video_path):
            os.remove(temp_video_path)
    

@router.get("/audio/{filename}")
def get_audio(filename: str):
    path = f"uploads/audio/{filename}"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Audio not found")
    return FileResponse(path, media_type="audio/mpeg")

# ── Live Camera Feedback ──────────────────────────────────────
@router.post("/live-feedback")
async def live_feedback(
    data:         LiveFeedbackRequest,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user)
):
    exercise_name   = data.exercise_name
    total_reps      = data.total_reps
    good_reps       = data.good_reps
    bad_reps        = data.bad_reps
    min_angle       = data.min_angle
    max_angle       = data.max_angle
    range_of_motion = data.range_of_motion

    if total_reps > 0 and good_reps == 0 and bad_reps == 0:
        good_reps = total_reps

    supported_names = {exercise["name"] for exercise in get_all_exercises()}
    if exercise_name not in supported_names:
        raise HTTPException(status_code=400, detail=f"Exercise '{exercise_name}' not found")

    if total_reps == 0:
        return {
            "exercise_name":   exercise_name,
            "total_reps":      0,
            "good_reps":       good_reps,
            "bad_reps":        bad_reps,
            "min_angle":       min_angle,
            "max_angle":       max_angle,
            "range_of_motion": range_of_motion,
            "ai_feedback":     "No repetitions detected. Try again!",
            "audio_url":       None,
        }

    ai_feedback = "Exercise completed!"
    audio_url   = None

    try:
        result = get_ai_voice_feedback(
            exercise_name = exercise_name,
            total_reps    = total_reps,
            min_angle     = min_angle,
            max_angle     = max_angle,
        )

        if result:
            audio_path, ai_text = result
            ai_feedback = ai_text

            if audio_path and os.path.exists(audio_path):
                audio_dir  = "uploads/audio"
                os.makedirs(audio_dir, exist_ok=True)
                audio_dest = os.path.join(audio_dir, f"{current_user.id}_{exercise_name}_live.mp3")
                shutil.copy(audio_path, audio_dest)
                audio_url = f"/exercise/audio/{current_user.id}_{exercise_name}_live.mp3"

    except Exception as e:
        print(f"Live feedback error: {e}")

    return {
        "exercise_name":   exercise_name,
        "total_reps":      total_reps,
        "good_reps":       good_reps,
        "bad_reps":        bad_reps,
        "min_angle":       min_angle,
        "max_angle":       max_angle,
        "range_of_motion": range_of_motion,
        "ai_feedback":     ai_feedback,
        "audio_url":       audio_url,
    }
