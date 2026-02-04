export {
  ErrorBoundary,
  WaveAnimationFallback,
  AppFallback,
} from './ErrorBoundary';

export type { FallbackProps } from './ErrorBoundary';

// Re-export error logging utility (separate from components for react-refresh)
export { logErrorInDev } from '@/utils/errorLogging';
