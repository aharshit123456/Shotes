import { create, type StateCreator } from 'zustand';

export type ChatMessage = {
  id: string;
  author: string;
  text: string;
  avatarUrl?: string;
  timestamp: number;
};

type ChatState = {
  messages: ChatMessage[];
  sendMessage: (text: string) => void;
  seedDemoMessages: () => void;
  connectWebSocket: (roomId: string) => Promise<void>;
  disconnectWebSocket: () => void;
  isConnected: boolean;
  ws: WebSocket | null;
};

const creator: StateCreator<ChatState> = (set, get) => ({
  messages: [],
  isConnected: false,
  ws: null,
  sendMessage: (text: string) => {
    const state = get();
    if (state.ws && state.isConnected) {
      // Send via WebSocket to backend schema
      let senderId = '';
      try {
        const userStr = localStorage.getItem('auth_user');
        if (userStr) senderId = JSON.parse(userStr).id || '';
      } catch (_) {}
      state.ws.send(JSON.stringify({
        sender_id: senderId,
        text,
        message_type: 'course_chat'
      }));
    } else {
      // Fallback to local storage
      const msg: ChatMessage = {
        id: Math.random().toString(36).slice(2),
        author: 'You',
        text,
        timestamp: Date.now()
      };
      set({ messages: [...state.messages, msg] });
    }
  },
  seedDemoMessages: () => {
    const seed: ChatMessage[] = [
      { id: 'a', author: 'Jane Doe', text: "I didn't get the last part, can you repeat that?", timestamp: Date.now() - 60000 },
      { id: 'b', author: 'John Doe', text: 'What is a dipole moment??', timestamp: Date.now() - 30000 },
      { id: 'c', author: 'Susan Doasan', text: 'I like this new format…', timestamp: Date.now() - 15000 }
    ];
    set({ messages: seed });
  },
  connectWebSocket: async (roomId: string) => {
    const state = get();
    if (state.ws) {
      state.ws.close();
    }

    try {
      const { WS_BASE, API_HTTP_BASE } = await import('../services/api');
      const ws = new WebSocket(`${WS_BASE}/ws/chat/${roomId}`);
      
      ws.onopen = () => {
        set({ isConnected: true, ws });
        // Load recent messages
        fetch(`${API_HTTP_BASE}/messages/${roomId}`)
          .then(res => res.json())
          .then(msgs => {
            const formattedMsgs = (msgs as import('../services/api').MessageDTO[]).map((m) => ({
              id: m.id,
              author: m.author,
              text: m.text,
              timestamp: new Date(m.timestamp).getTime()
            }));
            set({ messages: formattedMsgs });
          })
          .catch(() => {
            // Fallback to demo messages if backend unavailable
            get().seedDemoMessages();
          });
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
          const msg: ChatMessage = {
            id: data.payload.id,
            author: data.payload.author,
            text: data.payload.text,
            timestamp: new Date(data.payload.timestamp).getTime()
          };
          set({ messages: [...state.messages, msg] });
        }
      };

      ws.onclose = () => {
        set({ isConnected: false, ws: null });
      };

      ws.onerror = () => {
        set({ isConnected: false, ws: null });
        // Fallback to demo messages
        get().seedDemoMessages();
      };

    } catch (_error) {
      set({ isConnected: false, ws: null });
      get().seedDemoMessages();
    }
  },
  disconnectWebSocket: () => {
    const state = get();
    if (state.ws) {
      state.ws.close();
    }
    set({ isConnected: false, ws: null });
  }
});

export const useChatStore = create<ChatState>(creator);


