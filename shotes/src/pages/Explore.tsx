import { IonContent, IonHeader, IonPage, IonSearchbar, IonTitle, IonToolbar, IonCard, IonCardContent, IonItem, IonAvatar, IonLabel, IonButton, IonToast } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { getCourses, enrollInCourse, getStudentEnrollments, type Course, type Enrollment } from '../shared/services/api';

const STUDENT_ID = 'student1'; // TODO: Get from auth context

const Explore: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allCourses, enrollments] = await Promise.all([
          getCourses(),
          getStudentEnrollments(STUDENT_ID).catch(() => [] as Enrollment[])
        ]);

        setCourses(allCourses.filter((c) => !!c.is_published));

        // Track enrolled course IDs
        const enrolledIds = new Set(enrollments.map((e) => e.course_id));
        setEnrolledCourses(enrolledIds);
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEnroll = async (courseId: string, courseTitle: string) => {
    try {
      await enrollInCourse(STUDENT_ID, courseId);
      setEnrolledCourses(prev => new Set([...Array.from(prev), courseId]));
      setToastMessage(`Successfully enrolled in ${courseTitle}!`);
      setShowToast(true);
    } catch (error) {
      console.error('Failed to enroll:', error);
      setToastMessage('Failed to enroll in course. Please try again.');
      setShowToast(true);
    }
  };

  const getSubjectIcon = (subject: string) => {
    const icons: { [key: string]: string } = {
      'Maths': 'μ',
      'Physics': '⚛',
      'Chemistry': '⚗',
      'Architecture': '📐',
      'Python': '🐍',
      'Java': '☕',
    };
    return icons[subject] || '📚';
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Harshit Agarwal</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: 16 }}>
          <IonSearchbar
            placeholder="Search"
            value={searchTerm}
            onIonInput={(e) => setSearchTerm((e as CustomEvent<{ value?: string }>).detail.value || '')}
            style={{ marginBottom: 16 }}
          />
          {loading ? (
            <div>Loading...</div>
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <IonCard key={course.id} style={{ marginBottom: 12 }}>
                <IonCardContent>
                  <IonItem lines="none">
                    <IonAvatar slot="start" style={{
                      width: 48,
                      height: 48,
                      background: '#e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px'
                    }}>
                      {getSubjectIcon(course.subject)}
                    </IonAvatar>
                    <IonLabel>
                      <h3>{course.title}</h3>
                      <p>{course.description || `${course.subject} - ${course.modules_count} Modules`}</p>
                    </IonLabel>
                  </IonItem>
                  {enrolledCourses.has(course.id) ? (
                    <IonButton expand="block" disabled style={{ marginTop: 12 }}>
                      Already Enrolled
                    </IonButton>
                  ) : (
                    <IonButton
                      expand="block"
                      onClick={() => handleEnroll(course.id, course.title)}
                      style={{ marginTop: 12 }}
                    >
                      Enroll in Course
                    </IonButton>
                  )}
                </IonCardContent>
              </IonCard>
            ))
          ) : (
            <div style={{ padding: 16, textAlign: 'center', color: '#999' }}>
              {searchTerm ? 'No courses found' : 'No courses available'}
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

export default Explore;
