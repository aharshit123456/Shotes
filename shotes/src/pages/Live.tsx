import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { mic, micOff, videocam, videocamOff } from 'ionicons/icons';
import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useLocalMedia } from '../shared/hooks/useLocalMedia';
import ChatPane from '../shared/components/ChatPane';

const Live: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const { videoRef, isCamOn, isMicOn, toggleCamera, toggleMic, error } = useLocalMedia();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!classId) return;
    
    // Connect to WebRTC signalling server
    const ws = new WebSocket(`ws://localhost:8000/ws/rtc/${classId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to WebRTC signalling server');
    };

    ws.onmessage = (event) => {
      // Handle SDP offers/answers and ICE candidates
      const data = JSON.parse(event.data);
      console.log('WebRTC signal received:', data);
      // Here you would handle peer connection setup
      // This is a simplified version - full WebRTC implementation would use RTCPeerConnection
    };

    ws.onerror = (error) => {
      console.error('WebRTC signalling error:', error);
    };

    return () => {
      ws.close();
    };
  }, [classId]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Live Class {classId ? `#${classId.slice(0, 8)}` : ''}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={toggleMic} aria-label="Toggle mic">
              <IonIcon icon={isMicOn ? mic : micOff} />
            </IonButton>
            <IonButton onClick={toggleCamera} aria-label="Toggle camera">
              <IonIcon icon={isCamOn ? videocam : videocamOff} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ position: 'relative', height: '100%' }}>
          {error && <div style={{ padding: 12, color: 'var(--ion-color-danger)' }}>{error}</div>}
          <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', background: 'black' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.35)' }}>
            <ChatPane height={240} roomId={classId || 'demo'} />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Live;


