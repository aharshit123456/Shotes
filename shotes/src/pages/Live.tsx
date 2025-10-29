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
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!classId) return;
    
    // Connect to WebRTC signalling server and setup RTCPeerConnection
    const init = async () => {
      const { WS_BASE } = await import('../shared/services/api');
      const socket = new WebSocket(`${WS_BASE}/ws/rtc/${classId}`);
      wsRef.current = socket;

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
        ]
      });
      pcRef.current = pc;

      // Local tracks
      if (videoRef.current && (videoRef.current as any).srcObject) {
        const stream = (videoRef.current as HTMLVideoElement).srcObject as MediaStream;
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
      }

      // Remote stream
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      // ICE candidates -> send to peer
      pc.onicecandidate = (event) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'ice', candidate: event.candidate }));
        }
      };

      socket.onopen = async () => {
        // Create & send offer if we have local media
        if (pcRef.current) {
          const offer = await pcRef.current.createOffer();
          await pcRef.current.setLocalDescription(offer);
          wsRef.current?.send(JSON.stringify({ type: 'offer', sdp: offer }));
        }
      };

      socket.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        if (!pcRef.current) return;
        if (msg.type === 'offer') {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          wsRef.current?.send(JSON.stringify({ type: 'answer', sdp: answer }));
        } else if (msg.type === 'answer') {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        } else if (msg.type === 'ice' && msg.candidate) {
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(msg.candidate));
          } catch (_) {
            // Ignore invalid/duplicate ICE candidates
          }
        }
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
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 12 }}>
          {error && <div style={{ padding: 12, color: 'var(--ion-color-danger)' }}>{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', background: 'black', borderRadius: 8 }} />
            <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', background: 'black', borderRadius: 8 }} />
          </div>
          <div>
            <ChatPane height={280} roomId={classId || 'demo'} />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Live;


