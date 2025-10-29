from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid

class TestScoreBase(SQLModel):
    score: float
    max_score: float
    percentage: float

class TestScore(TestScoreBase, table=True):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    test_id: str = Field(foreign_key="test.id")
    student_id: str = Field(foreign_key="user.id")
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    graded_at: Optional[datetime] = None

class TestScoreCreate(SQLModel):
    test_id: str
    student_id: str
    score: float
    max_score: float
    percentage: float

class TestScoreRead(TestScoreBase):
    id: str
    test_id: str
    student_id: str
    submitted_at: datetime
    graded_at: Optional[datetime]

