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
    const init = async () => {
      const { WS_BASE } = await import('../shared/services/api');
      const socket = new WebSocket(`${WS_BASE}/ws/rtc/${classId}`);
      wsRef.current = socket;

      socket.onopen = () => {
        // connected
      };

      socket.onmessage = (event) => {
        // Handle SDP offers/answers and ICE candidates
        JSON.parse(event.data);
        // received signal
        // Here you would handle peer connection setup
        // This is a simplified version - full WebRTC implementation would use RTCPeerConnection
      };

      socket.onerror = () => {
        // signalling error
      };
    };
    init();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
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


