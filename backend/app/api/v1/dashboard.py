from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List, Dict
from datetime import datetime, timedelta
from app.db.session import get_session
from app.models.activity import Activity
from app.models.grade import Grade
from app.models.test_score import TestScore
from app.models.course import Course
from app.models.enrollment import Enrollment

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/activities/{student_id}")
async def get_student_activities(student_id: str, limit: int = 10, session: Session = Depends(get_session)):
    """Get recent activities from courses student is enrolled in"""
    # Get student's enrollments
    enrollments = session.exec(
        select(Enrollment).where(Enrollment.student_id == student_id)
    ).all()
    course_ids = [e.course_id for e in enrollments]
    
    if not course_ids:
        return []
    
    # Get recent activities from enrolled courses
    activities = session.exec(
        select(Activity)
        .where(Activity.course_id.in_(course_ids))
        .order_by(Activity.created_at.desc())
        .limit(limit)
    ).all()
    
    return activities

@router.get("/grades/{student_id}")
async def get_student_grades(student_id: str, session: Session = Depends(get_session)):
    """Get all grades for a student"""
    grades = session.exec(
        select(Grade).where(Grade.student_id == student_id)
        .order_by(Grade.calculated_at.desc())
    ).all()
    return grades

@router.get("/scores/{student_id}")
async def get_top_scores(student_id: str, limit: int = 5, session: Session = Depends(get_session)):
    """Get top test scores for a student"""
    scores = session.exec(
        select(TestScore).where(TestScore.student_id == student_id)
        .order_by(TestScore.percentage.desc())
        .limit(limit)
    ).all()
    return scores

@router.get("/enrollments/{student_id}")
async def get_student_enrollments(student_id: str, session: Session = Depends(get_session)):
    """Get student's enrolled courses with progress"""
    enrollments = session.exec(
        select(Enrollment).where(Enrollment.student_id == student_id)
    ).all()
    return enrollments
