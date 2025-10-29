# FastAPI Backend Plan

- Stack: FastAPI, SQLModel (Postgres), Alembic, Redis, Uvicorn, Pydantic v2
- Auth: JWT (access/refresh), Google OAuth
- Services: users, profiles, courses, classes, tests
- Chat: WebSocket `/ws/chat/{classId}` with Redis pub/sub, persist to `messages`
- WebRTC signalling: WebSocket `/ws/rtc/{classId}` exchanging `{type, sdp, candidate, peerId}`
- Roles: student, teacher, admin
- Structure:
  - `app/main.py` app factory
  - `app/api/v1/*` routers
  - `app/db/session.py`, `app/db/init_db.py`
  - `app/models/*`, `app/schemas/*`, `app/services/*`
  - `app/ws/chat.py`, `app/ws/signalling.py`
- Tests: pytest + httpx + websockets
- CI: GitHub Actions running unit + ws tests
