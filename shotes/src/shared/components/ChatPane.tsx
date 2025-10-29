import { IonButton, IonIcon, IonInput, IonItem, IonList } from '@ionic/react';
import { send } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useChatStore, type ChatMessage } from '../state/chatStore';

const ChatPane: React.FC<{ height?: number; roomId?: string }> = ({ height = 240, roomId = 'demo' }) => {
  const { messages, sendMessage, connectWebSocket, disconnectWebSocket, isConnected } = useChatStore();
  const [text, setText] = useState('');
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    connectWebSocket(roomId);
    return () => disconnectWebSocket();
  }, [roomId, connectWebSocket, disconnectWebSocket]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 999999, behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ height, backdropFilter: 'blur(2px)', padding: 8 }}>
      <div style={{ fontSize: '12px', color: isConnected ? 'green' : 'orange', marginBottom: 4 }}>
        {isConnected ? '🟢 Connected' : '🟡 Offline (local mode)'}
      </div>
      <div ref={listRef} style={{ overflowY: 'auto', height: height - 56 }}>
        <IonList>
          {messages.map((m: ChatMessage) => (
            <IonItem key={m.id} lines="none">
              <div>
                <strong style={{ color: '#8a2be2' }}>{m.author} :</strong> {m.text}
              </div>
            </IonItem>
          ))}
        </IonList>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingTop: 4 }}>
        <IonInput
          placeholder="Enter your message"
          value={text}
          onIonChange={e => setText(e.detail.value ?? '')}
        />
        <IonButton
          onClick={() => {
            if (text.trim().length === 0) return;
            sendMessage(text.trim());
            setText('');
          }}
        >
          <IonIcon icon={send} />
        </IonButton>
      </div>
    </div>
  );
};

export default ChatPane;


