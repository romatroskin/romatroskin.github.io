/**
 * Storage utility with localStorage fallback to in-memory storage
 * Handles cases where localStorage is unavailable (private browsing, quota exceeded, etc.)
 */

type StorageKey = 'theme' | 'reducedMotion';

// In-memory fallback storage
const memoryStorage = new Map<string, string>();

/**
 * Check if localStorage is available and working
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// Cache the availability check
const localStorageAvailable = isLocalStorageAvailable();

/**
 * Storage abstraction that gracefully falls back to in-memory storage
 */
export const storage = {
  getItem(key: StorageKey): string | null {
    if (localStorageAvailable) {
      try {
        return localStorage.getItem(key);
      } catch {
        return memoryStorage.get(key) ?? null;
      }
    }
    return memoryStorage.get(key) ?? null;
  },

  setItem(key: StorageKey, value: string): void {
    if (localStorageAvailable) {
      try {
        localStorage.setItem(key, value);
        return;
      } catch {
        // Fall through to memory storage
      }
    }
    memoryStorage.set(key, value);
  },

  removeItem(key: StorageKey): void {
    if (localStorageAvailable) {
      try {
        localStorage.removeItem(key);
        return;
      } catch {
        // Fall through to memory storage
      }
    }
    memoryStorage.delete(key);
  },
};
