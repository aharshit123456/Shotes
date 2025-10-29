import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonChip, IonItem, IonAvatar, IonLabel, IonButton } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { getStudentEnrollments, getCourseClasses, getLiveClasses } from '../shared/services/api';
import { getCourses } from '../shared/services/api';

const STUDENT_ID = 'student1';

const Classes: React.FC = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [currentClasses, setCurrentClasses] = useState<any[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const loadData = async () => {
      try {
        const enrolls = await getStudentEnrollments(STUDENT_ID).catch(() => []);
        setEnrollments(enrolls);
        
        // Get unique subjects
        const subjectSet = new Set<string>();
        for (const enroll of enrolls) {
          const course = await getCourses().then(courses => 
            courses.find((c: any) => c.id === enroll.course_id)
          ).catch(() => null);
          if (course) {
            subjectSet.add(course.subject);
          }
        }
        setSubjects(Array.from(subjectSet));

        // Get classes for enrolled courses
        const now = new Date();
        const allCurrent: any[] = [];
        const allUpcoming: any[] = [];

        for (const enroll of enrolls) {
          const classes = await getCourseClasses(enroll.course_id).catch(() => []);
          const course = await getCourses().then(courses => 
            courses.find((c: any) => c.id === enroll.course_id)
          ).catch(() => null);

          classes.forEach((cls: any) => {
            const scheduledStart = new Date(cls.scheduled_start);
            const scheduledEnd = new Date(cls.scheduled_end);
            
            if (cls.status === 'live' || (now >= scheduledStart && now <= scheduledEnd)) {
              allCurrent.push({ ...cls, course });
            } else if (scheduledStart > now) {
              allUpcoming.push({ ...cls, course });
            }
          });
        }

        setCurrentClasses(allCurrent.slice(0, 2));
        setUpcomingClasses(allUpcoming.slice(0, 2));
      } catch (error) {
        console.error('Failed to load classes data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return '#eb445a';
      case 'scheduled': return '#ffc409';
      default: return '#3880ff';
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + 
           ' - ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
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
          <h2 style={{ marginBottom: 12 }}>Current Classes</h2>
          {loading ? (
            <div>Loading...</div>
          ) : currentClasses.length > 0 ? (
            currentClasses.map((cls: any) => (
              <IonCard key={cls.id} style={{ marginBottom: 12 }}>
                <IonCardContent>
                  <IonItem lines="none">
                    <IonAvatar slot="start">
                      <div style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        background: '#ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {cls.course?.subject?.[0] || 'C'}
                      </div>
                    </IonAvatar>
                    <IonLabel>
                      <h3>{cls.course?.title || 'Unknown Course'}</h3>
                      <p>{formatTime(cls.scheduled_end)}</p>
                    </IonLabel>
                    <div slot="end" style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: getStatusColor(cls.status)
                    }} />
                  </IonItem>
                  {cls.status === 'live' && (
                    <IonButton expand="block" onClick={() => history.push(`/live/${cls.id}`)} style={{ marginTop: 12 }}>
                      Join Live Class
                    </IonButton>
                  )}
                </IonCardContent>
              </IonCard>
            ))
          ) : (
            <div style={{ padding: 16, textAlign: 'center', color: '#999' }}>No current classes</div>
          )}

          <h2 style={{ marginTop: 24, marginBottom: 12 }}>Upcoming Classes</h2>
          {upcomingClasses.length > 0 ? (
            upcomingClasses.map((cls: any) => (
              <IonCard key={cls.id} style={{ marginBottom: 12 }}>
                <IonCardContent>
                  <IonItem lines="none">
                    <IonAvatar slot="start">
                      <div style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        background: '#ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {cls.course?.subject?.[0] || 'C'}
                      </div>
                    </IonAvatar>
                    <IonLabel>
                      <h3>{cls.course?.title || 'Unknown Course'}</h3>
                      <p>{formatTime(cls.scheduled_start)}</p>
                    </IonLabel>
                    <div slot="end" style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: getStatusColor(cls.status)
                    }} />
                  </IonItem>
                </IonCardContent>
              </IonCard>
            ))
          ) : (
            <div style={{ padding: 16, textAlign: 'center', color: '#999' }}>No upcoming classes</div>
          )}

          <h2 style={{ marginTop: 24, marginBottom: 12 }}>Subjects you have subscribed to</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {subjects.map((subject, idx) => (
              <IonChip key={idx} style={{
                background: idx % 2 === 0 ? 'var(--ion-color-primary)' : 'var(--ion-color-warning)'
              }}>
                {subject}
              </IonChip>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Classes;
