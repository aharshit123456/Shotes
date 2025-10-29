from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List
from app.db.session import get_session
from app.models.test import Test, TestCreate, TestRead

router = APIRouter(prefix="/tests", tags=["tests"])

@router.get("/course/{course_id}", response_model=List[TestRead])
def get_course_tests(course_id: str, session: Session = Depends(get_session)):
    tests = session.exec(
        select(Test).where(Test.course_id == course_id)
        .order_by(Test.scheduled_date.desc())
    ).all()
    return tests

@router.post("/", response_model=TestRead)
def create_test(test: TestCreate, session: Session = Depends(get_session)):
    db_test = Test(**test.dict())
    session.add(db_test)
    session.commit()
    session.refresh(db_test)
    return db_test

