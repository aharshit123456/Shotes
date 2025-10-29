from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
import uuid

class ClassStatus(str, Enum):
    SCHEDULED = "scheduled"
    LIVE = "live"
    ENDED = "ended"

class ClassBase(SQLModel):
    title: str
    scheduled_start: datetime
    scheduled_end: datetime
    status: ClassStatus = ClassStatus.SCHEDULED
    webrtc_room_id: Optional[str] = None

class Class(ClassBase, table=True):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    course_id: str = Field(foreign_key="course.id")
    teacher_id: str = Field(foreign_key="user.id")
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ClassCreate(SQLModel):
    course_id: str
    teacher_id: str
    title: str
    scheduled_start: datetime
    scheduled_end: datetime

class ClassRead(ClassBase):
    id: str
    course_id: str
    teacher_id: str
    actual_start: Optional[datetime]
    actual_end: Optional[datetime]
    created_at: datetime

