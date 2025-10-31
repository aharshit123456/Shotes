import React, { RefObject, useEffect, useMemo, useRef, useState } from 'react';

type LocalProps = {
  id: string;
  name: string;
  videoRef: RefObject<HTMLVideoElement>;
};

type RemotePeer = {
  id: string;
  name: string;
  stream: MediaStream;
};

type Props = {
  local: LocalProps;
  remotes: RemotePeer[];
};

const containerStyle: React.CSSProperties = {
  display: 'grid',
  gap: 12,
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
};

const tileStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  aspectRatio: '16 / 9',
  background: 'black',
  borderRadius: 8,
  overflow: 'hidden',
};

const nameStyle: React.CSSProperties = {
  position: 'absolute',
  left: 8,
  bottom: 8,
  padding: '4px 8px',
  borderRadius: 4,
  background: 'rgba(0,0,0,0.55)',
  color: 'white',
  fontSize: 12,
  lineHeight: 1,
  pointerEvents: 'none',
};

const videoStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'contain', // fit in view unless fullscreen
};

const StreamerGrid: React.FC<Props> = ({ local, remotes }) => {
  const [isFullscreenId, setIsFullscreenId] = useState<string | null>(null);
  const containerRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const toggleFullscreen = async (id: string) => {
    const current = containerRefs.current.get(id);
    if (!current) return;
    if (!document.fullscreenElement) {
      await current.requestFullscreen().catch(() => {});
      setIsFullscreenId(id);
    } else {
      await document.exitFullscreen().catch(() => {});
      setIsFullscreenId(null);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) setIsFullscreenId(null);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const allPeers = useMemo(() => {
    return [{ id: local.id, name: `${local.name} (You)`, isLocal: true } as const, ...remotes.map(r => ({ id: r.id, name: r.name, isLocal: false as const }))];
  }, [local.id, local.name, remotes]);

  return (
    <div style={containerStyle}>
      {allPeers.map(peer => (
        <div
          key={peer.id}
          ref={(el) => { if (el) containerRefs.current.set(peer.id, el); else containerRefs.current.delete(peer.id); }}
          style={tileStyle}
          onDoubleClick={() => toggleFullscreen(peer.id)}
        >
          {peer.isLocal ? (
            <video ref={local.videoRef} autoPlay playsInline muted style={videoStyle} />
          ) : (
            <RemoteVideo stream={remotes.find(r => r.id === peer.id)?.stream} />
          )}
          <div style={nameStyle}>{peer.name}</div>
        </div>
      ))}
    </div>
  );
};

const RemoteVideo: React.FC<{ stream: MediaStream | undefined }> = ({ stream }) => {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);
  return <video ref={ref} autoPlay playsInline style={videoStyle} />;
};

export default StreamerGrid;


