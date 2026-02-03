import type { FallbackProps } from 'react-error-boundary';
import styles from './ErrorBoundary.module.css';

/**
 * Silent fallback for wave animation errors
 * Displays a gradient background matching the wave aesthetic
 * No retry button - waves are non-essential UI
 */
export function WaveAnimationFallback(_props: FallbackProps) {
  return (
    <div
      className={styles.waveFallback}
      aria-label="Background animation unavailable"
      role="img"
    />
  );
}
