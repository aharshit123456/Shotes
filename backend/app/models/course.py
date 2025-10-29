from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
import uuid

class CourseBase(SQLModel):
    title: str
    description: Optional[str] = None
    subject: str  # Maths, Physics, Chemistry, etc.
    modules_count: int = 0
    is_published: bool = False

class Course(CourseBase, table=True):
    id: Optional[str] = Field(default=None, primary_key=True)
    teacher_id: str = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships would go here if we set them up
    # teacher: User = Relationship()
    # enrollments: List["Enrollment"] = Relationship()
    # classes: List["Class"] = Relationship()
    # tests: List["Test"] = Relationship()

class CourseCreate(CourseBase):
    teacher_id: str

class CourseRead(CourseBase):
    id: str
    teacher_id: str
    created_at: datetime
    updated_at: datetime

