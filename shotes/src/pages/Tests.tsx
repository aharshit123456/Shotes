import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonItem, IonLabel, IonChip } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { getStudentEnrollments } from '../shared/services/api';
import { getCourseTests } from '../shared/services/api';
import { getCourses } from '../shared/services/api';

const STUDENT_ID = 'student1';

const Tests: React.FC = () => {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const enrolls = await getStudentEnrollments(STUDENT_ID).catch(() => []);
        const allTests: any[] = [];

        for (const enroll of enrolls) {
          const courseTests = await getCourseTests(enroll.course_id).catch(() => []);
          const course = await getCourses().then(courses => 
            courses.find((c: any) => c.id === enroll.course_id)
          ).catch(() => null);
          
          courseTests.forEach((test: any) => {
            allTests.push({ ...test, course });
          });
        }

        // Sort by scheduled date
        allTests.sort((a, b) => 
          new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
        );

        setTests(allTests);
      } catch (error) {
        console.error('Failed to load tests data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getSubjectColor = (subject?: string) => {
    switch (subject?.toLowerCase()) {
      case 'maths': return '#eb445a';
      case 'physics': return '#ffc409';
      case 'chemistry': return '#3880ff';
      default: return '#92949c';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
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
          <h2 style={{ marginBottom: 12 }}>Online Tests</h2>
          {loading ? (
            <div>Loading...</div>
          ) : tests.length > 0 ? (
            tests.map((test: any) => (
              <IonCard key={test.id} style={{ marginBottom: 12 }}>
                <IonCardContent>
                  <IonItem lines="none">
                    <div slot="start" style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: getSubjectColor(test.course?.subject),
                      marginRight: 12
                    }} />
                    <IonLabel>
                      <h3>{test.title}</h3>
                      <p>{formatDate(test.scheduled_date)}</p>
                    </IonLabel>
                  </IonItem>
                </IonCardContent>
              </IonCard>
            ))
          ) : (
            <div style={{ padding: 16, textAlign: 'center', color: '#999' }}>No tests scheduled</div>
          )}

          <h2 style={{ marginTop: 24, marginBottom: 12 }}>Student Statistics</h2>
          <IonCard>
            <IonCardContent style={{ padding: '20px' }}>
              <div style={{ height: 120, display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                {[60, 75, 70, 80, 85].map((val, idx) => (
                  <div key={idx} style={{
                    flex: 1,
                    height: `${val}%`,
                    background: 'linear-gradient(to top, #3880ff, #50c8ff)',
                    borderRadius: '4px 4px 0 0',
                    minHeight: 20
                  }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 8, fontSize: '12px', color: '#666' }}>
                {['Mar', 'Apr', 'May', 'Jun', 'Jul'].map(month => (
                  <span key={month}>{month}</span>
                ))}
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tests;
