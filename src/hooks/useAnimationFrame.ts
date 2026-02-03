import { useRef, useEffect, useCallback } from 'react';

interface UseAnimationFrameOptions {
  fps?: number;
  paused?: boolean;
}

/**
 * Custom hook that manages requestAnimationFrame lifecycle with frame rate throttling.
 *
 * @param callback - Function called on each animation frame with total elapsed time in ms
 * @param options - Configuration options
 * @param options.fps - Target frames per second (default: 30)
 * @param options.paused - When true, pauses animation but maintains elapsed time
 */
export function useAnimationFrame(
  callback: (elapsed: number) => void,
  options: UseAnimationFrameOptions = {}
): void {
  const { fps = 30, paused = false } = options;

  const frameIdRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const totalElapsedRef = useRef<number>(0);
  const callbackRef = useRef(callback);

  // Keep callback ref up to date without triggering effect re-runs
  callbackRef.current = callback;

  const animate = useCallback(
    (timestamp: number) => {
      if (previousTimeRef.current === undefined) {
        previousTimeRef.current = timestamp;
      }

      const elapsed = timestamp - previousTimeRef.current;
      const frameInterval = 1000 / fps;

      if (!paused && elapsed >= frameInterval) {
        totalElapsedRef.current += elapsed;
        previousTimeRef.current = timestamp;
        callbackRef.current(totalElapsedRef.current);
      } else if (paused) {
        // When paused, update previousTime to prevent time jump on resume
        previousTimeRef.current = timestamp;
      }

      frameIdRef.current = requestAnimationFrame(animate);
    },
    [fps, paused]
  );

  useEffect(() => {
    frameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameIdRef.current !== undefined) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [animate]);
}
