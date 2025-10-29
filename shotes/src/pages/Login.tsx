import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonPage, IonIcon, IonText } from '@ionic/react';
import { logIn, personAdd } from 'ionicons/icons';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../shared/state/authStore';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  
  const { login, register } = useAuthStore();
  const history = useHistory();

  console.log('Login component rendering');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!fullName || !username) {
          setError('Please fill all fields');
          return;
        }
        await register(email, password, fullName, username, role);
      }
      history.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  console.log('Login component rendering, isLogin:', isLogin);
  
  return (
    <div style={{ background: 'white', minHeight: '100vh', padding: 20 }}>
      <h1 style={{ textAlign: 'center', marginBottom: 32, color: 'black' }}>Shotes Login</h1>
      <p style={{ color: 'black', textAlign: 'center' }}>Login component is rendering!</p>
          
          <div style={{ display: 'flex', marginBottom: 24, border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>
            <button
              onClick={() => setIsLogin(true)}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                background: isLogin ? '#3880ff' : '#f4f5f8',
                color: isLogin ? 'white' : '#666',
                cursor: 'pointer'
              }}
            >
              <IonIcon icon={logIn} style={{ marginRight: 8 }} />
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                background: !isLogin ? '#3880ff' : '#f4f5f8',
                color: !isLogin ? 'white' : '#666',
                cursor: 'pointer'
              }}
            >
              <IonIcon icon={personAdd} style={{ marginRight: 8 }} />
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ marginTop: 32 }}>
            {!isLogin && (
              <>
                <IonItem>
                  <IonLabel position="stacked">Full Name</IonLabel>
                  <IonInput
                    type="text"
                    value={fullName}
                    onIonChange={(e) => setFullName(e.detail.value!)}
                    required={!isLogin}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Username</IonLabel>
                  <IonInput
                    type="text"
                    value={username}
                    onIonChange={(e) => setUsername(e.detail.value!)}
                    required={!isLogin}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Role</IonLabel>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'teacher' | 'student')}
                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </IonItem>
              </>
            )}
            
            <IonItem>
              <IonLabel position="stacked">Email</IonLabel>
              <IonInput
                type="email"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value!)}
                required
              />
            </IonItem>
            
            <IonItem>
              <IonLabel position="stacked">Password</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value!)}
                required
              />
            </IonItem>

            {error && (
              <IonText color="danger" style={{ display: 'block', marginTop: 16, textAlign: 'center' }}>
                {error}
              </IonText>
            )}

            <IonButton expand="block" type="submit" style={{ marginTop: 24 }}>
              {isLogin ? 'Login' : 'Register'}
            </IonButton>
          </form>
        </div>
  );
};

export default Login;

