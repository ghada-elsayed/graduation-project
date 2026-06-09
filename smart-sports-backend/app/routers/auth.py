from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, ResetPassword, Token, UserResponse
from app.services.auth_service import register_user, login_user, reset_user_password
from app.core.security import decode_token
from app.models.user import User
from app.models.cv_application import CVApplication

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()


class StatsUpdate(BaseModel):
    goals: Optional[int] = 0
    assists: Optional[int] = 0
    matches: Optional[int] = 0
    shot_accuracy: Optional[float] = 0
    win_rate: Optional[float] = 0
    games_played: Optional[int] = 0


@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    user = register_user(user_data, db)
    return user


@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    token, user = login_user(user_data.email, user_data.password, db)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/reset-password")
def reset_password(data: ResetPassword, db: Session = Depends(get_db)):
    reset_user_password(data.email, data.new_password, db)
    return {"message": "Password reset successfully"}


@router.get("/me", response_model=UserResponse)
def get_me(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token غير صالح")
    user = db.query(User).filter(User.id == int(payload.get("sub"))).first()
    return user


@router.get("/clubs")
def get_clubs(db: Session = Depends(get_db)):
    clubs = db.query(User).filter(User.role == "club").all()
    return clubs


@router.get("/players")
def get_players(db: Session = Depends(get_db)):
    accepted_user_ids = db.query(CVApplication.user_id).filter(
        CVApplication.status == "accepted"
    ).subquery()
    players = db.query(User).filter(
        User.role == "player",
        ~User.id.in_(accepted_user_ids)
    ).all()
    return players


@router.put("/update-stats")
def update_stats(
    stats: StatsUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token غير صالح")

    user = db.query(User).filter(User.id == int(payload.get("sub"))).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.goals         = stats.goals
    user.assists       = stats.assists
    user.matches       = stats.matches
    user.shot_accuracy = stats.shot_accuracy
    user.win_rate      = stats.win_rate
    user.games_played  = stats.games_played

    db.commit()
    db.refresh(user)
    return user