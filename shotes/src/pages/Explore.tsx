import { IonContent, IonHeader, IonPage, IonSearchbar, IonTitle, IonToolbar, IonCard, IonCardContent, IonItem, IonAvatar, IonLabel } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { getCourses } from '../shared/services/api';

const Explore: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const allCourses = await getCourses();
        setCourses(allCourses.filter((c: any) => c.is_published));
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredCourses = courses.filter((course: any) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            onIonInput={(e) => setSearchTerm(e.detail.value || '')}
            style={{ marginBottom: 16 }}
          />
          {loading ? (
            <div>Loading...</div>
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((course: any) => (
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
    </IonPage>
  );
};

export default Explore;
