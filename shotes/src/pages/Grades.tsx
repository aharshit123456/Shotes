import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonItem, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonToast, IonGrid, IonRow, IonCol } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { getCourses, getStudentEnrollments, getStudentGrades, updateGrade, type Course, type Enrollment, type Grade, type GradeInput } from '../shared/services/api';

// Add createGrade function to API service (using env-based backend URL)
const createGrade = async (gradeData: GradeInput) => {
  const { API_HTTP_BASE } = await import('../shared/services/api');
  return fetch(`${API_HTTP_BASE}/grades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gradeData),
  }).then(res => {
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  });
};

const TEACHER_ID = 'teacher1'; // TODO: Get from auth context

interface StudentGrade {
  id: string;
  student_id: string;
  student_name: string;
  course_id: string;
  course_title: string;
  grade_letter: string;
  percentage: number;
  enrollment_id: string;
}

const Grades: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const allCourses = await getCourses();
        // Filter courses taught by this teacher
        const teacherCourses = allCourses.filter((c) => c.teacher_id === TEACHER_ID);
        setCourses(teacherCourses);
        if (teacherCourses.length > 0) {
          setSelectedCourseId(teacherCourses[0].id);
        }
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadStudentGrades(selectedCourseId);
    }
  }, [selectedCourseId]);

  const loadStudentGrades = async (courseId: string) => {
    try {
      setLoading(true);
      const enrollments: Enrollment[] = await getStudentEnrollments(courseId);

      const gradesData: StudentGrade[] = [];

      for (const enrollment of enrollments) {
        try {
          const grades: Grade[] = await getStudentGrades(enrollment.student_id);
          const courseGrade = grades.find((g) => g.course_id === courseId);

          gradesData.push({
            id: courseGrade?.id || `temp_${enrollment.student_id}_${courseId}`,
            student_id: enrollment.student_id,
            student_name: `Student ${enrollment.student_id}`, // TODO: Get actual student name
            course_id: courseId,
            course_title: courses.find(c => c.id === courseId)?.title || 'Unknown Course',
            grade_letter: courseGrade?.grade_letter || '',
            percentage: courseGrade?.percentage || 0,
            enrollment_id: enrollment.id
          });
        } catch (error) {
          // Student has no grades yet
          gradesData.push({
            id: `new_${enrollment.student_id}_${courseId}`,
            student_id: enrollment.student_id,
            student_name: `Student ${enrollment.student_id}`, // TODO: Get actual student name
            course_id: courseId,
            course_title: courses.find(c => c.id === courseId)?.title || 'Unknown Course',
            grade_letter: '',
            percentage: 0,
            enrollment_id: enrollment.id
          });
        }
      }

      setStudentGrades(gradesData);
    } catch (error) {
      console.error('Failed to load student grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeUpdate = async (gradeId: string, enrollmentId: string, courseId: string, studentId: string, gradeLetter: string, percentage: number) => {
    try {
      const gradeData = {
        enrollment_id: enrollmentId,
        course_id: courseId,
        student_id: studentId,
        grade_letter: gradeLetter,
        percentage: parseFloat(percentage.toString())
      };

      if (gradeId.startsWith('new_') || gradeId.startsWith('temp_')) {
        // This is a new grade, create it
        await createGrade(gradeData);
        setToastMessage('Grade created successfully!');
      } else {
        // Update existing grade
        await updateGrade(gradeId, gradeData);
        setToastMessage('Grade updated successfully!');
      }

      setShowToast(true);

      // Refresh the data
      loadStudentGrades(selectedCourseId);
    } catch (error) {
      console.error('Failed to save grade:', error);
      setToastMessage('Failed to save grade. Please try again.');
      setShowToast(true);
    }
  };

  const updateStudentGrade = (index: number, field: 'grade_letter' | 'percentage', value: string | number) => {
    const updatedGrades = [...studentGrades];
    updatedGrades[index] = { ...updatedGrades[index], [field]: value };
    setStudentGrades(updatedGrades);
  };

  const getGradeColor = (grade: string) => {
    switch (grade.toUpperCase()) {
      case 'A+':
      case 'A':
        return '#10dc60';
      case 'A-':
      case 'B+':
        return '#ffc409';
      case 'B':
      case 'B-':
        return '#ff8c00';
      case 'C+':
      case 'C':
      case 'C-':
        return '#eb445a';
      default:
        return '#92949c';
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Grade Management</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: 16 }}>
          <h2 style={{ marginBottom: 16 }}>Update Student Grades</h2>

          <IonItem>
            <IonLabel position="stacked">Select Course</IonLabel>
            <IonSelect
              value={selectedCourseId}
              onIonChange={(e) => setSelectedCourseId((e as CustomEvent<{ value: string }>).detail.value)}
              placeholder="Choose a course"
            >
              {courses.map((course) => (
                <IonSelectOption key={course.id} value={course.id}>
                  {course.title}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          {loading ? (
            <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>
          ) : studentGrades.length > 0 ? (
            <div style={{ marginTop: 20 }}>
              <h3>{courses.find(c => c.id === selectedCourseId)?.title}</h3>
              {studentGrades.map((grade, index) => (
                <IonCard key={grade.student_id} style={{ marginBottom: 12 }}>
                  <IonCardContent>
                    <h4 style={{ marginBottom: 12 }}>{grade.student_name}</h4>

                    <IonGrid>
                      <IonRow>
                        <IonCol size="6">
                          <IonItem>
                            <IonLabel position="stacked">Grade Letter</IonLabel>
                            <IonSelect
                              value={grade.grade_letter}
                              onIonChange={(e) => updateStudentGrade(index, 'grade_letter', (e as CustomEvent<{ value: string }>).detail.value)}
                              placeholder="Select grade"
                            >
                              <IonSelectOption value="A+">A+</IonSelectOption>
                              <IonSelectOption value="A">A</IonSelectOption>
                              <IonSelectOption value="A-">A-</IonSelectOption>
                              <IonSelectOption value="B+">B+</IonSelectOption>
                              <IonSelectOption value="B">B</IonSelectOption>
                              <IonSelectOption value="B-">B-</IonSelectOption>
                              <IonSelectOption value="C+">C+</IonSelectOption>
                              <IonSelectOption value="C">C</IonSelectOption>
                              <IonSelectOption value="C-">C-</IonSelectOption>
                              <IonSelectOption value="D">D</IonSelectOption>
                              <IonSelectOption value="F">F</IonSelectOption>
                            </IonSelect>
                          </IonItem>
                        </IonCol>
                        <IonCol size="6">
                          <IonItem>
                            <IonLabel position="stacked">Percentage</IonLabel>
                            <IonInput
                              type="number"
                              value={grade.percentage}
                              onIonInput={(e) => updateStudentGrade(index, 'percentage', parseFloat(e.detail.value || '0'))}
                              placeholder="0-100"
                              min="0"
                              max="100"
                            />
                          </IonItem>
                        </IonCol>
                      </IonRow>
                    </IonGrid>

                    {grade.grade_letter && (
                      <div style={{
                        padding: '8px',
                        backgroundColor: getGradeColor(grade.grade_letter),
                        color: 'white',
                        borderRadius: '4px',
                        marginTop: 8,
                        textAlign: 'center',
                        fontWeight: 'bold'
                      }}>
                        {grade.grade_letter} ({grade.percentage}%)
                      </div>
                    )}

                    <IonButton
                      expand="block"
                      onClick={() => handleGradeUpdate(
                        grade.id,
                        grade.enrollment_id,
                        grade.course_id,
                        grade.student_id,
                        grade.grade_letter,
                        grade.percentage
                      )}
                      style={{ marginTop: 12 }}
                      disabled={!grade.grade_letter || grade.percentage < 0 || grade.percentage > 100}
                    >
                      {grade.id.startsWith('new_') || grade.id.startsWith('temp_') ? 'Create Grade' : 'Update Grade'}
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              ))}
            </div>
          ) : (
            <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>
              {selectedCourseId ? 'No students enrolled in this course' : 'Please select a course'}
            </div>
          )}
        </div>
      </IonContent>
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
      />
    </IonPage>
  );
};

export default Grades;
