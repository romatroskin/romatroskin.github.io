import { onLCP, onINP, onCLS, onFCP, onTTFB, type Metric } from 'web-vitals';

export function initWebVitals() {
  function sendToAnalytics({ name, value, rating, delta, id }: Metric) {
    // Log in development, send to analytics in production
    if (import.meta.env.DEV) {
      console.log(`[Web Vitals] ${name}:`, {
        value: `${Math.round(value)}ms`,
        rating,
        delta: `${Math.round(delta)}ms`,
        id
      });
    } else {
      const body = JSON.stringify({ name, value, rating, delta, id });
      navigator.sendBeacon?.('/analytics', body) ||
        fetch('/analytics', { body, method: 'POST', keepalive: true });
    }
  }

  onLCP(sendToAnalytics);  // Target: <2500ms
  onINP(sendToAnalytics);  // Target: <200ms
  onCLS(sendToAnalytics);  // Target: <0.1
  onFCP(sendToAnalytics);  // Informational
  onTTFB(sendToAnalytics); // Informational
}
