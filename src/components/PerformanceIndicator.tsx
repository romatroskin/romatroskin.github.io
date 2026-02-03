import styles from './PerformanceIndicator.module.css';

interface PerformanceIndicatorProps {
  qualityLevel: 'high' | 'medium' | 'low';
  prefersReducedMotion: boolean;
}

export function PerformanceIndicator({ qualityLevel, prefersReducedMotion }: PerformanceIndicatorProps) {
  // Only show when not at full quality
  if (qualityLevel === 'high' && !prefersReducedMotion) {
    return null;
  }

  const label = prefersReducedMotion
    ? 'Reduced motion'
    : qualityLevel === 'low'
      ? 'Power saver'
      : 'Balanced';

  return (
    <div className={styles.indicator} role="status" aria-live="polite">
      <span className={styles.icon}>
        {prefersReducedMotion ? '~' : qualityLevel === 'low' ? 'ECO' : '~'}
      </span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
