from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from app.db.session import get_session
from app.models.course import Course, CourseCreate, CourseRead

router = APIRouter(prefix="/courses", tags=["courses"])

@router.get("/", response_model=List[CourseRead])
def get_courses(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    courses = session.exec(select(Course).offset(skip).limit(limit)).all()
    return courses

@router.get("/{course_id}", response_model=CourseRead)
def get_course(course_id: str, session: Session = Depends(get_session)):
    course = session.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.post("/", response_model=CourseRead)
def create_course(course: CourseCreate, session: Session = Depends(get_session)):
    db_course = Course(**course.dict())
    session.add(db_course)
    session.commit()
    session.refresh(db_course)
    return db_course

@router.get("/teacher/{teacher_id}", response_model=List[CourseRead])
def get_teacher_courses(teacher_id: str, session: Session = Depends(get_session)):
    courses = session.exec(select(Course).where(Course.teacher_id == teacher_id)).all()
    return courses

