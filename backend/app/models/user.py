from sqlmodel import SQLModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime

class UserRole(str, Enum):
    TEACHER = "teacher"
    STUDENT = "student"

class UserBase(SQLModel):
    email: str
    full_name: str
    username: str
    role: UserRole
    avatar_url: Optional[str] = None

class User(UserBase, table=True):
    id: Optional[str] = Field(default=None, primary_key=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime

