from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List
from app.db.session import get_session
from app.models.activity import Activity, ActivityCreate, ActivityRead

router = APIRouter(prefix="/activities", tags=["activities"])

@router.get("/course/{course_id}", response_model=List[ActivityRead])
def get_course_activities(course_id: str, limit: int = 20, session: Session = Depends(get_session)):
    activities = session.exec(
        select(Activity)
        .where(Activity.course_id == course_id)
        .order_by(Activity.created_at.desc())
        .limit(limit)
    ).all()
    return activities

@router.post("/", response_model=ActivityRead)
def create_activity(activity: ActivityCreate, session: Session = Depends(get_session)):
    db_activity = Activity(**activity.dict())
    session.add(db_activity)
    session.commit()
    session.refresh(db_activity)
    return db_activity

