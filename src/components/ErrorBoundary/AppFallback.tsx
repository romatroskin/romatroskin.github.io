import type { FallbackProps } from 'react-error-boundary';
import styles from './ErrorBoundary.module.css';

/**
 * App-level error fallback with retry functionality
 * Shows user-friendly message with option to retry
 * Development mode shows error details
 */
export function AppFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className={styles.appFallback} role="alert">
      <div className={styles.errorCard}>
        <h1 className={styles.errorTitle}>Something went wrong</h1>
        <p className={styles.errorMessage}>
          We're sorry, but something unexpected happened.
          Please try again or refresh the page.
        </p>

        {/* Show error details in development only */}
        {import.meta.env.DEV && error?.message && (
          <pre className={styles.errorDetails}>
            {error.message}
          </pre>
        )}

        <button
          className={styles.retryButton}
          onClick={resetErrorBoundary}
          type="button"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
