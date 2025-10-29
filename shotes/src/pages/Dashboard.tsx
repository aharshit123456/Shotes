import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { getStudentActivities, getStudentGrades, getTopScores } from '../shared/services/api';

const STUDENT_ID = 'student1'; // TODO: Get from auth context

const Dashboard: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [acts, grds, scrs] = await Promise.all([
          getStudentActivities(STUDENT_ID).catch(() => []),
          getStudentGrades(STUDENT_ID).catch(() => []),
          getTopScores(STUDENT_ID).catch(() => []),
        ]);
        setActivities(acts.slice(0, 3));
        setGrades(grds.slice(0, 4));
        setScores(scrs.slice(0, 2));
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'reminder': return '#eb445a';
      case 'homework': return '#ffc409';
      case 'announcement': return '#3880ff';
      default: return '#92949c';
    }
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
          <h2 style={{ marginBottom: 12 }}>New Activity</h2>
          {loading ? (
            <div>Loading...</div>
          ) : activities.length > 0 ? (
            activities.map((act: any) => (
              <IonCard key={act.id} style={{ marginBottom: 12 }}>
                <IonCardHeader>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: getActivityColor(act.activity_type)
                    }} />
                    <IonCardTitle style={{ fontSize: '16px' }}>{act.title}</IonCardTitle>
                  </div>
                </IonCardHeader>
                <IonCardContent>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: 4 }}>
                    {act.message}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {new Date(act.created_at).toLocaleDateString()}
                  </div>
                </IonCardContent>
              </IonCard>
            ))
          ) : (
            <div style={{ padding: 16, textAlign: 'center', color: '#999' }}>
              No recent activities
            </div>
          )}

          <h2 style={{ marginTop: 24, marginBottom: 12 }}>Previous Grades</h2>
          {grades.length > 0 ? (
            <IonCard>
              <IonCardContent>
                {grades.map((g: any) => (
                  <IonItem key={g.id} lines="none" style={{ marginBottom: 8 }}>
                    <IonLabel>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{g.grade_letter || 'N/A'}</span>
                        <div style={{ flex: 1, height: 8, background: '#e0e0e0', borderRadius: 4, margin: '0 16px' }}>
                          <div style={{
                            height: '100%',
                            width: `${g.percentage || 0}%`,
                            background: '#3880ff',
                            borderRadius: 4
                          }} />
                        </div>
                        <span style={{ fontSize: '14px' }}>{g.percentage?.toFixed(0)}%</span>
                      </div>
                    </IonLabel>
                  </IonItem>
                ))}
              </IonCardContent>
            </IonCard>
          ) : (
            <div style={{ padding: 16, textAlign: 'center', color: '#999' }}>No grades yet</div>
          )}

          <h2 style={{ marginTop: 24, marginBottom: 12 }}>Highest Scores</h2>
          {scores.length > 0 ? (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {scores.map((s: any) => (
                <IonCard key={s.id} style={{ flex: '1 1 40%', minWidth: 150 }}>
                  <IonCardContent style={{ textAlign: 'center', padding: '20px 16px' }}>
                    <div style={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: s.percentage >= 80 ? '#2dd36f' : s.percentage >= 60 ? '#ffc409' : '#eb445a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: 'white'
                    }}>
                      {s.score?.toFixed(0)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Test Score</div>
                  </IonCardContent>
                </IonCard>
              ))}
            </div>
          ) : (
            <div style={{ padding: 16, textAlign: 'center', color: '#999' }}>No scores yet</div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
