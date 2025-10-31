import { useChatStore } from './chatStore';

describe('chat store', () => {
  it('seeds and sends messages', () => {
    // seed
    useChatStore.getState().seedDemoMessages();
    const seeded = useChatStore.getState().messages.length;
    expect(seeded).toBeGreaterThan(0);

    // send
    useChatStore.getState().sendMessage('Hello');
    const last = useChatStore.getState().messages.at(-1);
    expect(last?.text).toBe('Hello');
  });
});


