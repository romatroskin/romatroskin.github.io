# Phase 01: Foundation & Cleanup - Research

**Researched:** 2026-02-03
**Domain:** Testing infrastructure (Vitest), code quality (ESLint, TypeScript), bundle optimization
**Confidence:** HIGH

## Summary

Phase 01 establishes testing infrastructure using Vitest and addresses critical code quality issues that actively degrade user experience. The research confirms that the standard stack for this phase consists of Vitest 3.x with React Testing Library for testing, ESLint flat config for enforcing code quality rules, and native React patterns (useMemo/useState) to replace lodash and stabilize random values across renders.

The key technical challenges are: (1) configuring Vitest in a Vite React TypeScript project, (2) implementing deterministic tests for Perlin noise algorithms, (3) removing PureCSS and replacing with CSS Modules, (4) enforcing no-console rules at error level, and (5) verifying bundle size reduction after removing lodash.

**Primary recommendation:** Follow the standard Vitest + React Testing Library setup with co-located tests, configure strict ESLint no-console enforcement, use useMemo to stabilize random wave values in App.tsx, replace PureCSS with CSS Modules for the header menu, and verify changes with rollup-plugin-visualizer.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vitest | 3.x (latest) | Test framework | Built for Vite, 10-20x faster than Jest, native ESM/TS support via Oxc |
| @testing-library/react | ^16.x | Component testing | Industry standard for behavior-driven React testing, official RTL recommendation |
| @testing-library/user-event | ^14.x | User interaction simulation | More realistic than fireEvent, recommended by RTL for user actions |
| jsdom | ^25.x | DOM environment | Standard lightweight browser environment for Node tests |
| @testing-library/jest-dom | ^6.x | Custom matchers | Provides semantic matchers like `toBeInTheDocument()` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vitest/coverage-v8 | ^3.x | Code coverage | Built-in V8 coverage, faster than Istanbul |
| rollup-plugin-visualizer | ^6.x | Bundle analysis | Verifying lodash removal and bundle size |
| @vitest/ui | ^3.x | Test UI dashboard | Optional visual test runner interface |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vitest | Jest | Jest is slower (no Vite pipeline), requires more config, but has larger ecosystem |
| CSS Modules | Styled-components | CSS-in-JS has runtime cost, CSS Modules are zero-runtime and align with Phase 4 |
| useMemo | lodash.memoize | Lodash adds bundle size, React hooks are zero-dependency |

**Installation:**
```bash
npm install -D vitest jsdom @testing-library/react @testing-library/dom @testing-library/user-event @testing-library/jest-dom @vitest/coverage-v8 rollup-plugin-visualizer
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── Header/
│   │   ├── Header.tsx
│   │   ├── Header.test.tsx           # Co-located test
│   │   └── Header.module.css         # CSS Module
│   ├── Perlin.tsx
│   ├── Perlin.test.tsx              # Co-located test
│   ├── Waves.tsx
│   ├── Waves.test.tsx
│   └── WavyBackground.tsx
├── App.tsx
├── App.test.tsx
└── setupTests.ts                    # Vitest setup file
```

### Pattern 1: Vitest Configuration in vite.config.ts
**What:** Unified configuration leveraging existing Vite setup
**When to use:** Always for Vite projects (recommended by Vitest docs)
**Example:**
```typescript
// Source: https://vitest.dev/config/
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,              // Enable global test APIs (describe, it, expect)
    environment: 'jsdom',       // Browser-like environment for React components
    setupFiles: './src/setupTests.ts',
    css: true,                  // Parse CSS imports (needed for CSS Modules)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/setupTests.ts']
    }
  }
})
```

### Pattern 2: Component Testing with React Testing Library
**What:** Behavior-driven testing using queries that mirror user interactions
**When to use:** All React component tests
**Example:**
```typescript
// Source: https://testing-library.com/docs/react-testing-library/intro/
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'

describe('Header', () => {
  it('renders navigation links', () => {
    render(<Header />)

    // Query by role (most accessible, recommended first choice)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
  })

  it('handles menu toggle', async () => {
    const user = userEvent.setup()
    render(<Header />)

    const menuButton = screen.getByRole('button', { name: /menu/i })
    await user.click(menuButton)

    // Assert visible change
    expect(screen.getByRole('menu')).toBeVisible()
  })
})
```

### Pattern 3: Testing Deterministic Algorithms (Perlin Noise)
**What:** Verify algorithm output matches known reference values
**When to use:** Pure functions with predictable output given same input
**Example:**
```typescript
// Source: Research findings on Perlin noise determinism
import { describe, it, expect } from 'vitest'
import Perlin from './Perlin'

describe('Perlin noise algorithm', () => {
  it('produces deterministic output for same seed and coordinates', () => {
    const perlin1 = new Perlin(12345)
    const perlin2 = new Perlin(12345)

    const value1 = perlin1.simplex2(3.14, 42)
    const value2 = perlin2.simplex2(3.14, 42)

    expect(value1).toBe(value2) // Exact match for deterministic function
  })

  it('produces consistent values across multiple calls', () => {
    const perlin = new Perlin(54321)

    // Known reference value (can be computed once and recorded)
    expect(perlin.simplex2(0, 0)).toBeCloseTo(0, 5)
    expect(perlin.simplex2(1.5, 2.5)).toMatchSnapshot()
  })

  it('produces different output for different seeds', () => {
    const perlin1 = new Perlin(111)
    const perlin2 = new Perlin(222)

    expect(perlin1.simplex2(5, 5)).not.toBe(perlin2.simplex2(5, 5))
  })
})
```

### Pattern 4: Stabilizing Random Values with useMemo
**What:** Memoize random values to prevent regeneration on every render
**When to use:** Any computed values (especially random) that should remain stable across renders
**Example:**
```typescript
// Source: https://react.dev/reference/react/useMemo
import { useMemo } from 'react'

function App() {
  const numWaves = 5

  // BAD: Regenerates on every render (current bug in App.tsx)
  // const amplitudeNoise = random(-20, 20)

  // GOOD: Computed once, stable across renders
  const waveNoiseOffsets = useMemo(() => {
    return Array.from({ length: numWaves }, () => ({
      amplitude: Math.random() * 40 - 20,   // Range: -20 to 20
      speed: Math.random() * 0.01 - 0.005,  // Range: -0.005 to 0.005
      points: Math.random() * 2 - 1          // Range: -1 to 1
    }))
  }, [numWaves]) // Only recompute if numWaves changes

  return (
    <div>
      {waveNoiseOffsets.map((noise, index) => (
        <WavyBackground
          key={index}
          options={{
            amplitude: scrollY.to({
              output: [100 + index * noise.amplitude, 200 + index * noise.amplitude]
            }),
            // ... use noise.speed, noise.points
          }}
        />
      ))}
    </div>
  )
}
```

### Pattern 5: CSS Modules with TypeScript
**What:** Scoped CSS with automatic type generation
**When to use:** Component-level styling in React + Vite + TypeScript projects
**Example:**
```css
/* Header.module.css */
/* Source: https://vite.dev/guide/features */
.header {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
}

.navList {
  list-style: none;
  display: flex;
  gap: 1rem;
}
```

```typescript
// Header.tsx
import styles from './Header.module.css'

function Header() {
  return (
    <header className={styles.header}>
      <nav>
        <ul className={styles.navList}>
          <li><a href="#home">Home</a></li>
        </ul>
      </nav>
    </header>
  )
}
```

**TypeScript types:** Vite automatically generates types for CSS Modules when `vite/client` is in tsconfig.json `compilerOptions.types`. No plugin needed.

### Pattern 6: ESLint Flat Config no-console Rule
**What:** Enforce zero console statements at error level
**When to use:** All production codebases (disable selectively for Node.js scripts if needed)
**Example:**
```javascript
// Source: https://eslint.org/docs/latest/rules/no-console
// eslint.config.js (flat config format)
import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-console': 'error'  // Build fails if console.* appears in code
      // Or with selective allowances:
      // 'no-console': ['error', { allow: ['warn', 'error'] }]
    }
  }
)
```

### Anti-Patterns to Avoid
- **Testing implementation details:** Don't test component state, props, or internal methods. Test visible output and user interactions.
- **Overusing snapshots:** Snapshots should be used sparingly for stable, rarely-changing output. They become maintenance burdens for dynamic components.
- **Memoizing everything:** Don't wrap every value in useMemo or every function in useCallback. Only optimize when profiling shows a problem.
- **Mocking excessively:** Only mock external dependencies (APIs, timers). Don't mock internal functions or React behavior.
- **Using @ts-expect-error as a shortcut:** Fix the root type issue instead of suppressing errors.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Test framework | Custom test runner with assertions | Vitest | Built-in watch mode, coverage, parallel execution, Vite integration |
| Component testing queries | document.querySelector | @testing-library/react queries | Accessibility-focused, resilient to refactoring, better error messages |
| User event simulation | Manual click/change events | @testing-library/user-event | More realistic (hover, focus, keyboard), async handling, clipboard support |
| Random value memoization | Custom caching logic | useMemo hook | React-optimized, handles dependency tracking, integrates with React lifecycle |
| CSS scoping | BEM naming conventions | CSS Modules | Automatic scoping, TypeScript support, zero runtime cost |
| Bundle analysis | Manual inspection | rollup-plugin-visualizer | Interactive treemap, size breakdown, identifies duplicates |

**Key insight:** Testing and build tooling has matured significantly. Hand-rolling solutions adds maintenance burden and misses edge cases (e.g., user-event handles focus/blur/keyboard better than manual events; CSS Modules handle :global, :local, composes better than manual scoping).

## Common Pitfalls

### Pitfall 1: Random Values Regenerating on Every Render
**What goes wrong:** In App.tsx lines 45-47, `random(-20, 20)` is called inside the map function, generating new values on every render. This causes wave animations to glitch and stutter because amplitude, speed, and points are constantly changing.
**Why it happens:** The map callback executes on every render, and `random()` is not memoized. React's reconciliation sees different props each time and forces WavyBackground to re-render with new animation parameters.
**How to avoid:** Use `useMemo` to compute random offsets once outside the render loop. See Pattern 4 above.
**Warning signs:**
- Visual stuttering or jittering in animations
- Performance degradation over time
- React DevTools showing excessive re-renders
- Animation parameters that should be stable keep changing

### Pitfall 2: Importing from Lodash Entire Library
**What goes wrong:** `import { random } from 'lodash'` bundles the entire lodash library (~70KB minified) even when only using one function. Vite/Rollup cannot tree-shake lodash effectively.
**Why it happens:** Lodash's module structure includes internal dependencies that prevent aggressive tree-shaking.
**How to avoid:** Replace with native JavaScript: `Math.random() * (max - min) + min`
**Warning signs:**
- Bundle size > 200KB for a simple portfolio site
- rollup-plugin-visualizer shows large lodash chunk
- Lighthouse performance score penalized for large JavaScript

### Pitfall 3: Testing with getByClassName or getByTestId First
**What goes wrong:** Tests become brittle and don't verify accessibility when querying by implementation details (class names, test IDs) instead of semantic roles.
**Why it happens:** Developers default to what's familiar (CSS selectors) rather than learning RTL's query priority.
**How to avoid:** Follow RTL query priority: 1) getByRole, 2) getByLabelText, 3) getByPlaceholderText, 4) getByText, 5) getByTestId (last resort)
**Warning signs:**
- Tests break when CSS classes are renamed
- Components lack proper ARIA attributes
- Accessibility audit tools report missing roles/labels

### Pitfall 4: Not Cleaning Up After Component Tests
**What goes wrong:** Test pollution occurs when components with side effects (timers, event listeners, global state) don't clean up properly.
**Why it happens:** Developers forget to clear timers or remove event listeners in cleanup functions.
**How to avoid:** React Testing Library auto-unmounts components after each test. For additional cleanup, use `afterEach` hooks. Vitest's `restoreMocks: true` resets mocks automatically.
**Warning signs:**
- Tests pass in isolation but fail when run together
- "Can't perform a React state update on an unmounted component" warnings
- Memory leaks in test suite

### Pitfall 5: Snapshot Testing Dynamic Content
**What goes wrong:** Snapshots fail on every test run for components with timestamps, random IDs, or dynamic data.
**Why it happens:** Snapshot captures everything including volatile values.
**How to avoid:** Use property matchers for dynamic values: `expect(obj).toMatchSnapshot({ id: expect.any(String), timestamp: expect.any(Number) })` or test specific properties instead of full snapshots.
**Warning signs:**
- Constant snapshot update prompts
- Snapshots with generated UUIDs or timestamps
- Team members blindly updating snapshots without reviewing changes

### Pitfall 6: Using console.log for Debugging in Production Code
**What goes wrong:** Debug statements leak into production, exposing internal logic and degrading user experience with console noise.
**Why it happens:** Developers forget to remove console statements after debugging.
**How to avoid:** Configure ESLint `no-console` rule at error level. Build pipeline fails if console statements exist.
**Warning signs:**
- Browser console shows debug messages on production site
- Console.log statements in src/ directory
- ESLint warnings (not errors) that get ignored

### Pitfall 7: TypeScript @ts-expect-error Without Comment
**What goes wrong:** Type errors are hidden without explanation, making future refactoring dangerous.
**Why it happens:** Quick fix to silence TypeScript errors during development.
**How to avoid:** Replace with proper types. If truly necessary, add detailed comment explaining why and track with TODO.
**Warning signs:**
- Multiple @ts-expect-error comments
- No explanation for type suppression
- Type errors reappear after library updates

## Code Examples

Verified patterns from official sources:

### Setup Files Configuration
```typescript
// Source: https://vitest.dev/config/
// src/setupTests.ts
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})
```

### Testing Waves Component
```typescript
// Source: React Testing Library best practices
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Waves from './Waves'

describe('Waves component', () => {
  it('renders SVG wave paths', () => {
    render(<Waves options={{ height: 300, amplitude: 100, speed: 0.05, points: 5 }} fill="blue" />)

    const svg = screen.getByRole('img', { hidden: true }) // SVG has implicit role
    expect(svg).toBeInTheDocument()

    const path = svg.querySelector('path')
    expect(path).toBeTruthy()
    expect(path?.getAttribute('fill')).toBe('blue')
  })

  it('uses Perlin noise for wave generation', () => {
    const { container } = render(<Waves options={{ height: 300, amplitude: 100, speed: 0.05, points: 5 }} fill="blue" />)

    const path = container.querySelector('path')
    const d = path?.getAttribute('d')

    // Path should start with M (moveto) and contain C (curveto) commands
    expect(d).toMatch(/^M/)
    expect(d).toContain('C')
  })

  it('animates over time', async () => {
    vi.useFakeTimers()
    const { container } = render(<Waves options={{ height: 300, amplitude: 100, speed: 0.05, points: 5, paused: false }} fill="blue" />)

    const getPathD = () => container.querySelector('path')?.getAttribute('d')
    const initialPath = getPathD()

    // Advance timers to trigger animation frame
    vi.advanceTimersByTime(100)

    await waitFor(() => {
      expect(getPathD()).not.toBe(initialPath)
    })

    vi.useRealTimers()
  })
})
```

### Replacing lodash.random with Native Math
```typescript
// BEFORE: Using lodash
import { random } from 'lodash'
const value = random(-20, 20)
const float = random(0.5, 1.5, true) // floating: true

// AFTER: Native JavaScript
const value = Math.floor(Math.random() * 41) - 20  // Range: -20 to 20 (integers)
const float = Math.random() * (1.5 - 0.5) + 0.5    // Range: 0.5 to 1.5 (floats)

// Helper function if needed in multiple places:
function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
```

### Bundle Analysis Setup
```typescript
// Source: https://github.com/btd/rollup-plugin-visualizer
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: true,  // Auto-open in browser after build
      gzipSize: true,
      brotliSize: true
    })
  ]
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Jest | Vitest | 2022-2023 | 10-20x faster for Vite projects, native ESM/TS support |
| Enzyme | React Testing Library | 2020 | Focus on behavior not implementation, better accessibility |
| fireEvent | @testing-library/user-event | 2021 | More realistic user interactions with proper event sequences |
| CSS-in-JS (styled-components) | CSS Modules | Ongoing | Zero runtime cost, better performance, simpler TypeScript integration |
| lodash for utilities | Native ES2020+ methods | 2020+ | Smaller bundle size, faster execution, no dependencies |
| ESLint .eslintrc.json | Flat config (eslint.config.js) | 2023-2024 (ESLint v9) | JavaScript-based, more flexible, better TypeScript support |

**Deprecated/outdated:**
- **Enzyme:** Enzyme is no longer actively maintained and doesn't support React 18+ hooks well. React Testing Library is the official recommendation.
- **Jest for Vite projects:** While Jest is mature and widely used, Vitest is specifically built for Vite's pipeline and is significantly faster. Jest requires additional config (babel, ts-jest) that Vitest handles natively.
- **lodash:** While not deprecated, lodash is no longer necessary for most utilities given native ES2020+ features (Array.prototype.flat, Object.fromEntries, optional chaining, nullish coalescing). Lodash adds ~70KB to bundles when not properly tree-shaken.
- **PureCSS:** PureCSS was last updated in 2019 and is effectively unmaintained. Modern alternatives (CSS Modules, Tailwind) provide better DX and flexibility.

## Open Questions

Things that couldn't be fully resolved:

1. **Mobile Menu Implementation**
   - What we know: Current Header component uses PureCSS menu system. Context says "Claude's discretion" for mobile implementation.
   - What's unclear: Does current PureCSS menu have working mobile behavior to preserve, or is it broken/unused?
   - Recommendation: Inspect live site on mobile during implementation. If no mobile menu exists, implement a basic hamburger toggle with CSS Modules. If existing behavior works, preserve UX while rewriting with CSS Modules.

2. **Snapshot Testing Scope**
   - What we know: Context says "Claude's discretion based on component complexity." Perlin/Waves components are complex, Header is simple.
   - What's unclear: Exact threshold for "complex enough for snapshots."
   - Recommendation: Use snapshots for Perlin noise deterministic output (numerical values), skip for React component UI (too volatile). Focus on behavioral tests for components.

3. **Test Coverage Thresholds**
   - What we know: Context specifies 60% overall baseline.
   - What's unclear: Should coverage be enforced per-file or globally? Should any files be excluded (e.g., types, config)?
   - Recommendation: Configure global threshold at 60%, exclude setupTests.ts and vite.config.ts. Track per-file coverage but don't enforce strict thresholds initially.

4. **TypeScript @ts-expect-error Locations**
   - What we know: Context says fix all @ts-expect-error with proper types. Grep found one in WavyBackground.tsx.
   - What's unclear: What specific type issue exists in WavyBackground.tsx? Is it a react-spring type definition issue or improper prop usage?
   - Recommendation: Investigate during implementation. If react-spring types are incomplete, either extend types manually or file issue upstream. Avoid @ts-expect-error unless library types are fundamentally broken.

5. **Console Warnings from Libraries**
   - What we know: ESLint no-console should be error level. Context mentions "Claude's discretion for library console warning handling."
   - What's unclear: Should ESLint ignore node_modules (standard practice) or do we need special handling?
   - Recommendation: Standard ESLint config ignores node_modules by default. No special handling needed. Focus on removing console.* from src/.

## Sources

### Primary (HIGH confidence)
- [Vitest Official Guide](https://vitest.dev/guide/) - Configuration and features
- [Vitest Config Reference](https://vitest.dev/config/) - All configuration options
- [Vitest Snapshot Guide](https://vitest.dev/guide/snapshot) - Snapshot testing API
- [React Testing Library Intro](https://testing-library.com/docs/react-testing-library/intro/) - Core principles and setup
- [ESLint no-console Rule](https://eslint.org/docs/latest/rules/no-console) - Rule configuration and examples
- [Vite Features - CSS Modules](https://vite.dev/guide/features) - Built-in CSS Modules support
- [React useMemo Reference](https://react.dev/reference/react/useMemo) - Official React documentation

### Secondary (MEDIUM confidence)
- [How to Unit Test React Components with Vitest and React Testing Library](https://oneuptime.com/blog/post/2026-01-15-unit-test-react-vitest-testing-library/view) - 2026 setup guide
- [Testing in 2026: Jest, React Testing Library, and Full Stack Testing Strategies](https://www.nucamp.co/blog/testing-in-2026-jest-react-testing-library-and-full-stack-testing-strategies) - Current testing best practices
- [Complete Guide to Setting Up React with TypeScript and Vite (2026)](https://medium.com/@robinviktorsson/complete-guide-to-setting-up-react-with-typescript-and-vite-2025-468f6556aaf2) - Modern React setup
- [Type-safe use of CSS Modules with TypeScript in React x Vite](https://dev.to/activeguild/type-safe-development-with-vite-x-react-x-css-modules-x-typescript-1ebc) - CSS Modules TypeScript integration
- [rollup-plugin-visualizer GitHub](https://github.com/btd/rollup-plugin-visualizer) - Bundle analysis tool documentation
- [ESLint Flat Config System](https://eslint.org/docs/latest/use/configure/configuration-files) - Modern ESLint configuration

### Tertiary (LOW confidence - contextual understanding)
- Multiple WebSearch results on Perlin noise determinism - Consistent findings across sources about deterministic output with same seed
- Community articles on useMemo/useCallback patterns - Consensus on when to use memoization (only when profiling shows problem)
- Stack Overflow discussions on RTL query priority - Aligns with official RTL documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All tools verified via official documentation and current 2026 sources
- Architecture: HIGH - Patterns sourced from official Vitest, RTL, React, and ESLint documentation
- Pitfalls: MEDIUM-HIGH - Common mistakes documented in multiple sources, some from experience-based articles

**Research date:** 2026-02-03
**Valid until:** 2026-03-31 (60 days) - Testing ecosystem is relatively stable. Vitest 3.x, RTL 16.x, and React 18.3 are current stable versions. Next major changes likely React 19 adoption (already released but not yet mainstream) and potential Vitest 4.x (no release timeline announced).

**Key dependencies verified:**
- Project currently uses: React 18.3.1, Vite 5.4.1, TypeScript 5.5.3
- No conflicts with recommended stack
- ESLint 9.9.0 already uses flat config format
- TypeScript strict mode enabled (good for type safety)