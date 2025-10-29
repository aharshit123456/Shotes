from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session, select
from contextlib import asynccontextmanager
import json
from typing import Dict, List
from datetime import datetime
import uuid

from app.models import Message, MessageCreate, MessageType
import app.models.user
from app.db.session import engine
from app.api.v1 import courses, enrollments, activities, tests, grades, users, classes, dashboard, auth

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_to_room(self, message: str, room_id: str):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                try:
                    await connection.send_text(message)
                except:
                    # Remove dead connections
                    self.active_connections[room_id].remove(connection)

manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    SQLModel.metadata.create_all(bind=engine)
    yield
    # Shutdown
    pass

app = FastAPI(
    title="Shotes API",
    description="Backend for Shotes educational platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
# CORS: explicitly allow development and production frontends.
# Note: when allow_credentials=True, FastAPI disallows '*' for allow_origins.
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "capacitor://localhost",
    "ionic://localhost",
    "https://shotes.onrender.com",
    "https://shotes-9vw6.vercel.app/"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(courses.router, prefix="/api/v1")
app.include_router(enrollments.router, prefix="/api/v1")
app.include_router(activities.router, prefix="/api/v1")
app.include_router(tests.router, prefix="/api/v1")
app.include_router(grades.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(classes.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Shotes API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.websocket("/ws/chat/{room_id}")
async def websocket_chat(websocket: WebSocket, room_id: str):
    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Create message in database
            with Session(engine) as session:
                message = Message(
                    id=str(uuid.uuid4()),
                    room_id=room_id,
                    sender_id=message_data.get("sender_id", ""),
                    text=message_data.get("text", ""),
                    message_type=MessageType(message_data.get("message_type", "course_chat"))
                )
                session.add(message)
                session.commit()
                
                # Get sender info for response
                sender = session.get(app.models.user.User, message.sender_id)
                author_name = sender.full_name if sender else "Anonymous"
                
                # Broadcast to all connections in room
                response = {
                    "type": "message",
                    "payload": {
                        "id": message.id,
                        "sender_id": message.sender_id,
                        "author": author_name,
                        "text": message.text,
                        "timestamp": message.created_at.isoformat()
                    }
                }
                await manager.broadcast_to_room(json.dumps(response), room_id)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)

@app.websocket("/ws/rtc/{class_id}")
async def websocket_rtc_signalling(websocket: WebSocket, class_id: str):
    """WebRTC signalling for live class video streaming"""
    await manager.connect(websocket, f"rtc_{class_id}")
    try:
        while True:
            data = await websocket.receive_text()
            # Relay SDP/ICE candidate messages between peers
            await manager.broadcast_to_room(data, f"rtc_{class_id}")
    except WebSocketDisconnect:
        manager.disconnect(websocket, f"rtc_{class_id}")

@app.get("/api/v1/messages/{room_id}")
async def get_messages(room_id: str, limit: int = 50):
    with Session(engine) as session:
        messages = session.exec(
            select(Message)
            .where(Message.room_id == room_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
        ).all()
        
        result = []
        for msg in messages:
            sender = session.get(app.models.user.User, msg.sender_id)
            result.append({
                "id": msg.id,
                "sender_id": msg.sender_id,
                "author": sender.full_name if sender else "Anonymous",
                "text": msg.text,
                "timestamp": msg.created_at.isoformat()
            })
        return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
