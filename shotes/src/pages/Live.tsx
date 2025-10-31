import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { mic, micOff, videocam, videocamOff } from 'ionicons/icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLocalMedia } from '../shared/hooks/useLocalMedia';
import ChatPane from '../shared/components/ChatPane';
import { useAuthStore } from '../shared/state/authStore';
// @ts-ignore - ensure local module resolution in some editors
import StreamerGrid from '../shared/components/StreamerGrid';

const Live: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const { videoRef, isCamOn, isMicOn, toggleCamera, toggleMic, error } = useLocalMedia();
  const auth = useAuthStore();
  const selfId = useMemo(() => auth.user?.id || crypto.randomUUID(), [auth.user?.id]);
  const selfName = useMemo(() => auth.user?.full_name || auth.user?.username || 'Anonymous', [auth.user?.full_name, auth.user?.username]);

  const wsRef = useRef<WebSocket | null>(null);
  // Per-peer RTCPeerConnections keyed by peerId
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const makingOfferRef = useRef<Map<string, boolean>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const [remotePeers, setRemotePeers] = useState<Array<{ id: string; name: string; stream: MediaStream }>>([]);

  const updateRemotePeers = () => {
    const list: Array<{ id: string; name: string; stream: MediaStream }> = [];
    remoteStreamsRef.current.forEach((stream, id) => {
      // Name is not known via backend; fall back to short id for now.
      list.push({ id, name: id.slice(0, 6), stream });
    });
    setRemotePeers(list);
  };

  useEffect(() => {
    if (!classId) return;
    
    // Connect to WebRTC signalling server and setup per-peer connections
    const init = async () => {
      const { WS_BASE } = await import('../shared/services/api');
      const socket = new WebSocket(`${WS_BASE}/ws/rtc/${classId}`);
      wsRef.current = socket;

      const createPeer = (peerId: string) => {
        if (peersRef.current.has(peerId)) return peersRef.current.get(peerId)!;
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
          ]
        });

        makingOfferRef.current.set(peerId, false);

        // Add local tracks
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => pc.addTrack(track, stream));
        }

        // Remote tracks
        pc.ontrack = (event) => {
          const [remoteStream] = event.streams;
          remoteStreamsRef.current.set(peerId, remoteStream);
          updateRemotePeers();
        };

        // ICE candidates -> send to target peer
        pc.onicecandidate = (event) => {
          if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'ice',
              candidate: event.candidate,
              sender: selfId,
              senderName: selfName,
              target: peerId,
            }));
          }
        };

        peersRef.current.set(peerId, pc);
        return pc;
      };

      socket.onopen = async () => {
        // Announce presence; existing peers will initiate offers to us
        wsRef.current?.send(JSON.stringify({ type: 'join', sender: selfId, senderName: selfName }));
      };

      socket.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        // Ignore our own broadcasts
        if (msg.sender && msg.sender === selfId) return;

        // Peer discovery: existing participants create offers to the joiner
        if (msg.type === 'join' && msg.sender) {
          const peerId = msg.sender as string;
          const pc = createPeer(peerId);
          try {
            makingOfferRef.current.set(peerId, true);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            wsRef.current?.send(JSON.stringify({ type: 'offer', sdp: offer, sender: selfId, senderName: selfName, target: peerId }));
          } finally {
            makingOfferRef.current.set(peerId, false);
          }
          return;
        }

        // Targeted signaling: only handle if addressed to us
        if (msg.target && msg.target !== selfId) return;

        if (msg.type === 'offer' && msg.sender) {
          const peerId = msg.sender as string;
          const pc = createPeer(peerId);
          // Perfect negotiation: rollback if not stable
          if (pc.signalingState !== 'stable') {
            try { await pc.setLocalDescription({ type: 'rollback' } as any); } catch {}
          }
          await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          wsRef.current?.send(JSON.stringify({ type: 'answer', sdp: answer, sender: selfId, senderName: selfName, target: peerId }));
        } else if (msg.type === 'answer' && msg.sender) {
          const peerId = msg.sender as string;
          const pc = peersRef.current.get(peerId);
          if (!pc) return;
          // Only set remote answer if we have a local offer outstanding
          if (pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          }
        } else if (msg.type === 'ice' && msg.candidate && msg.sender) {
          const peerId = msg.sender as string;
          const pc = peersRef.current.get(peerId);
          if (!pc) return;
          try {
            // Only add ICE after remote description is set
            if (pc.remoteDescription) {
              await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
            }
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
      // Close all peers
      peersRef.current.forEach(pc => pc.close());
      peersRef.current.clear();
      makingOfferRef.current.clear();
      remoteStreamsRef.current.clear();
      setRemotePeers([]);
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
          <StreamerGrid
            local={{ id: selfId, name: selfName, videoRef }}
            remotes={remotePeers}
          />
          <div>
            <ChatPane height={280} roomId={classId || 'demo'} />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Live;


