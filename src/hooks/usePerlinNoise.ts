import { useRef, useMemo } from 'react';
import Perlin from '../components/Perlin';

/**
 * Custom hook that provides a stable Perlin noise instance across re-renders.
 *
 * Uses lazy initialization pattern to create the Perlin instance only once.
 * The same instance is returned on every render for referential stability.
 *
 * @param seed - Optional seed for the Perlin noise generator.
 *               If not provided, a random seed is generated once.
 * @returns A stable Perlin noise instance
 */
export function usePerlinNoise(seed?: number): Perlin {
  // Generate a stable seed if not provided - captured once on first render
  const stableSeed = useMemo(() => {
    return seed ?? Math.random();
  }, [seed]);

  // Use lazy initialization pattern for referential stability
  const perlinRef = useRef<Perlin>();

  if (!perlinRef.current) {
    perlinRef.current = new Perlin(stableSeed);
  }

  return perlinRef.current;
}
