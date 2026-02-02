import { describe, it, expect } from 'vitest'
import Perlin from './Perlin'

describe('Perlin noise algorithm', () => {
  describe('determinism', () => {
    it('produces identical output for same seed and coordinates', () => {
      const perlin1 = new Perlin(12345)
      const perlin2 = new Perlin(12345)

      // Same seed + same coordinates = identical output
      expect(perlin1.simplex2(3.14, 42)).toBe(perlin2.simplex2(3.14, 42))
      expect(perlin1.perlin2(1.5, 2.5)).toBe(perlin2.perlin2(1.5, 2.5))
    })

    it('produces consistent values across multiple calls', () => {
      const perlin = new Perlin(54321)

      const value1 = perlin.simplex2(5, 5)
      const value2 = perlin.simplex2(5, 5)

      expect(value1).toBe(value2)
    })

    it('produces different output for different seeds', () => {
      const perlin1 = new Perlin(111)
      const perlin2 = new Perlin(222)

      expect(perlin1.simplex2(5, 5)).not.toBe(perlin2.simplex2(5, 5))
    })
  })

  describe('output range', () => {
    it('simplex2 returns values in [-1, 1] range', () => {
      const perlin = new Perlin(99999)

      // Test multiple points to verify range
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * 100
        const y = Math.random() * 100
        const value = perlin.simplex2(x, y)

        expect(value).toBeGreaterThanOrEqual(-1)
        expect(value).toBeLessThanOrEqual(1)
      }
    })

    it('perlin2 returns values approximately in [-1, 1] range', () => {
      const perlin = new Perlin(88888)

      for (let i = 0; i < 100; i++) {
        const x = Math.random() * 100
        const y = Math.random() * 100
        const value = perlin.perlin2(x, y)

        // Perlin2 typically returns values in a slightly smaller range
        expect(value).toBeGreaterThanOrEqual(-1)
        expect(value).toBeLessThanOrEqual(1)
      }
    })
  })

  describe('seed handling', () => {
    it('handles seed value 0', () => {
      const perlin = new Perlin(0)
      const value = perlin.simplex2(1, 1)

      expect(typeof value).toBe('number')
      expect(Number.isFinite(value)).toBe(true)
    })

    it('handles fractional seed values', () => {
      const perlin = new Perlin(0.5)
      const value = perlin.simplex2(1, 1)

      expect(typeof value).toBe('number')
      expect(Number.isFinite(value)).toBe(true)
    })

    it('handles large seed values', () => {
      const perlin = new Perlin(999999999)
      const value = perlin.simplex2(1, 1)

      expect(typeof value).toBe('number')
      expect(Number.isFinite(value)).toBe(true)
    })
  })
})
