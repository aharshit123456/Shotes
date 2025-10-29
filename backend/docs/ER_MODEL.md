# Entity Relationship Model for Shotes Platform

## Core Entities

### 1. User
- id (PK, UUID)
- email (unique)
- password_hash
- full_name
- username (unique)
- role (teacher/student)
- avatar_url
- created_at
- updated_at

### 2. Course
- id (PK, UUID)
- teacher_id (FK -> User)
- title
- description
- subject (e.g., Maths, Physics, Chemistry)
- modules_count
- is_published
- created_at
- updated_at

### 3. Enrollment
- id (PK, UUID)
- student_id (FK -> User)
- course_id (FK -> Course)
- enrolled_at
- progress_percentage
- topics_completed
- status (active/completed/dropped)

### 4. Class/Session (Live Class)
- id (PK, UUID)
- course_id (FK -> Course)
- teacher_id (FK -> User)
- title
- scheduled_start
- scheduled_end
- actual_start
- actual_end
- status (scheduled/live/ended)
- webrtc_room_id (unique)

### 5. ClassAttendance
- id (PK, UUID)
- class_id (FK -> Class)
- student_id (FK -> User)
- joined_at
- left_at
- duration_minutes

### 6. Activity/Announcement
- id (PK, UUID)
- course_id (FK -> Course)
- teacher_id (FK -> User)
- title
- message
- activity_type (announcement/homework/reminder)
- created_at

### 7. Test/Assessment
- id (PK, UUID)
- course_id (FK -> Course)
- title
- description
- scheduled_date
- duration_minutes
- max_score
- created_at

### 8. TestScore
- id (PK, UUID)
- test_id (FK -> Test)
- student_id (FK -> User)
- score
- max_score
- percentage
- submitted_at
- graded_at

### 9. Grade (Course Grade)
- id (PK, UUID)
- enrollment_id (FK -> Enrollment)
- course_id (FK -> Course)
- student_id (FK -> User)
- grade_letter (A+, A, A-, B+, etc.)
- percentage
- semester/term
- calculated_at

### 10. Message (Chat)
- id (PK, UUID)
- room_id (course_id or class_id)
- sender_id (FK -> User)
- text
- message_type (course_chat/class_chat)
- created_at

### 11. Progress (Topic Progress)
- id (PK, UUID)
- enrollment_id (FK -> Enrollment)
- topic_name
- status (not_started/in_progress/completed)
- completed_at
- score

## Relationships

```
User (1) ----< (M) Course
User (Teacher) creates Courses

User (1) ----< (M) Enrollment ----< (M) Course
Students enroll in Courses

Course (1) ----< (M) Class
Courses have live class sessions

Class (1) ----< (M) ClassAttendance ----< (M) User (Student)
Students attend live classes

Course (1) ----< (M) Activity
Courses have activities/announcements

Course (1) ----< (M) Test
Courses have tests/assessments

Test (1) ----< (M) TestScore ----< (M) User (Student)
Students take tests and get scores

Enrollment (1) ----< (M) Grade
Students receive grades for courses

Course (1) ----< (M) Message
Courses have chat rooms

User (1) ----< (M) Message
Users send messages
```

## Key Features

1. **Role-based access**: Teachers create courses, students enroll
2. **Progress tracking**: Students see their progress and grades
3. **Live classes**: WebRTC rooms per class session
4. **Chat**: Per-course and per-class chat rooms
5. **Activity feed**: Dashboard shows recent activities
6. **Grades & Scores**: Complete assessment and grading system
7. **Social features**: Students can see peer progress (anonymized)

