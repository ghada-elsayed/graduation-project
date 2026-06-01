from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.database import Base
import datetime

# جدول الربط بين الأندية واللاعبين
club_players = Table(
    "club_players",
    Base.metadata,
    Column("club_id", Integer, ForeignKey("clubs.id"), primary_key=True),
    Column("player_id", Integer, ForeignKey("users.id"), primary_key=True)
)

class Club(Base):
    __tablename__ = "clubs"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String, nullable=False, unique=True)
    city       = Column(String, nullable=False)
    logo_url   = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    players = relationship("User", secondary=club_players, backref="clubs")