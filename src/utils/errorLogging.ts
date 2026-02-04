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
