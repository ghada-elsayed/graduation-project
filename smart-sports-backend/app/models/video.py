from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
import datetime

class Video(Base):
    __tablename__ = "videos"

    id          = Column(Integer, primary_key=True, index=True)
    player_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_path   = Column(String, nullable=False)
    file_name   = Column(String, nullable=False)
    status      = Column(String, default="pending")  # pending / done / failed
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    player = relationship("User", backref="videos")