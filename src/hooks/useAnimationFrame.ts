import { useRef, useEffect } from 'react';

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
  const pausedRef = useRef(paused);
  const fpsRef = useRef(fps);

  // Keep refs up to date without triggering effect re-runs
  callbackRef.current = callback;
  pausedRef.current = paused;
  fpsRef.current = fps;

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (previousTimeRef.current === undefined) {
        previousTimeRef.current = timestamp;
      }

      const elapsed = timestamp - previousTimeRef.current;
      const frameInterval = 1000 / fpsRef.current;

      if (!pausedRef.current && elapsed >= frameInterval) {
        totalElapsedRef.current += elapsed;
        previousTimeRef.current = timestamp;
        callbackRef.current(totalElapsedRef.current);
      } else if (pausedRef.current) {
        // When paused, update previousTime to prevent time jump on resume
        previousTimeRef.current = timestamp;
      }

      frameIdRef.current = requestAnimationFrame(animate);
    };

    frameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameIdRef.current !== undefined) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, []); // Empty deps - refs handle all updates
}
