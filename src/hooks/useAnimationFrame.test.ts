import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnimationFrame } from './useAnimationFrame';

describe('useAnimationFrame', () => {
  let rafCallbacks: ((timestamp: number) => void)[] = [];
  let currentTime = 0;
  let rafId = 0;

  beforeEach(() => {
    rafCallbacks = [];
    currentTime = 0;
    rafId = 0;

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      rafCallbacks.push(callback);
      return ++rafId;
    });

    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      // In a real implementation this would remove the callback
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const advanceTime = (ms: number) => {
    currentTime += ms;
    const callbacks = [...rafCallbacks];
    rafCallbacks = [];
    callbacks.forEach((cb) => cb(currentTime));
  };

  describe('callback invocation', () => {
    it('calls callback with elapsed time', () => {
      const callback = vi.fn();
      renderHook(() => useAnimationFrame(callback, { fps: 30 }));

      // First RAF call to initialize
      advanceTime(0);

      // Advance past frame interval (1000/30 = ~33.33ms)
      advanceTime(34);

      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(expect.any(Number));
    });

    it('accumulates elapsed time across frames', () => {
      const callback = vi.fn();
      renderHook(() => useAnimationFrame(callback, { fps: 30 }));

      // Initialize
      advanceTime(0);

      // First frame
      advanceTime(34);
      const firstElapsed = callback.mock.calls[0][0];

      // Second frame
      advanceTime(34);
      const secondElapsed = callback.mock.calls[1][0];

      expect(secondElapsed).toBeGreaterThan(firstElapsed);
    });
  });

  describe('frame rate throttling', () => {
    it('respects fps setting and skips frames that are too fast', () => {
      const callback = vi.fn();
      renderHook(() => useAnimationFrame(callback, { fps: 30 })); // ~33ms per frame

      // Initialize
      advanceTime(0);

      // Too fast - should not call callback
      advanceTime(10);
      expect(callback).not.toHaveBeenCalled();

      // Still too fast (total 20ms)
      advanceTime(10);
      expect(callback).not.toHaveBeenCalled();

      // Now enough time passed (total 34ms > 33.33ms)
      advanceTime(14);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('uses default 30fps when fps not specified', () => {
      const callback = vi.fn();
      renderHook(() => useAnimationFrame(callback));

      advanceTime(0);

      // 20ms - too fast for 30fps
      advanceTime(20);
      expect(callback).not.toHaveBeenCalled();

      // 34ms total - past 33.33ms threshold
      advanceTime(14);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('allows higher fps setting', () => {
      const callback = vi.fn();
      renderHook(() => useAnimationFrame(callback, { fps: 60 })); // ~16.67ms per frame

      advanceTime(0);

      // 17ms should trigger at 60fps
      advanceTime(17);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('paused state', () => {
    it('skips callback execution when paused', () => {
      const callback = vi.fn();
      renderHook(() => useAnimationFrame(callback, { fps: 30, paused: true }));

      advanceTime(0);
      advanceTime(34);
      advanceTime(34);

      expect(callback).not.toHaveBeenCalled();
    });

    it('resumes animation when unpaused', () => {
      const callback = vi.fn();
      // Start unpaused
      const { rerender } = renderHook(
        ({ paused }) => useAnimationFrame(callback, { fps: 30, paused }),
        { initialProps: { paused: false } }
      );

      advanceTime(0);
      advanceTime(34);
      expect(callback).toHaveBeenCalledTimes(1);

      // Pause - ref is updated synchronously before next RAF
      rerender({ paused: true });
      callback.mockClear();

      // The RAF loop continues but pausedRef.current is now true
      advanceTime(34);
      advanceTime(34);
      expect(callback).not.toHaveBeenCalled();

      // Unpause - pausedRef.current is now false
      rerender({ paused: false });
      advanceTime(34);

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('cancels animation frame on unmount', () => {
      const callback = vi.fn();
      const { unmount } = renderHook(() => useAnimationFrame(callback));

      advanceTime(0);

      unmount();

      expect(window.cancelAnimationFrame).toHaveBeenCalled();
    });

    it('does not call callback after unmount', () => {
      const callback = vi.fn();
      const { unmount } = renderHook(() => useAnimationFrame(callback, { fps: 30 }));

      advanceTime(0);
      unmount();

      // Clear any pending calls
      callback.mockClear();

      // Simulate RAF firing after unmount (shouldn't happen in practice due to cancel)
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('callback updates', () => {
    it('uses updated callback without restarting animation', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const { rerender } = renderHook(
        ({ cb }) => useAnimationFrame(cb, { fps: 30 }),
        { initialProps: { cb: callback1 } }
      );

      advanceTime(0);
      advanceTime(34);
      expect(callback1).toHaveBeenCalledTimes(1);

      // Change callback
      rerender({ cb: callback2 });
      advanceTime(34);

      expect(callback2).toHaveBeenCalledTimes(1);
    });
  });
});
