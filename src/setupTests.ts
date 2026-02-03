import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import 'vitest-axe/extend-expect'
import { Globals } from '@react-spring/web'

// Skip React Spring animations in tests to prevent timeouts and flaky tests
Globals.assign({ skipAnimation: true })

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test to prevent state leakage
afterEach(() => {
  cleanup()
})

// Mock ResizeObserver for test environment
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock matchMedia for test environment (used by theme detection)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: query === '(prefers-color-scheme: dark)',
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
})
