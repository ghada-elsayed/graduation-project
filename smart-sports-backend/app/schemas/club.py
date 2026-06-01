from pydantic import BaseModel
from typing import List, Optional
from app.schemas.user import UserResponse

class ClubCreate(BaseModel):
    name: str
    city: str
    logo_url: Optional[str] = None

class ClubResponse(BaseModel):
    id:       int
    name:     str
    city:     str
    logo_url: Optional[str]

    class Config:
        from_attributes = True

class ClubDetailResponse(BaseModel):
    id:      int
    name:    str
    city:    str
    players: List[UserResponse] = []

    class Config:
        from_attributes = True