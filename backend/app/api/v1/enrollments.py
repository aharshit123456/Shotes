from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from app.db.session import get_session
from app.models.enrollment import Enrollment, EnrollmentCreate, EnrollmentRead

router = APIRouter(prefix="/enrollments", tags=["enrollments"])

@router.post("/", response_model=EnrollmentRead)
def create_enrollment(enrollment: EnrollmentCreate, session: Session = Depends(get_session)):
    db_enrollment = Enrollment(**enrollment.dict())
    session.add(db_enrollment)
    session.commit()
    session.refresh(db_enrollment)
    return db_enrollment

@router.get("/student/{student_id}", response_model=List[EnrollmentRead])
def get_student_enrollments(student_id: str, session: Session = Depends(get_session)):
    enrollments = session.exec(select(Enrollment).where(Enrollment.student_id == student_id)).all()
    return enrollments

@router.get("/course/{course_id}", response_model=List[EnrollmentRead])
def get_course_enrollments(course_id: str, session: Session = Depends(get_session)):
    enrollments = session.exec(select(Enrollment).where(Enrollment.course_id == course_id)).all()
    return enrollments

