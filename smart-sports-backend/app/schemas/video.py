from pydantic import BaseModel
from datetime import datetime

class VideoResponse(BaseModel):
    id:          int
    file_name:   str
    status:      str
    uploaded_at: datetime

    class Config:
        from_attributes = True