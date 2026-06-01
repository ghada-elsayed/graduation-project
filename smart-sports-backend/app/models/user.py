from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    email           = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name       = Column(String, nullable=False)
    role            = Column(String, default="player")
    is_active       = Column(Boolean, default=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    # Profile fields
    age             = Column(Integer, nullable=True)
    weight_kg       = Column(Float,   nullable=True)
    height_cm       = Column(Float,   nullable=True)
    phone           = Column(String,  nullable=True)
    sport           = Column(String,  nullable=True)
    position        = Column(String,  nullable=True)
    city            = Column(String,  nullable=True)

    # Stats fields
    goals           = Column(Integer, nullable=True, default=0)
    assists         = Column(Integer, nullable=True, default=0)
    matches         = Column(Integer, nullable=True, default=0)
    shot_accuracy   = Column(Float,   nullable=True, default=0)
    win_rate        = Column(Float,   nullable=True, default=0)
    games_played    = Column(Integer, nullable=True, default=0)