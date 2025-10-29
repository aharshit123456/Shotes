from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid

class GradeBase(SQLModel):
    grade_letter: str  # A+, A, A-, B+, B, etc.
    percentage: float
    semester: Optional[str] = None

class Grade(GradeBase, table=True):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    enrollment_id: str = Field(foreign_key="enrollment.id")
    course_id: str = Field(foreign_key="course.id")
    student_id: str = Field(foreign_key="user.id")
    calculated_at: datetime = Field(default_factory=datetime.utcnow)

class GradeCreate(SQLModel):
    enrollment_id: str
    course_id: str
    student_id: str
    grade_letter: str
    percentage: float
    semester: Optional[str] = None

class GradeRead(GradeBase):
    id: str
    enrollment_id: str
    course_id: str
    student_id: str
    calculated_at: datetime

