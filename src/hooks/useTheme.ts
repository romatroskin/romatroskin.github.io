import { useEffect, useSyncExternalStore, useCallback } from 'react';
import { storage } from '../utils/storage';

type Theme = 'light' | 'dark';

function getThemeFromDOM(): Theme {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') {
    return attr;
  }
  // Fallback to system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Subscribers for theme changes
const subscribers = new Set<() => void>();

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function notifySubscribers() {
  subscribers.forEach(callback => callback());
}

function setThemeToDOM(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  storage.setItem('theme', theme);
  notifySubscribers();
}

export function useTheme() {
  // Use useSyncExternalStore for consistent state across components
  const theme = useSyncExternalStore(
    subscribe,
    getThemeFromDOM,
    () => 'dark' as Theme // Server snapshot
  );

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't made an explicit choice
      const storedTheme = storage.getItem('theme');
      if (!storedTheme) {
        const newTheme = e.matches ? 'dark' : 'light';
        setThemeToDOM(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    const currentTheme = getThemeFromDOM();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setThemeToDOM(newTheme);
  }, []);

  return { theme, toggleTheme };
}
