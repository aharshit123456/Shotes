import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonButton, IonAvatar } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { getStudentGrades, getTopScores } from '../shared/services/api';
import { getStudentEnrollments } from '../shared/services/api';
import { useAuthStore } from '../shared/state/authStore';

const Profile: React.FC = () => {
  const { user, logout } = useAuthStore();
  const history = useHistory();
  const [grades, setGrades] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const STUDENT_ID = user?.id || 'student1';

  useEffect(() => {
    const loadData = async () => {
      try {
        const [grds, scrs, enrolls] = await Promise.all([
          getStudentGrades(STUDENT_ID).catch(() => []),
          getTopScores(STUDENT_ID).catch(() => []),
          getStudentEnrollments(STUDENT_ID).catch(() => []),
        ]);
        setGrades(grds);
        setScores(scrs);
        setEnrollments(enrolls);
      } catch (error) {
        console.error('Failed to load profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalTopics = enrollments.reduce((sum, e) => sum + (e.topics_completed || 0), 0);
  const totalClasses = enrollments.length;
  const followers = 122; // Mock data

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Harshit Agarwal</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: 16 }}>
          <IonCard>
            <IonCardContent style={{ textAlign: 'center', padding: '20px' }}>
              <IonAvatar style={{ width: 80, height: 80, margin: '0 auto 16px', background: '#ddd' }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: '#3880ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  color: 'white'
                }}>
                  HA
                </div>
              </IonAvatar>
              <h2 style={{ margin: '8px 0' }}>{user?.full_name || 'Harshit Agarwal'}</h2>
              <p style={{ color: '#666', marginBottom: '16px' }}>@{user?.username || 'aharshit123456'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{totalTopics}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Topics Completed</div>
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{totalClasses}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Classes</div>
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{followers}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Followers</div>
                </div>
              </div>
              <IonButton expand="block" fill="outline">Edit Profile</IonButton>
              <IonButton 
                expand="block" 
                fill="outline" 
                color="danger" 
                onClick={() => { logout(); history.push('/login'); }}
                style={{ marginTop: 12 }}
              >
                Logout
              </IonButton>
            </IonCardContent>
          </IonCard>

          <h2 style={{ marginTop: 24, marginBottom: 12 }}>Previous Grades</h2>
          {loading ? (
            <div>Loading...</div>
          ) : grades.length > 0 ? (
            <IonCard>
              <IonCardContent>
                {grades.map((g: any) => (
                  <IonItem key={g.id} lines="none" style={{ marginBottom: 8 }}>
                    <IonLabel>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>{g.grade_letter || 'N/A'}</span>
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

export default Profile;
