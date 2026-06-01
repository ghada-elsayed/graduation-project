# from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from sqlalchemy.orm import Session
# from app.database import get_db
# from app.core.security import decode_token
# from app.models.user import User
# from app.services.cv_service import analyze_cv_against_club

# router = APIRouter(prefix="/cv", tags=["CV Analysis"])
# security = HTTPBearer()

# # متطلبات كل نادي — بتتطابق مع الـ clubs في الـ Frontend
# CLUB_REQUIREMENTS = {
#     1: {"main_position": "ST", "age_min": 18, "age_max": 28, "height_cm": 175, "shooting": 1, "pace": 1, "mentality_positioning": 1},
#     2: {"main_position": "CM", "age_min": 20, "age_max": 30, "height_cm": 170, "passing": 1, "mentality_vision": 1, "teamwork": 1},
#     3: {"main_position": "RW", "age_min": 18, "age_max": 26, "height_cm": 165, "dribbling": 1, "pace": 1, "passing": 1},
#     4: {"main_position": "GK", "age_min": 20, "age_max": 32, "height_cm": 185, "power_jumping": 1, "teamwork": 1, "mentality_positioning": 1},
#     5: {"main_position": "CB", "age_min": 20, "age_max": 30, "height_cm": 180, "defending": 1, "power_jumping": 1, "power_strength": 1},
#     6: {"main_position": "CDM", "age_min": 20, "age_max": 29, "height_cm": 172, "defending": 1, "power_stamina": 1, "teamwork": 1},
# }

# def get_current_user(
#     credentials: HTTPAuthorizationCredentials = Depends(security),
#     db: Session = Depends(get_db)
# ):
#     payload = decode_token(credentials.credentials)
#     if not payload:
#         raise HTTPException(status_code=401, detail="Invalid token")
#     user = db.query(User).filter(User.id == int(payload.get("sub"))).first()
#     if not user:
#         raise HTTPException(status_code=401, detail="User not found")
#     return user

# @router.post("/analyze/{club_id}")
# async def analyze_cv_endpoint(
#     club_id: int,
#     file: UploadFile = File(...),
#     current_user: User = Depends(get_current_user)
# ):
#     if not file.filename.lower().endswith(('.pdf', '.docx', '.doc')):
#         raise HTTPException(status_code=400, detail="Only PDF or DOCX files allowed")

#     requirements = CLUB_REQUIREMENTS.get(club_id)
#     if not requirements:
#         raise HTTPException(status_code=404, detail="Club not found")

#     file_bytes = await file.read()
#     result = analyze_cv_against_club(file_bytes, file.filename, requirements)
#     return result




from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import decode_token
from app.models.user import User
from app.models.cv_application import CVApplication
from app.models.notification import Notification
from app.models.club_requirements import ClubRequirements
from app.services.cv_service import analyze_cv_against_club, extract_text_from_file, extract_club_requirements_from_text
import json


router = APIRouter(prefix="/cv", tags=["CV Analysis"])
security = HTTPBearer()

DEFAULT_REQUIREMENTS = {
    1: {"main_position": "ST", "age_min": 18, "age_max": 28, "height_cm": 175, "shooting": 1, "pace": 1, "mentality_positioning": 1},
    2: {"main_position": "CM", "age_min": 20, "age_max": 30, "height_cm": 170, "passing": 1, "mentality_vision": 1, "teamwork": 1},
    3: {"main_position": "RW", "age_min": 18, "age_max": 26, "height_cm": 165, "dribbling": 1, "pace": 1, "passing": 1},
    4: {"main_position": "GK", "age_min": 20, "age_max": 32, "height_cm": 185, "power_jumping": 1, "teamwork": 1, "mentality_positioning": 1},
    5: {"main_position": "CB", "age_min": 20, "age_max": 30, "height_cm": 180, "defending": 1, "power_jumping": 1, "power_strength": 1},
    6: {"main_position": "CDM", "age_min": 20, "age_max": 29, "height_cm": 172, "defending": 1, "power_stamina": 1, "teamwork": 1},
}

CLUB_NAMES = {
    1: ("Al Ahly FC",   "Striker (ST)"),
    2: ("Zamalek SC",   "Central Midfielder (CM)"),
    3: ("Pyramids FC",  "Right Winger (RW)"),
    4: ("Al Masry SC",  "Goalkeeper (GK)"),
    5: ("Smouha SC",    "Center Back (CB)"),
    6: ("ENPPI FC",     "Defensive Midfielder (CDM)"),
}

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

# ── Admin: رفع PDF متطلبات النادي ──
@router.post("/upload-requirements/{club_id}")
async def upload_club_requirements(
    club_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("admin", "club"):
        raise HTTPException(status_code=403, detail="Admins only")
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")
    file_bytes = await file.read()
    text = extract_text_from_file(file_bytes, file.filename)
    requirements = extract_club_requirements_from_text(text)
    club_name, position = CLUB_NAMES.get(club_id, ("Unknown", "Unknown"))
    db.query(ClubRequirements).filter(ClubRequirements.club_id == club_id).delete()
    new_req = ClubRequirements(
        club_id=club_id, club_name=club_name,
        position=position, requirements=json.dumps(requirements),
    )
    db.add(new_req)
    db.commit()
    return {"message": "Requirements uploaded successfully", "requirements": requirements}

# ── Player: تحليل الـ CV ──
@router.post("/analyze/{club_id}")
async def analyze_cv_endpoint(
    club_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.lower().endswith(('.pdf', '.docx', '.doc')):
        raise HTTPException(status_code=400, detail="Only PDF or DOCX files allowed")
    db_req = db.query(ClubRequirements).filter(ClubRequirements.club_id == club_id).first()
    if db_req:
        requirements = json.loads(db_req.requirements)
    else:
        requirements = DEFAULT_REQUIREMENTS.get(club_id)
        if not requirements:
            # استخدم requirements افتراضية عامة
            requirements = {"main_position": "Player", "age_min": 16, "age_max": 35, "height_cm": 160}
    file_bytes = await file.read()
    result = analyze_cv_against_club(file_bytes, file.filename, requirements)
    existing = db.query(CVApplication).filter(
    CVApplication.user_id == current_user.id,
    CVApplication.club_id == club_id,
    CVApplication.source == "cv"
    ).first()
    if existing:
        existing.score = result["score"]
        existing.status = "pending"
        existing.met_skills = ", ".join(result["met_skills"])
    else:
        club_name, position = CLUB_NAMES.get(club_id, (
            db.query(User).filter(User.id == club_id).first().full_name, "Player"
        ))
        application = CVApplication(
            user_id=current_user.id, club_id=club_id,
            club_name=club_name, position=position,
            score=result["score"], status="pending",
            met_skills=", ".join(result["met_skills"]),
            source="cv",
        )
        db.add(application)
        club = db.query(User).filter(User.id == club_id).first()
        if club:
            notif = Notification(
                user_id=club_id,
                title="📄 New CV Application!",
                message=f"{current_user.full_name} uploaded a CV for your club",
                type="application",
            )
            db.add(notif)  # ← جوه الـ if
    db.commit()
    return result

# ── Player: جيب applications بتاعته ──
@router.get("/my-applications")
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    apps = db.query(CVApplication).filter(
        CVApplication.user_id == current_user.id,
        CVApplication.source == "player"
    ).order_by(CVApplication.applied_at.desc()).all()
    return [
        {
            "id": a.id, "club_id": a.club_id, "club_name": a.club_name,
            "position": a.position, "score": a.score, "status": a.status,
            "met_skills": a.met_skills, "applied_at": str(a.applied_at),
        }
        for a in apps
    ]

# ── Player: بعت request لنادي ──
@router.post("/apply/{club_id}")
def apply_to_club(
    club_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # تحقق إن اللاعب مش منضم لنادي بالفعل
    already_in_club = db.query(CVApplication).filter(
        CVApplication.user_id == current_user.id,
        CVApplication.status == "accepted"
    ).first()
    if already_in_club:
        raise HTTPException(status_code=400, detail="انت بالفعل منضم لنادي")

    club = db.query(User).filter(User.id == club_id, User.role == "club").first()
    if not club:
        raise HTTPException(status_code=404, detail="النادي مش موجود")

    # تحقق إن اللاعب مش رفع CV لنفس النادي
    cv_application = db.query(CVApplication).filter(
        CVApplication.user_id == current_user.id,
        CVApplication.club_id == club_id,
        CVApplication.source == "cv"
    ).first()
    if cv_application:
        raise HTTPException(status_code=400, detail="انت بالفعل رفعت CV لهذا النادي")

    existing = db.query(CVApplication).filter(
        CVApplication.user_id == current_user.id,
        CVApplication.club_id == club_id,
        CVApplication.source == "player"
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="انت بالفعل بعتت request لهذا النادي")

    application = CVApplication(
        user_id=current_user.id, club_id=club_id,
        club_name=club.full_name, position=current_user.position or "Player",
        score=0, status="pending", met_skills="", source="player",
    )
    db.add(application)
    notif = Notification(
        user_id=club_id, title="New Player Request! 🏃",
        message=f"{current_user.full_name} sent you a join request",
        type="application",
    )
    db.add(notif)
    db.commit()
    return {"message": "تم إرسال الطلب بنجاح ✅"}

# ── Player: إلغاء request ──
@router.delete("/apply/{club_id}")
def cancel_application(
    club_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    application = db.query(CVApplication).filter(
        CVApplication.user_id == current_user.id,
        CVApplication.club_id == club_id,
        CVApplication.source == "player"
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="الطلب مش موجود")
    db.delete(application)
    db.commit()
    return {"message": "تم إلغاء الطلب ✅"}

# ── Club: جيب الـ requests اللي جاية ──
@router.get("/club-requests")
def get_club_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("admin", "club"):
        raise HTTPException(status_code=403, detail="Clubs only")
    
    requests = db.query(CVApplication).filter(
        CVApplication.club_id == current_user.id,
        CVApplication.source.in_(["player", "cv"])
    ).order_by(CVApplication.applied_at.desc()).all()

    return [
        {
            "id": r.id, "user_id": r.user_id,
            "player_name": db.query(User).filter(User.id == r.user_id).first().full_name,
            "position": r.position, "score": r.score,
            "status": r.status, "applied_at": str(r.applied_at),
            "has_cv": r.met_skills is not None and r.met_skills != "",
            "source": r.source,
        }
        for r in requests
    ]

# ── Club: قبول أو رفض request ──
@router.put("/club-requests/{request_id}")
def update_request_status(
    request_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("admin", "club"):
        raise HTTPException(status_code=403, detail="Clubs only")
    request = db.query(CVApplication).filter(
        CVApplication.id == request_id,
        CVApplication.club_id == current_user.id
    ).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    request.status = status
    notif = Notification(
        user_id=request.user_id,
        title="✅ Request Accepted!" if status == "accepted" else "❌ Request Rejected",
        message=f"{current_user.full_name} {'accepted' if status == 'accepted' else 'rejected'} your join request",
        type=status,
    )
    db.add(notif)
    db.commit()
    return {"message": f"Request {status} ✅"}

# ── Club: جيب اللاعبين المقبولين ──
@router.get("/my-players")
def get_club_players(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("admin", "club"):
        raise HTTPException(status_code=403, detail="Clubs only")
    accepted = db.query(CVApplication).filter(
        CVApplication.club_id == current_user.id,
        CVApplication.status == "accepted"
    ).all()
    seen = set()
    players = []
    for app in accepted:
        if app.user_id not in seen:
            seen.add(app.user_id)
            player = db.query(User).filter(User.id == app.user_id).first()
            if player:
                players.append({
                    "id": player.id, "full_name": player.full_name,
                    "email": player.email, "position": player.position or "—",
                    "sport": player.sport or "—", "city": player.city or "—",
                    "age": player.age, "height_cm": player.height_cm,
                    "weight_kg": player.weight_kg,
                    "goals": player.goals or 0,
                    "assists": player.assists or 0,
                    "matches": player.matches or 0,
                    "shot_accuracy": player.shot_accuracy or 0,
                    "win_rate": player.win_rate or 0,
                    "games_played": player.games_played or 0,
                })
    return players

# ── Club: بعت offer للاعب ──
@router.post("/offer-player/{player_id}")
def offer_player(
    player_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("admin", "club"):
        raise HTTPException(status_code=403, detail="Clubs only")
    player = db.query(User).filter(User.id == player_id, User.role == "player").first()
    if not player:
        raise HTTPException(status_code=404, detail="اللاعب مش موجود")
    existing = db.query(CVApplication).filter(
        CVApplication.user_id == player_id,
        CVApplication.club_id == current_user.id,
        CVApplication.source == "club"
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="انت بالفعل بعتت offer لهذا اللاعب")
    application = CVApplication(
        user_id=player_id, club_id=current_user.id,
        club_name=current_user.full_name, position=player.position or "Player",
        score=0, status="pending", met_skills="", source="club",
    )
    db.add(application)
    notif = Notification(
        user_id=player_id, title="🏟️ Club Offer!",
        message=f"{current_user.full_name} sent you a join offer!",
        type="offer",
    )
    db.add(notif)
    db.commit()
    return {"message": "Offer sent successfully ✅"}

# ── Player: قبول أو رفض offer من نادي ──
@router.put("/respond-offer/{club_id}")
def respond_to_offer(
    club_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # لو بيعمل accept تحقق إنه مش منضم لنادي بالفعل
    if status == "accepted":
        already_in_club = db.query(CVApplication).filter(
            CVApplication.user_id == current_user.id,
            CVApplication.status == "accepted"
        ).first()
        if already_in_club:
            raise HTTPException(status_code=400, detail="انت بالفعل منضم لنادي")

    application = db.query(CVApplication).filter(
        CVApplication.user_id == current_user.id,
        CVApplication.club_id == club_id,
        CVApplication.source == "club",
        CVApplication.status == "pending"
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Offer not found")

    application.status = status
    notif = Notification(
        user_id=club_id,
        title="✅ Offer Accepted!" if status == "accepted" else "❌ Offer Rejected",
        message=f"{current_user.full_name} {'accepted' if status == 'accepted' else 'rejected'} your offer",
        type=status,
    )
    db.add(notif)
    db.commit()
    return {"message": f"Offer {status} ✅"}

# ── Club: جيب الـ offers المبعوتة ──
@router.get("/sent-offers")
def get_sent_offers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("admin", "club"):
        raise HTTPException(status_code=403, detail="Clubs only")
    offers = db.query(CVApplication).filter(
        CVApplication.club_id == current_user.id,
        CVApplication.source == "club"
    ).all()
    return [
        {"user_id": o.user_id, "status": o.status}
        for o in offers
    ]

# ── Player: جيب الـ offers الجاية من النوادي ──
@router.get("/my-offers")
def get_player_offers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    offers = db.query(CVApplication).filter(
        CVApplication.user_id == current_user.id,
        CVApplication.source == "club"
    ).order_by(CVApplication.applied_at.desc()).all()
    return [
        {
            "id": o.id, "club_id": o.club_id, "club_name": o.club_name,
            "status": o.status, "applied_at": str(o.applied_at),
        }
        for o in offers
    ]

# ── Club: إلغاء offer للاعب ──
@router.delete("/offer-player/{player_id}")
def cancel_offer(
    player_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("admin", "club"):
        raise HTTPException(status_code=403, detail="Clubs only")
    
    application = db.query(CVApplication).filter(
        CVApplication.user_id == player_id,
        CVApplication.club_id == current_user.id,
        CVApplication.source == "club"
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    db.delete(application)
    db.commit()
    return {"message": "Offer cancelled ✅"}

    # ── Club: إزالة لاعب من الروستر ──
@router.delete("/remove-player/{player_id}")
def remove_player(
    player_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("admin", "club"):
        raise HTTPException(status_code=403, detail="Clubs only")
    
    application = db.query(CVApplication).filter(
        CVApplication.user_id == player_id,
        CVApplication.club_id == current_user.id,
        CVApplication.status == "accepted"
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="اللاعب مش موجود")
    
    db.delete(application)
    db.commit()
    return {"message": "تم إزالة اللاعب ✅"}


# ── Club: جيب الـ CV applications ──
@router.get("/club-cv-applications")
def get_club_cv_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("admin", "club"):
        raise HTTPException(status_code=403, detail="Clubs only")
    
    apps = db.query(CVApplication).filter(
        CVApplication.club_id == current_user.id,
        CVApplication.source == "player",
        CVApplication.score > 0
    ).order_by(CVApplication.applied_at.desc()).all()
    
    return [
        {
            "id": a.id,
            "user_id": a.user_id,
            "player_name": db.query(User).filter(User.id == a.user_id).first().full_name,
            "position": a.position,
            "score": a.score,
            "status": a.status,
            "met_skills": a.met_skills,
            "applied_at": str(a.applied_at),
        }
        for a in apps
    ]

@router.get("/my-cv-applications")
def get_my_cv_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    apps = db.query(CVApplication).filter(
        CVApplication.user_id == current_user.id,
        CVApplication.source == "cv"
    ).all()
    return [{"club_id": a.club_id, "status": a.status} for a in apps]