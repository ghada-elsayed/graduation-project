from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class JobOffer(Base):
    __tablename__ = "job_offers"

    id          = Column(Integer, primary_key=True, index=True)
    club_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    club_name   = Column(String, nullable=False)
    title       = Column(String, nullable=False)
    position    = Column(String, nullable=False)
    location    = Column(String, nullable=True)
    description = Column(String, nullable=True)
    sport       = Column(String, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())