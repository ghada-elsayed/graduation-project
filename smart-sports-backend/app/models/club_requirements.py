from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class ClubRequirements(Base):
    __tablename__ = "club_requirements"

    id           = Column(Integer, primary_key=True, index=True)
    club_id      = Column(Integer, nullable=False)
    club_name    = Column(String, nullable=False)
    position     = Column(String, nullable=False)
    requirements = Column(String, nullable=False)  # JSON string
    uploaded_at  = Column(DateTime(timezone=True), server_default=func.now())