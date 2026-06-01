from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class CVApplication(Base):
    __tablename__ = "cv_applications"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    club_id      = Column(Integer, nullable=False)
    club_name    = Column(String, nullable=False)
    position     = Column(String, nullable=False)
    score        = Column(Float, nullable=False)
    status       = Column(String, nullable=False)
    met_skills   = Column(String, nullable=True)
    applied_at   = Column(DateTime(timezone=True), server_default=func.now())
    source       = Column(String, nullable=True, default="cv")