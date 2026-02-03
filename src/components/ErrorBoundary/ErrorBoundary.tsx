/**
 * Error Boundary exports
 * Re-exports react-error-boundary with custom fallback components
 */

// Re-export ErrorBoundary from react-error-boundary for consistent imports
export { ErrorBoundary } from 'react-error-boundary';

// Export custom fallback components
export { WaveAnimationFallback } from './WaveAnimationFallback';
export { AppFallback } from './AppFallback';

// Export types for consumers
export type { FallbackProps } from 'react-error-boundary';

/**
 * Error logging callback for development mode only
 * Can be passed to ErrorBoundary's onError prop
 */
export function logErrorInDev(error: Error, info: React.ErrorInfo) {
  if (import.meta.env.DEV) {
    console.error('Error caught by boundary:', error);
    console.error('Component stack:', info.componentStack);
  }
}
