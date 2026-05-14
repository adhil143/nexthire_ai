from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class RoadmapBase(BaseModel):
    target_role: str

class RoadmapCreate(RoadmapBase):
    pass

class Roadmap(RoadmapBase):
    id: int
    owner_id: int
    content_json: str
    created_at: datetime

    class Config:
        from_attributes = True
