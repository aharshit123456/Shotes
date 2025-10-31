from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid

class TestBase(SQLModel):
    title: str
    description: Optional[str] = None
    scheduled_date: datetime
    duration_minutes: int
    max_score: float = 100.0

class Test(TestBase, table=True):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    course_id: str = Field(foreign_key="course.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TestCreate(SQLModel):
    course_id: str
    title: str
    description: Optional[str] = None
    scheduled_date: datetime
    duration_minutes: int
    max_score: float = 100.0

class TestRead(TestBase):
    id: str
    course_id: str
    created_at: datetime

