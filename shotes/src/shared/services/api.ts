// Resolve backend base URL from environment with sensible defaults.
// Supports values like:
// - https://example.com
// - https://example.com/api/v1
// - https://example.com/health (will be normalized to root)
const RAW_BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://shotes.onrender.com';

function normalizeHttpBase(raw: string): string {
  let base = raw.trim();
  // Remove trailing slash
  if (base.endsWith('/')) base = base.slice(0, -1);
  // If pointing to health endpoint, strip it to get root
  if (base.endsWith('/health')) base = base.slice(0, -('/health'.length));
  // If it already includes /api/v1, keep as-is
  if (base.endsWith('/api/v1')) return base;
  // If it ends with /api (without version), append version segment
  if (base.endsWith('/api')) return `${base}/v1`;
  // Otherwise, append api prefix
  return `${base}/api/v1`;
}

export const API_HTTP_BASE = normalizeHttpBase(RAW_BACKEND_URL);

function toWsBase(httpBase: string): string {
  // Transform http(s) to ws(s) and strip any path after host to build ws root
  try {
    const url = new URL(httpBase);
    const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProtocol}//${url.host}`;
  } catch (_) {
    // Fallback: naive replace
    return httpBase.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
  }
}

export const WS_BASE = toWsBase(API_HTTP_BASE);

// Domain types
export interface Course {
  id: string;
  title: string;
  subject: string;
  description?: string;
  modules_count?: number;
  teacher_id?: string;
  is_published?: boolean;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
}

export interface Grade {
  id: string;
  student_id: string;
  course_id: string;
  grade_letter: string;
  percentage: number;
}

export interface GradeInput {
  student_id: string;
  course_id: string;
  enrollment_id: string;
  grade_letter: string;
  percentage: number;
}

export interface MessageDTO {
  id: string;
  author: string;
  text: string;
  timestamp: string | number;
}

export interface Activity {
  id: string;
  activity_type: string;
  title: string;
  message: string;
  created_at: string;
}

export interface TopScore {
  id: string;
  score: number;
  percentage: number;
}

export interface ClassSessionDTO {
  id: string;
  status: string;
  scheduled_start: string;
  scheduled_end: string;
}

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_HTTP_BASE}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_HTTP_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_HTTP_BASE}${endpoint}`, {
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
  api.get<Activity[]>(`/dashboard/activities/${studentId}`);

export const getStudentGrades = (studentId: string) =>
  api.get<Grade[]>(`/dashboard/grades/${studentId}`);

export const updateGrade = (gradeId: string, gradeData: GradeInput) =>
  api.put<Grade>(`/grades/${gradeId}`, gradeData);

export const getTopScores = (studentId: string) =>
  api.get<TopScore[]>(`/dashboard/scores/${studentId}`);

// Courses APIs
export const getCourses = () => api.get<Course[]>('/courses');
export const getCourse = (id: string) => api.get<Course>(`/courses/${id}`);

// Enrollments APIs
export const getStudentEnrollments = (studentId: string) =>
  api.get<Enrollment[]>(`/enrollments/student/${studentId}`);

export const enrollInCourse = (studentId: string, courseId: string) =>
  api.post<Enrollment>('/enrollments', { student_id: studentId, course_id: courseId });

// Classes APIs
export const getCourseClasses = (courseId: string) =>
  api.get<ClassSessionDTO[]>(`/classes/course/${courseId}`);

export const getLiveClasses = (courseId: string) =>
  api.get<ClassSessionDTO[]>(`/classes/live/${courseId}`);

// Tests APIs
export const getCourseTests = (courseId: string) =>
  api.get<Record<string, unknown>[]>(`/tests/course/${courseId}`);

