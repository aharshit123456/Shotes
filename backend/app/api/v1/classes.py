from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List
from datetime import datetime
import uuid
from app.db.session import get_session
from app.models.class_session import Class, ClassCreate, ClassRead, ClassStatus

router = APIRouter(prefix="/classes", tags=["classes"])

@router.get("/course/{course_id}", response_model=List[ClassRead])
def get_course_classes(course_id: str, session: Session = Depends(get_session)):
    classes = session.exec(
        select(Class).where(Class.course_id == course_id)
        .order_by(Class.scheduled_start)
    ).all()
    return classes

@router.post("/", response_model=ClassRead)
def create_class(class_data: ClassCreate, session: Session = Depends(get_session)):
    webrtc_room_id = f"room_{uuid.uuid4()}"
    db_class = Class(
        **class_data.dict(),
        webrtc_room_id=webrtc_room_id,
        status=ClassStatus.SCHEDULED
    )
    session.add(db_class)
    session.commit()
    session.refresh(db_class)
    return db_class

@router.get("/live/{course_id}", response_model=List[ClassRead])
def get_live_classes(course_id: str, session: Session = Depends(get_session)):
    now = datetime.utcnow()
    classes = session.exec(
        select(Class).where(
            Class.course_id == course_id,
            Class.status == ClassStatus.LIVE
        )
    ).all()
    return classes

@router.post("/{class_id}/start", response_model=ClassRead)
def start_class(class_id: str, session: Session = Depends(get_session)):
    class_obj = session.get(Class, class_id)
    if not class_obj:
        raise HTTPException(status_code=404, detail="Class not found")
    class_obj.status = ClassStatus.LIVE
    class_obj.actual_start = datetime.utcnow()
    session.add(class_obj)
    session.commit()
    session.refresh(class_obj)
    return class_obj

