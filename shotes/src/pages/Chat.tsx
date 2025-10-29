import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
import ChatPane from '../shared/components/ChatPane';

const Chat: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Class Chat</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <ChatPane height={window.innerHeight - 100} />
      </IonContent>
    </IonPage>
  );
};

export default Chat;


