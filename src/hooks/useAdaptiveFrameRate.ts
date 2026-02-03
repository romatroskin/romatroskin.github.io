import { useState, useEffect, useRef } from 'react';

type QualityLevel = 'high' | 'medium' | 'low';

/**
 * Custom hook that monitors frame rate and returns adaptive quality level.
 *
 * Tracks actual FPS by measuring frame deltas with requestAnimationFrame.
 * Uses rolling window of 60 frames to calculate average FPS.
 * Quality degrades smoothly when device can't maintain target FPS.
 *
 * @param targetFPS - Target frame rate (default 60)
 * @returns Current quality level based on measured FPS
 */
export function useAdaptiveFrameRate(targetFPS: number = 60): QualityLevel {
  const [qualityLevel, setQualityLevel] = useState<QualityLevel>('high');
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const rafIdRef = useRef<number>();

  useEffect(() => {
    let isActive = true;

    const measureFrameRate = () => {
      if (!isActive) return;

      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      // Skip first frame (invalid delta)
      if (frameCountRef.current > 0) {
        frameTimesRef.current.push(delta);

        // Keep rolling window of last 60 frames
        if (frameTimesRef.current.length > 60) {
          frameTimesRef.current.shift();
        }

        // Calculate average FPS every 60 frames
        if (frameCountRef.current % 60 === 0 && frameTimesRef.current.length === 60) {
          const avgDelta = frameTimesRef.current.reduce((a, b) => a + b, 0) / 60;
          const avgFPS = 1000 / avgDelta;

          // Determine quality level with hysteresis to prevent flickering
          // Lower thresholds for degrading, higher for recovering
          if (avgFPS < 30) {
            setQualityLevel('low');
          } else if (avgFPS < 45) {
            setQualityLevel((current) => current === 'high' ? 'medium' : 'low');
          } else if (avgFPS > 55) {
            setQualityLevel((current) => {
              if (current === 'low' && avgFPS > 50) return 'medium';
              if (current === 'medium' && avgFPS > 55) return 'high';
              return current;
            });
          }
        }
      }

      frameCountRef.current++;
      rafIdRef.current = requestAnimationFrame(measureFrameRate);
    };

    rafIdRef.current = requestAnimationFrame(measureFrameRate);

    return () => {
      isActive = false;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [targetFPS]);

  return qualityLevel;
}
