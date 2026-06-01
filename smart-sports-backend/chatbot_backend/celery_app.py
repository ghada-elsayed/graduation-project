# celery_app.py
from celery import Celery
import os
from dotenv import load_dotenv

load_dotenv()

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "chatbot_tasks",
    broker=redis_url,
    backend=redis_url,
    include=["app.tasks.cv_analysis_task"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,      # 5 دقايق max للـ CV task
    task_soft_time_limit=240,
)

print("✅ Celery App initialized with Redis")