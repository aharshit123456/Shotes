from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List
from app.db.session import get_session
from app.models.grade import Grade, GradeCreate, GradeRead

router = APIRouter(prefix="/grades", tags=["grades"])

@router.get("/student/{student_id}", response_model=List[GradeRead])
def get_student_grades(student_id: str, session: Session = Depends(get_session)):
    grades = session.exec(
        select(Grade).where(Grade.student_id == student_id)
        .order_by(Grade.calculated_at.desc())
    ).all()
    return grades

@router.post("/", response_model=GradeRead)
def create_grade(grade: GradeCreate, session: Session = Depends(get_session)):
    db_grade = Grade(**grade.dict())
    session.add(db_grade)
    session.commit()
    session.refresh(db_grade)
    return db_grade

@router.put("/{grade_id}", response_model=GradeRead)
def update_grade(grade_id: str, grade_update: GradeCreate, session: Session = Depends(get_session)):
    grade = session.get(Grade, grade_id)
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")

    for field, value in grade_update.dict(exclude_unset=True).items():
        setattr(grade, field, value)

    session.commit()
    session.refresh(grade)
    return grade

