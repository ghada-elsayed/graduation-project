from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import decode_token
from app.models.user import User
from app.models.cv_application import CVApplication

router   = APIRouter(prefix="/club", tags=["Club Dashboard"])
security = HTTPBearer()

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

# ── جيب كل اللاعبين المسجلين ──
@router.get("/athletes")
def get_all_athletes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("admin", "club"):
        raise HTTPException(status_code=403, detail="Admins only")

    players = db.query(User).filter(User.role == "player").all()
    return [
        {
            "id":        p.id,
            "name":      p.full_name,
            "email":     p.email,
            "age":       p.age,
            "height":    p.height_cm,
            "weight":    p.weight_kg,
            "sport":     p.sport,
            "position":  p.position,
            "city":      p.city,
            "phone":     p.phone,
        }
        for p in players
    ]

# ── جيب الـ CV applications اللي اتبعتتلك ──
@router.get("/applications")
def get_club_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("admin", "club"):
        raise HTTPException(status_code=403, detail="Admins only")

    apps = db.query(CVApplication).order_by(
        CVApplication.applied_at.desc()
    ).all()

    result = []
    for a in apps:
        player = db.query(User).filter(User.id == a.user_id).first()
        result.append({
            "id":         a.id,
            "user_id":    a.user_id,
            "player_name": player.full_name if player else "Unknown",
            "player_email": player.email if player else "",
            "player_position": player.position if player else "",
            "club_name":  a.club_name,
            "position":   a.position,
            "score":      a.score,
            "status":     a.status,
            "met_skills": a.met_skills,
            "applied_at": str(a.applied_at),
        })
    return result

# ── قبول أو رفض application ──
@router.put("/applications/{app_id}")
def update_application_status(
    app_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("admin", "club"):
        raise HTTPException(status_code=403, detail="Admins only")

    app = db.query(CVApplication).filter(CVApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    app.status = status
    db.commit()
    return {"message": "Status updated", "status": status}