import React, { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import {
  home,
  school,
  documentText,
  compass,
  person,
  trophy
} from 'ionicons/icons';
import Dashboard from './pages/Dashboard';
import Classes from './pages/Classes';
import Tests from './pages/Tests';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import Live from './pages/Live';
import Chat from './pages/Chat';
import Grades from './pages/Grades';
import Login from './pages/Login';
import { useAuthStore } from './shared/state/authStore';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Initialize auth state from localStorage
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    
    console.log('App initializing, token:', !!token, 'user:', !!userStr);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        useAuthStore.setState({
          user,
          token,
          isAuthenticated: true,
        });
        console.log('User authenticated from localStorage:', user);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return <IonApp><div style={{ padding: 20, textAlign: 'center' }}>Loading...</div></IonApp>;
  }

  console.log('App rendering, isAuthenticated:', isAuthenticated);
  console.log('Current URL:', window.location.href);

  return (
    <IonApp>
      <IonReactRouter>
        {!isAuthenticated ? (
          <div style={{ background: 'white', minHeight: '100vh', padding: 20 }}>
            <Login />
          </div>
        ) : (
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/dashboard">
                <Dashboard />
              </Route>
              <Route exact path="/classes">
                <Classes />
              </Route>
              <Route exact path="/tests">
                <Tests />
              </Route>
              <Route exact path="/explore">
                <Explore />
              </Route>
              <Route exact path="/profile">
                <Profile />
              </Route>
              <Route exact path="/live/:classId?">
                <Live />
              </Route>
              <Route exact path="/chat">
                <Chat />
              </Route>
              <Route exact path="/grades">
                <Grades />
              </Route>
              <Route exact path="/">
                <Redirect to="/dashboard" />
              </Route>
            </IonRouterOutlet>
            <IonTabBar slot="bottom">
              <IonTabButton tab="dashboard" href="/dashboard">
                <IonIcon aria-hidden="true" icon={home} />
                <IonLabel>Dashboard</IonLabel>
              </IonTabButton>
              <IonTabButton tab="classes" href="/classes">
                <IonIcon aria-hidden="true" icon={school} />
                <IonLabel>Classes</IonLabel>
              </IonTabButton>
              {user?.role === 'teacher' && (
                <IonTabButton tab="grades" href="/grades">
                  <IonIcon aria-hidden="true" icon={trophy} />
                  <IonLabel>Grades</IonLabel>
                </IonTabButton>
              )}
              <IonTabButton tab="tests" href="/tests">
                <IonIcon aria-hidden="true" icon={documentText} />
                <IonLabel>Tests</IonLabel>
              </IonTabButton>
              <IonTabButton tab="explore" href="/explore">
                <IonIcon aria-hidden="true" icon={compass} />
                <IonLabel>Explore</IonLabel>
              </IonTabButton>
              <IonTabButton tab="profile" href="/profile">
                <IonIcon aria-hidden="true" icon={person} />
                <IonLabel>Profile</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        )}
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
