from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from app.database import get_db
from app.models.club import Club, club_players
from app.models.user import User
from app.schemas.club import ClubCreate, ClubResponse, ClubDetailResponse
from app.core.security import decode_token
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["Admin"])
security = HTTPBearer()

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email:     Optional[str] = None
    password:  Optional[str] = None
    role:      Optional[str] = None

def get_admin_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token غير صالح")
    user = db.query(User).filter(User.id == int(payload.get("sub"))).first()
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="محتاج صلاحية Admin")
    return user

# ── Stats ──
@router.get("/stats")
def get_stats(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    return {
        "total_players": db.query(User).filter(User.role == "player").count(),
        "total_clubs":   db.query(User).filter(User.role == "club").count(),
        "total_users":   db.query(User).count(),
    }

# ── Growth stats ──
@router.get("/stats/growth")
def get_growth_stats(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    rows = (
        db.query(
            extract("month", User.created_at).label("month"),
            User.role,
            func.count(User.id).label("count"),
        )
        .filter(User.role.in_(["player", "club"]))
        .group_by("month", User.role)
        .order_by("month")
        .all()
    )
    return [{"month": int(r.month), "role": r.role, "count": r.count} for r in rows]

# ── All users ──
@router.get("/users")
def get_all_users(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    return db.query(User).all()

# ── Update user ──
@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if data.full_name is not None: user.full_name = data.full_name
    if data.email     is not None: user.email     = data.email
    if data.role      is not None: user.role      = data.role
    if data.password  and data.password.strip():
        from app.core.security import hash_password
        user.hashed_password = hash_password(data.password)
    db.commit()
    db.refresh(user)
    return user

# ── Delete user ──
@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted ✅"}

# ── إنشاء نادي جديد ──
@router.post("/clubs", response_model=ClubResponse)
def create_club(
    club_data: ClubCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    existing = db.query(Club).filter(Club.name == club_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="النادي ده موجود بالفعل")
    club = Club(name=club_data.name, city=club_data.city, logo_url=club_data.logo_url)
    db.add(club)
    db.commit()
    db.refresh(club)
    return club

# ── جيب كل الأندية ──
@router.get("/clubs", response_model=List[ClubResponse])
def get_clubs(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    return db.query(Club).all()

# ── جيب تفاصيل نادي مع لاعبيه ──
@router.get("/clubs/{club_id}", response_model=ClubDetailResponse)
def get_club(
    club_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="النادي مش موجود")
    return club

# ── ربط لاعب بنادي ──
@router.post("/clubs/{club_id}/players/{player_id}")
def add_player_to_club(
    club_id: int,
    player_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="النادي مش موجود")
    player = db.query(User).filter(User.id == player_id, User.role == "player").first()
    if not player:
        raise HTTPException(status_code=404, detail="اللاعب مش موجود")
    if player in club.players:
        raise HTTPException(status_code=400, detail="اللاعب ده في النادي بالفعل")
    club.players.append(player)
    db.commit()
    return {"msg": "تم إضافة اللاعب للنادي ✅"}

# ── شيل لاعب من نادي ──
@router.delete("/clubs/{club_id}/players/{player_id}")
def remove_player_from_club(
    club_id: int,
    player_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="النادي مش موجود")
    player = db.query(User).filter(User.id == player_id).first()
    if not player or player not in club.players:
        raise HTTPException(status_code=404, detail="اللاعب مش في النادي ده")
    club.players.remove(player)
    db.commit()
    return {"msg": "تم إزالة اللاعب من النادي ✅"}