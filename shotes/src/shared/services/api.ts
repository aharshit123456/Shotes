const API_BASE = 'http://localhost:8000/api/v1';

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },
};

// Dashboard APIs
export const getStudentActivities = (studentId: string) =>
  api.get<any[]>(`/dashboard/activities/${studentId}`);

export const getStudentGrades = (studentId: string) =>
  api.get<any[]>(`/dashboard/grades/${studentId}`);

export const updateGrade = (gradeId: string, gradeData: any) =>
  api.put<any>(`/grades/${gradeId}`, gradeData);

export const getTopScores = (studentId: string) =>
  api.get<any[]>(`/dashboard/scores/${studentId}`);

// Courses APIs
export const getCourses = () => api.get<any[]>('/courses');
export const getCourse = (id: string) => api.get<any>(`/courses/${id}`);

// Enrollments APIs
export const getStudentEnrollments = (studentId: string) =>
  api.get<any[]>(`/enrollments/student/${studentId}`);

export const enrollInCourse = (studentId: string, courseId: string) =>
  api.post<any>('/enrollments', { student_id: studentId, course_id: courseId });

// Classes APIs
export const getCourseClasses = (courseId: string) =>
  api.get<any[]>(`/classes/course/${courseId}`);

export const getLiveClasses = (courseId: string) =>
  api.get<any[]>(`/classes/live/${courseId}`);

// Tests APIs
export const getCourseTests = (courseId: string) =>
  api.get<any[]>(`/tests/course/${courseId}`);

