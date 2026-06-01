from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Database
from app.database import engine, Base

# Models — لازم كلهم يتعملوا import عشان الجداول تتبني
import app.models.user
import app.models.video
import app.models.club
import app.models.nutrition
import app.models.club_requirements
import app.models.cv_application
from app.models.job_offer import JobOffer
from app.models.notification import Notification

# Routers
from app.routers import (
    auth,
    video,
    admin,
    nutrition,
    cv,
    exercise,
    club_dashboard,   # ← من زميلتك
    notifications,    # ← منك أنت
    jobs,             # ← منك أنت
)

# Create tables
Base.metadata.create_all(bind=engine)

# إنشاء مجلدات لو مش موجودة
os.makedirs("static/analyzed", exist_ok=True)

app = FastAPI(title="Smart Sports API")

# Mount static folder
app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(video.router)
app.include_router(admin.router)
app.include_router(nutrition.router)
app.include_router(cv.router)
app.include_router(exercise.router)
app.include_router(club_dashboard.router)   # ← من زميلتك
app.include_router(notifications.router)    # ← منك أنت
app.include_router(jobs.router)             # ← منك أنت

@app.get("/")
def root():
    return {"message": "Smart Sports API is running 🚀"}

@app.get("/health")
def health():
    return {"status": "ok", "message": "API is healthy"}