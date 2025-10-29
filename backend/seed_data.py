"""Seed script to populate database with initial demo data"""
from sqlmodel import Session
from app.db.session import engine
from app.models.user import User, UserRole
from app.models.course import Course
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.class_session import Class, ClassStatus
from app.models.activity import Activity, ActivityType
from app.models.test import Test
from app.models.test_score import TestScore
from app.models.grade import Grade
from datetime import datetime, timedelta
import bcrypt

def seed():
    with Session(engine) as session:
        # Create teachers
        teacher1 = User(
            id="teacher1",
            email="jennifer.winget@shotes.com",
            full_name="Jennifer Winget",
            username="jwinget",
            role=UserRole.TEACHER,
            password_hash=bcrypt.hashpw("pass".encode(), bcrypt.gensalt()).decode(),
            avatar_url=None
        )
        
        teacher2 = User(
            id="teacher2",
            email="elizabeth@shotes.com",
            full_name="Elizabeth Quarantine",
            username="equarantine",
            role=UserRole.TEACHER,
            password_hash=bcrypt.hashpw("pass".encode(), bcrypt.gensalt()).decode(),
        )
        
        teacher3 = User(
            id="teacher3",
            email="suresh.mishra@shotes.com",
            full_name="Suresh Mishra",
            username="smishra",
            role=UserRole.TEACHER,
            password_hash=bcrypt.hashpw("pass".encode(), bcrypt.gensalt()).decode(),
        )
        
        # Create student
        student1 = User(
            id="student1",
            email="harshit@shotes.com",
            full_name="Harshit Agarwal",
            username="aharshit123456",
            role=UserRole.STUDENT,
            password_hash=bcrypt.hashpw("pass".encode(), bcrypt.gensalt()).decode(),
        )
        
        session.add_all([teacher1, teacher2, teacher3, student1])
        session.commit()
        
        # Create courses
        course1 = Course(
            id="course1",
            teacher_id="teacher1",
            title="Mathematics",
            description="Class XI - 16 Modules",
            subject="Maths",
            modules_count=16,
            is_published=True
        )
        
        course2 = Course(
            id="course2",
            teacher_id="teacher2",
            title="Physics",
            description="Class XI - 12 Modules",
            subject="Physics",
            modules_count=12,
            is_published=True
        )
        
        course3 = Course(
            id="course3",
            teacher_id="teacher1",
            title="Chemistry",
            description="Class XI - 14 Modules",
            subject="Chemistry",
            modules_count=14,
            is_published=True
        )
        
        session.add_all([course1, course2, course3])
        session.commit()
        
        # Enrollments
        enroll1 = Enrollment(
            id="enroll1",
            student_id="student1",
            course_id="course1",
            progress_percentage=75.0,
            topics_completed=60,
            status=EnrollmentStatus.ACTIVE
        )
        
        enroll2 = Enrollment(
            id="enroll2",
            student_id="student1",
            course_id="course2",
            progress_percentage=60.0,
            topics_completed=45,
            status=EnrollmentStatus.ACTIVE
        )
        
        session.add_all([enroll1, enroll2])
        session.commit()
        
        # Activities
        act1 = Activity(
            id="act1",
            course_id="course1",
            teacher_id="teacher1",
            title="Trigonometry Test Tomorrow!!!",
            message="Remember students, complete your homeworks before sleeping.",
            activity_type=ActivityType.REMINDER
        )
        act1.created_at = datetime.utcnow() - timedelta(hours=2)
        
        act2 = Activity(
            id="act2",
            course_id="course2",
            teacher_id="teacher2",
            title="Please Complete the three Equations of Motion",
            message="Homework assignment for this week.",
            activity_type=ActivityType.HOMEWORK
        )
        act2.created_at = datetime.utcnow() - timedelta(hours=1)
        
        act3 = Activity(
            id="act3",
            course_id="course3",
            teacher_id="teacher1",
            title="Remember students, complete your homeworks before sleeping",
            message="Important reminder for all students.",
            activity_type=ActivityType.ANNOUNCEMENT
        )
        act3.created_at = datetime.utcnow() - timedelta(hours=12)
        
        session.add_all([act1, act2, act3])
        session.commit()
        
        # Classes
        class1 = Class(
            id="class1",
            course_id="course1",
            teacher_id="teacher1",
            title="Mathematics Class",
            scheduled_start=datetime.utcnow() + timedelta(hours=2),
            scheduled_end=datetime.utcnow() + timedelta(hours=4),
            status=ClassStatus.SCHEDULED,
            webrtc_room_id="room_class1"
        )
        
        class2 = Class(
            id="class2",
            course_id="course2",
            teacher_id="teacher2",
            title="Physics Live",
            scheduled_start=datetime.utcnow(),
            scheduled_end=datetime.utcnow() + timedelta(hours=2),
            status=ClassStatus.LIVE,
            actual_start=datetime.utcnow() - timedelta(minutes=30),
            webrtc_room_id="room_class2"
        )
        
        session.add_all([class1, class2])
        session.commit()
        
        # Tests
        test1 = Test(
            id="test1",
            course_id="course1",
            title="Basics Of Chemistry - 2",
            scheduled_date=datetime.utcnow() + timedelta(days=5),
            duration_minutes=90,
            max_score=100
        )
        
        test2 = Test(
            id="test2",
            course_id="course2",
            title="Introduction to Mechanics",
            scheduled_date=datetime.utcnow() + timedelta(days=2),
            duration_minutes=60,
            max_score=100
        )
        
        session.add_all([test1, test2])
        session.commit()
        
        # Grades
        grade1 = Grade(
            id="grade1",
            enrollment_id="enroll1",
            course_id="course1",
            student_id="student1",
            grade_letter="A+",
            percentage=95.0
        )
        
        grade2 = Grade(
            id="grade2",
            enrollment_id="enroll1",
            course_id="course1",
            student_id="student1",
            grade_letter="A-",
            percentage=90.0
        )
        
        session.add_all([grade1, grade2])
        session.commit()
        
        # Test Scores
        score1 = TestScore(
            id="score1",
            test_id="test1",
            student_id="student1",
            score=88.0,
            max_score=100.0,
            percentage=88.0
        )
        
        session.add(score1)
        session.commit()
        
        print("✅ Database seeded successfully!")

if __name__ == "__main__":
    seed()

