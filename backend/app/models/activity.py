from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
import uuid

class ActivityType(str, Enum):
    ANNOUNCEMENT = "announcement"
    HOMEWORK = "homework"
    REMINDER = "reminder"

class ActivityBase(SQLModel):
    title: str
    message: str
    activity_type: ActivityType = ActivityType.ANNOUNCEMENT

class Activity(ActivityBase, table=True):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    course_id: str = Field(foreign_key="course.id")
    teacher_id: str = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ActivityCreate(SQLModel):
    course_id: str
    teacher_id: str
    title: str
    message: str
    activity_type: ActivityType

class ActivityRead(ActivityBase):
    id: str
    course_id: str
    teacher_id: str
    created_at: datetime

