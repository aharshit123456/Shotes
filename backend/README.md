# Shotes Backend API

FastAPI backend with SQLite database for the Shotes educational platform.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Seed the database with demo data:
```bash
python seed_data.py
```

This will create:
- 3 teachers and 1 student
- Multiple courses (Maths, Physics, Chemistry)
- Enrollments, activities, classes, tests, grades, and scores

## Run Server

```bash
python run.py
```

Server runs on `http://localhost:8000`

## API Endpoints

### Users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users/{user_id}` - Get user

### Courses
- `GET /api/v1/courses` - List all courses
- `GET /api/v1/courses/{course_id}` - Get course
- `POST /api/v1/courses` - Create course
- `GET /api/v1/courses/teacher/{teacher_id}` - Get teacher's courses

### Enrollments
- `POST /api/v1/enrollments` - Enroll student in course
- `GET /api/v1/enrollments/student/{student_id}` - Get student enrollments
- `GET /api/v1/enrollments/course/{course_id}` - Get course enrollments

### Classes (Live Sessions)
- `GET /api/v1/classes/course/{course_id}` - Get course classes
- `POST /api/v1/classes` - Create class
- `GET /api/v1/classes/live/{course_id}` - Get live classes
- `POST /api/v1/classes/{class_id}/start` - Start a class

### Activities
- `GET /api/v1/activities/course/{course_id}` - Get course activities
- `POST /api/v1/activities` - Create activity

### Tests
- `GET /api/v1/tests/course/{course_id}` - Get course tests
- `POST /api/v1/tests` - Create test

### Grades
- `GET /api/v1/grades/student/{student_id}` - Get student grades
- `POST /api/v1/grades` - Create grade

### Dashboard
- `GET /api/v1/dashboard/activities/{student_id}` - Get student activities
- `GET /api/v1/dashboard/grades/{student_id}` - Get student grades
- `GET /api/v1/dashboard/scores/{student_id}` - Get top scores
- `GET /api/v1/dashboard/enrollments/{student_id}` - Get enrollments

### WebSockets
- `WS /ws/chat/{room_id}` - Chat room (room_id = course_id or class_id)
- `WS /ws/rtc/{class_id}` - WebRTC signalling for live video

## Database Schema

See `docs/ER_MODEL.md` for complete entity relationship model.

Key entities:
- **User** (teachers and students)
- **Course** (created by teachers)
- **Enrollment** (student course enrollments)
- **Class** (live class sessions with WebRTC)
- **Activity** (announcements, homework, reminders)
- **Test** (assessments)
- **TestScore** (student test results)
- **Grade** (course grades)
- **Message** (chat messages)

## Demo User IDs

After seeding:
- Student: `student1` (Harshit Agarwal)
- Teachers: `teacher1`, `teacher2`, `teacher3`

