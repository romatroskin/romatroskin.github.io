import { describe, it, expect } from 'vitest';
import { storage } from './storage';

describe('storage utility', () => {
  describe('storage interface', () => {
    it('exports getItem function', () => {
      expect(typeof storage.getItem).toBe('function');
    });

    it('exports setItem function', () => {
      expect(typeof storage.setItem).toBe('function');
    });

    it('exports removeItem function', () => {
      expect(typeof storage.removeItem).toBe('function');
    });
  });

  describe('storage operations', () => {
    it('setItem and getItem work together for theme', () => {
      storage.setItem('theme', 'dark');
      expect(storage.getItem('theme')).toBe('dark');
    });

    it('setItem and getItem work together for reducedMotion', () => {
      storage.setItem('reducedMotion', 'true');
      expect(storage.getItem('reducedMotion')).toBe('true');
    });

    it('getItem returns null for non-existent key after removeItem', () => {
      storage.setItem('theme', 'dark');
      storage.removeItem('theme');
      expect(storage.getItem('theme')).toBeNull();
    });

    it('setItem overwrites existing value', () => {
      storage.setItem('theme', 'light');
      storage.setItem('theme', 'dark');
      expect(storage.getItem('theme')).toBe('dark');
    });
  });
});
