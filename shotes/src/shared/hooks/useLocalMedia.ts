import { useCallback, useEffect, useRef, useState } from 'react';

export function useLocalMedia() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to get media';
        setError(message);
      }
    })();
  }, []);

  const toggleMic = useCallback(() => {
    setIsMicOn(prev => !prev);
    if (stream) {
      stream.getAudioTracks().forEach(t => (t.enabled = !t.enabled));
    }
  }, [stream]);

  const toggleCamera = useCallback(() => {
    setIsCamOn(prev => !prev);
    if (stream) {
      stream.getVideoTracks().forEach(t => (t.enabled = !t.enabled));
    }
  }, [stream]);

  return { videoRef, isMicOn, isCamOn, toggleMic, toggleCamera, error };
}


