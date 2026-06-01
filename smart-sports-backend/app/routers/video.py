from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.video import Video
from app.models.user import User
from app.schemas.video import VideoResponse
from app.core.security import decode_token
import aiofiles, uuid, os
from typing import List

router = APIRouter(prefix="/videos", tags=["Videos"])
security = HTTPBearer()

UPLOAD_DIR = "uploads/"
os.makedirs(UPLOAD_DIR, exist_ok=True)

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

@router.post("/upload", response_model=VideoResponse)
async def upload_video(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # تأكد إن الملف فيديو
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="لازم يكون ملف فيديو")

    # احفظ الملف باسم unique
    ext      = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    async with aiofiles.open(filepath, 'wb') as f:
        content = await file.read()
        await f.write(content)

    # احفظ في الـ DB
    video = Video(
        player_id = current_user.id,
        file_path = filepath,
        file_name = file.filename,
        status    = "pending"
    )
    db.add(video)
    db.commit()
    db.refresh(video)

    return video

@router.get("/my-videos", response_model=List[VideoResponse])
def get_my_videos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    videos = db.query(Video).filter(Video.player_id == current_user.id).all()
    return videos