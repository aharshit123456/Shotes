from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum
import uuid

class MessageType(str, Enum):
    COURSE_CHAT = "course_chat"
    CLASS_CHAT = "class_chat"

class MessageBase(SQLModel):
    room_id: str  # course_id or class_id
    text: str
    message_type: MessageType = MessageType.COURSE_CHAT

class Message(MessageBase, table=True):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    sender_id: str = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MessageCreate(SQLModel):
    room_id: str
    sender_id: str
    text: str
    message_type: MessageType = MessageType.COURSE_CHAT

class MessageRead(MessageBase):
    id: str
    sender_id: str
    created_at: datetime
