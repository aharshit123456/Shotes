import { renderHook, act } from '@testing-library/react';
import { useLocalMedia } from './useLocalMedia';

// Minimal stubs for mediaDevices
beforeAll(() => {
  // @ts-ignore
  global.navigator.mediaDevices = {
    getUserMedia: jest.fn(async () => ({
      getAudioTracks: () => [{ enabled: true }],
      getVideoTracks: () => [{ enabled: true }]
    }))
  };
});

describe('useLocalMedia', () => {
  it('toggles mic and camera', async () => {
    const { result } = renderHook(() => useLocalMedia());
    act(() => result.current.toggleMic());
    expect(result.current.isMicOn).toBe(false);

    act(() => result.current.toggleCamera());
    expect(result.current.isCamOn).toBe(false);
  });
});


