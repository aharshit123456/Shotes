from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
import uuid

class EnrollmentStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    DROPPED = "dropped"

class EnrollmentBase(SQLModel):
    progress_percentage: float = 0.0
    topics_completed: int = 0
    status: EnrollmentStatus = EnrollmentStatus.ACTIVE

class Enrollment(EnrollmentBase, table=True):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    student_id: str = Field(foreign_key="user.id")
    course_id: str = Field(foreign_key="course.id")
    enrolled_at: datetime = Field(default_factory=datetime.utcnow)

class EnrollmentCreate(SQLModel):
    student_id: str
    course_id: str

class EnrollmentRead(EnrollmentBase):
    id: str
    student_id: str
    course_id: str
    enrolled_at: datetime

