import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePerlinNoise } from './usePerlinNoise';

describe('usePerlinNoise', () => {
  describe('instance stability', () => {
    it('returns same instance across re-renders', () => {
      const { result, rerender } = renderHook(() => usePerlinNoise(12345));

      const firstInstance = result.current;
      rerender();
      const secondInstance = result.current;

      expect(firstInstance).toBe(secondInstance);
    });

    it('maintains instance through multiple re-renders', () => {
      const { result, rerender } = renderHook(() => usePerlinNoise(12345));

      const instance = result.current;

      for (let i = 0; i < 10; i++) {
        rerender();
        expect(result.current).toBe(instance);
      }
    });
  });

  describe('seed handling', () => {
    it('different seeds produce different noise values', () => {
      const { result: result1 } = renderHook(() => usePerlinNoise(12345));
      const { result: result2 } = renderHook(() => usePerlinNoise(54321));

      // Use coordinates that produce different values for different seeds
      const value1 = result1.current.perlin2(3.14, 2.71);
      const value2 = result2.current.perlin2(3.14, 2.71);

      expect(value1).not.toBe(value2);
    });

    it('same seed produces identical noise values', () => {
      const { result: result1 } = renderHook(() => usePerlinNoise(54321));
      const { result: result2 } = renderHook(() => usePerlinNoise(54321));

      const value1 = result1.current.perlin2(3.14, 2.71);
      const value2 = result2.current.perlin2(3.14, 2.71);

      expect(value1).toBe(value2);
    });

    it('handles seed value 0', () => {
      const { result } = renderHook(() => usePerlinNoise(0));

      const value = result.current.perlin2(1, 1);

      expect(typeof value).toBe('number');
      expect(Number.isFinite(value)).toBe(true);
    });

    it('generates stable seed when not provided', () => {
      const { result, rerender } = renderHook(() => usePerlinNoise());

      const value1 = result.current.perlin2(1, 1);
      rerender();
      const value2 = result.current.perlin2(1, 1);

      // Same instance should produce same values
      expect(value1).toBe(value2);
    });

    it('two hooks without seed get different random seeds', () => {
      const { result: result1 } = renderHook(() => usePerlinNoise());
      const { result: result2 } = renderHook(() => usePerlinNoise());

      // Different instances (different random seeds)
      expect(result1.current).not.toBe(result2.current);
    });
  });

  describe('Perlin instance functionality', () => {
    it('returned instance works with perlin2', () => {
      const { result } = renderHook(() => usePerlinNoise(99999));

      const value = result.current.perlin2(3.5, 7.2);

      expect(typeof value).toBe('number');
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(-1);
      expect(value).toBeLessThanOrEqual(1);
    });

    it('returned instance works with simplex2', () => {
      const { result } = renderHook(() => usePerlinNoise(88888));

      const value = result.current.simplex2(2.5, 4.5);

      expect(typeof value).toBe('number');
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(-1);
      expect(value).toBeLessThanOrEqual(1);
    });

    it('produces consistent values for same coordinates', () => {
      const { result } = renderHook(() => usePerlinNoise(77777));

      const value1 = result.current.perlin2(10, 20);
      const value2 = result.current.perlin2(10, 20);

      expect(value1).toBe(value2);
    });
  });
});
