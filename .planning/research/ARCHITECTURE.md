# Architecture Patterns: React Portfolio with Animations

**Domain:** React portfolio site with canvas-based animations
**Researched:** 2026-02-03
**Confidence:** MEDIUM (based on codebase analysis and React ecosystem patterns; external verification unavailable)

## Current Architecture Analysis

### Existing Component Structure

```
App.tsx (functional)
├── Header.tsx (functional, PureCSS-based)
├── WavyBackground.tsx (functional wrapper)
│   └── Wave.tsx (CLASS COMPONENT - needs refactor)
│       └── Perlin.tsx (utility class - standalone)
└── Parallax/ParallaxLayer (react-spring components)
```

**Current Issues:**
- Mixed paradigm: Wave.tsx is class-based while all others are functional
- Animation state managed in Wave class lifecycle (componentDidMount, componentWillUnmount)
- requestAnimationFrame managed imperatively in class component
- CSS organization is inconsistent (CSS modules for waves, plain CSS for header, inline styles in App)
- No test coverage
- Tight coupling between Wave component and Perlin noise utility

## Recommended Architecture

### Component Boundaries

| Component | Responsibility | Communicates With | State Type |
|-----------|---------------|-------------------|------------|
| **App** | Layout orchestration, scroll handling | Header, WavyBackground, Parallax | React Spring scroll values |
| **Header** | Navigation UI | App (receives scroll state) | None (presentational) |
| **WavyBackground** | Animation wrapper, react-spring integration | Wave, App | Passes animated values |
| **Wave** | Canvas drawing, RAF loop, path generation | Perlin (utility), WavyBackground | Internal animation state |
| **Perlin** | Noise generation utility | Wave | None (pure functions) |

### Proposed Component Boundaries (Post-Refactor)

| Component | Responsibility | Communicates With | Hook Usage |
|-----------|---------------|-------------------|------------|
| **App** | Layout, scroll orchestration | All children | useScroll, useTrail |
| **Header** | Navigation | App | None |
| **AnimatedWaveLayer** | Wave rendering coordinator | useWaveAnimation hook | Custom hooks |
| **WaveCanvas** | SVG path rendering (presentational) | AnimatedWaveLayer | None |
| **useWaveAnimation** | RAF loop, animation state, path calculation | Perlin utility | useRef, useEffect, useState |
| **usePerlinNoise** | Noise instance management | Perlin class | useMemo, useRef |

## Data Flow Patterns

### Current Data Flow (Problems)

```
App (generates scroll values)
  ↓ (via react-spring Interpolation)
WavyBackground (wraps with animated())
  ↓ (props: height, amplitude, speed as Interpolation)
Wave CLASS COMPONENT
  ↓ (reads .get() on Interpolation in _calculateWavePoints)
  ├── Internal RAF loop
  ├── Internal Perlin instance
  └── setState({ path })
      ↓
    SVG path render
```

**Problem:** Class component must call `.get()` on Interpolation values, breaking reactive flow. RAF loop is imperatively managed in lifecycle methods.

### Recommended Data Flow (Solution)

```
App (generates scroll values with useScroll)
  ↓ (animated values)
AnimatedWaveLayer
  ↓ (uses useWaveAnimation hook)
useWaveAnimation
  ├── usePerlinNoise (manages Perlin instance)
  ├── useAnimationFrame (manages RAF loop)
  ├── Calculates path from animated values
  └── Returns { path, containerRef }
      ↓
    WaveCanvas (presentational SVG)
```

**Benefits:**
- Functional reactive flow (no `.get()` calls)
- Composable hooks
- Testable in isolation
- Clear separation of concerns

## Migration Patterns

### Pattern 1: Class to Functional Component Migration

**Current Wave.tsx structure:**
```typescript
class Wave extends React.Component {
  _elapsed: number
  _step: number
  _noise: Perlin
  container: React.RefObject<HTMLDivElement>
  _frameId?: number

  componentDidMount() {
    this._containerWidth = this.container.current?.offsetWidth
    this._lastUpdate = performance.now()
    this._frameId = window.requestAnimationFrame(this._update)
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this._frameId)
  }
}
```

**Recommended functional equivalent:**
```typescript
function Wave({ points, speed, amplitude, height, paused }: WaveProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { path } = useWaveAnimation({
    containerRef,
    points,
    speed,
    amplitude,
    height,
    paused
  })

  return (
    <div ref={containerRef}>
      <svg>
        <path d={path} />
      </svg>
    </div>
  )
}
```

**Custom hook structure:**
```typescript
function useWaveAnimation(options: WaveAnimationOptions) {
  const { containerRef, points, speed, amplitude, height, paused } = options

  // Perlin noise instance (stable across renders)
  const noise = usePerlinNoise()

  // Animation state
  const [path, setPath] = useState('')
  const elapsed = useRef(0)
  const lastUpdate = useRef<number>()

  // RAF loop management
  useAnimationFrame((timestamp) => {
    if (paused) return

    // Calculate wave points using noise
    // Build path
    // setPath(newPath)
  }, [paused])

  return { path }
}
```

**Lifecycle equivalents:**
- `componentDidMount` → `useEffect(() => { ... }, [])`
- `componentWillUnmount` → `useEffect(() => { return () => { ... } }, [])`
- `componentDidUpdate` → `useEffect(() => { ... }, [deps])`
- Instance variables → `useRef()`
- `this.state` → `useState()` or `useReducer()`

### Pattern 2: Animation Value Flow with react-spring

**Current approach (requires .get() calls):**
```typescript
const speed = typeof this.props.speed === "number"
  ? this.props.speed
  : this.props.speed.get()
```

**Recommended approach (reactive):**

Option A: Use animated() on the entire component
```typescript
const AnimatedWave = animated(Wave)

// In App.tsx
<AnimatedWave
  height={scrollY.to([0, h], [h/2, h])}
  amplitude={scrollY.to([0, h], [100, 200])}
/>

// In Wave (receives animated values, no .get() needed)
function Wave({ height, amplitude }) {
  useSpring({ height, amplitude }) // Subscribes to changes
}
```

Option B: Use useSpring to consume Interpolation
```typescript
function Wave({ heightInterpolation, amplitudeInterpolation }) {
  const { height, amplitude } = useSpring({
    height: heightInterpolation,
    amplitude: amplitudeInterpolation
  })

  // Use height.get() only when needed in calculations
}
```

**Recommended for this project:** Option A - fully embrace animated() wrapper pattern already started in WavyBackground.tsx.

### Pattern 3: Custom Hooks for Complex Logic

**Extract animation logic into hooks:**

```typescript
// usePerlinNoise.ts
export function usePerlinNoise(seed?: number) {
  const noiseRef = useRef<Perlin>()

  if (!noiseRef.current) {
    noiseRef.current = new Perlin(seed ?? random(true))
  }

  return noiseRef.current
}

// useAnimationFrame.ts
export function useAnimationFrame(
  callback: (timestamp: number) => void,
  deps: DependencyList = []
) {
  const frameIdRef = useRef<number>()
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const loop = (timestamp: number) => {
      callbackRef.current(timestamp)
      frameIdRef.current = requestAnimationFrame(loop)
    }

    frameIdRef.current = requestAnimationFrame(loop)

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current)
      }
    }
  }, deps)
}

// useWaveCalculation.ts
export function useWaveCalculation({
  points,
  speed,
  amplitude,
  height,
  containerWidth,
  step
}: WaveCalculationOptions) {
  const noise = usePerlinNoise()

  return useMemo(() => {
    const wavePoints = []
    const scale = 100
    const stepValue = (containerWidth ?? 0) / points

    for (let i = 0; i <= points; i++) {
      const seed = step * i + ((speed / scale) * stepValue)
      const noiseValue = noise.perlin2(seed / scale, 1)
      const y = noiseValue * amplitude + height
      wavePoints.push({ x: i * stepValue, y })
    }

    return buildPath(wavePoints, containerWidth, containerHeight)
  }, [points, speed, amplitude, height, containerWidth, step])
}
```

**Benefits:**
- Each hook has single responsibility
- Easy to test in isolation
- Composable and reusable
- Clear dependencies

## CSS Organization Strategy

### Current State Analysis

```
Current CSS organization:
├── src/index.css (global styles, 435 lines)
├── src/App.css (minimal)
├── src/components/waves.module.css (CSS Module)
├── src/components/Header/header.css (plain CSS)
└── Inline styles in JSX (App.tsx, Wave.tsx)
```

**Problems:**
- No consistent strategy
- Large global stylesheet with component-specific rules
- Mix of approaches creates maintenance burden
- PureCSS framework adds extra dependency for header only

### Recommendation: Hybrid Approach

**For this portfolio project:**

```
Recommended organization:
├── CSS Modules for component-specific styles
│   ├── Wave.module.css
│   ├── Header.module.css
│   └── App.module.css
├── Global theme (minimal - CSS custom properties)
│   └── theme.css
└── Inline animated() styles (react-spring only)
    └── Only for values that change via animation
```

**Rationale:**

| Approach | When to Use | Why |
|----------|------------|-----|
| **CSS Modules** | Static component styles | Scoped, co-located, no runtime cost |
| **CSS Custom Properties** | Theme values, shared constants | Browser-native, easy to override |
| **Inline animated() styles** | react-spring animated values | Required by react-spring, optimized for performance |
| **Avoid CSS-in-JS** | N/A | Adds runtime overhead for static styles, unnecessary for this project |
| **Avoid Tailwind** | N/A | Overkill for small portfolio, would require refactor of existing styles |

**Migration strategy:**
1. Keep existing CSS Modules for Wave component
2. Convert header.css → Header.module.css
3. Extract theme values from index.css → theme.css (CSS custom properties)
4. Move component-specific rules from index.css to respective .module.css files
5. Keep only global resets and theme in index.css

### Pattern 4: CSS Module with TypeScript

```typescript
// Wave.module.css
.waveContainer {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  mix-blend-mode: screen;
}

// Wave.tsx
import styles from './Wave.module.css'

export function Wave() {
  return (
    <div className={styles.waveContainer}>
      {/* ... */}
    </div>
  )
}
```

**Benefits:**
- Type-safe class names (with typescript-plugin-css-modules)
- Scoped to component
- No runtime cost
- Easy to tree-shake

## Testing Architecture

### Recommended Test Organization (Vite + Vitest)

```
Recommended structure:
src/
├── components/
│   ├── Wave/
│   │   ├── Wave.tsx
│   │   ├── Wave.module.css
│   │   ├── Wave.test.tsx
│   │   └── hooks/
│   │       ├── useWaveAnimation.ts
│   │       ├── useWaveAnimation.test.ts
│   │       ├── usePerlinNoise.ts
│   │       └── usePerlinNoise.test.ts
│   └── Header/
│       ├── Header.tsx
│       ├── Header.module.css
│       └── Header.test.tsx
├── utils/
│   ├── Perlin.ts
│   └── Perlin.test.ts
└── test/
    ├── setup.ts (test environment setup)
    └── mocks/ (shared mocks)
```

**Naming conventions:**
- Test files: `ComponentName.test.tsx` (co-located with component)
- Hook tests: `useHookName.test.ts` (co-located with hook)
- Utility tests: `utilityName.test.ts` (co-located with utility)

**Vitest configuration:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: {
      modules: {
        classNameStrategy: 'non-scoped'
      }
    }
  }
})
```

### Testing Strategy by Component Type

| Component Type | Testing Approach | Example |
|---------------|------------------|---------|
| **Pure utility (Perlin)** | Unit tests with input/output assertions | `expect(noise.perlin2(0.5, 0.5)).toBeCloseTo(expected)` |
| **Custom hooks** | Test with @testing-library/react-hooks or render hook | `const { result } = renderHook(() => useWaveAnimation(...))` |
| **Presentational components** | Snapshot + interaction tests | `expect(container).toMatchSnapshot()` |
| **Animated components** | Mock react-spring, test logic only | Mock `useSpring`, `animated` |
| **Integration (App)** | Test component interaction | Render full tree, assert behavior |

### Pattern 5: Testing Custom Hooks

```typescript
// useWaveAnimation.test.ts
import { renderHook } from '@testing-library/react'
import { useWaveAnimation } from './useWaveAnimation'

describe('useWaveAnimation', () => {
  it('should initialize with empty path', () => {
    const { result } = renderHook(() =>
      useWaveAnimation({
        points: 3,
        speed: 0.1,
        amplitude: 10,
        height: 50,
        paused: false
      })
    )

    expect(result.current.path).toBe('')
  })

  it('should update path when not paused', async () => {
    const { result, rerender } = renderHook(
      ({ paused }) => useWaveAnimation({
        points: 3,
        speed: 0.1,
        amplitude: 10,
        height: 50,
        paused
      }),
      { initialProps: { paused: false } }
    )

    // Wait for animation frame
    await waitFor(() => {
      expect(result.current.path).not.toBe('')
    })
  })

  it('should not update path when paused', () => {
    const { result } = renderHook(() =>
      useWaveAnimation({
        points: 3,
        speed: 0.1,
        amplitude: 10,
        height: 50,
        paused: true
      })
    )

    const initialPath = result.current.path

    // Wait to ensure no update
    setTimeout(() => {
      expect(result.current.path).toBe(initialPath)
    }, 100)
  })
})
```

### Pattern 6: Testing with react-spring Mocks

```typescript
// src/test/mocks/react-spring.ts
import { vi } from 'vitest'

export const mockAnimated = {
  div: 'div',
  path: 'path',
  svg: 'svg'
}

export const mockUseSpring = vi.fn((config) => config)
export const mockUseScroll = vi.fn(() => ({
  scrollY: { get: () => 0, to: vi.fn() }
}))

// In test file
vi.mock('@react-spring/web', () => ({
  animated: mockAnimated,
  useSpring: mockUseSpring,
  useScroll: mockUseScroll,
  config: { wobbly: {} }
}))
```

## Component Composition Patterns

### Pattern 7: Compound Components

For complex components like Wave, use compound component pattern:

```typescript
// Flexible API
<Wave>
  <Wave.Container>
    <Wave.Canvas points={5} />
    <Wave.Overlay />
  </Wave.Container>
</Wave>

// Or simple API
<Wave points={5} />
```

**Not recommended for this project** - Wave component is leaf-level, simple API sufficient.

### Pattern 8: Render Props (Legacy - Avoid)

```typescript
// DON'T DO THIS (legacy pattern)
<Wave render={({ path }) => <CustomSVG path={path} />} />
```

**Use hooks instead** - More composable, cleaner.

### Pattern 9: Higher-Order Components (Legacy - Avoid)

```typescript
// DON'T DO THIS (legacy pattern)
const AnimatedWave = withAnimation(Wave)
```

**Use hooks + animated() instead** - Already doing this correctly in WavyBackground.tsx.

### Pattern 10: Container/Presentational Split

**Recommended for Wave refactor:**

```typescript
// WaveContainer.tsx (smart component)
export function WaveContainer({
  points, speed, amplitude, height, paused, fill, style
}: WaveContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { path } = useWaveAnimation({
    containerRef,
    points,
    speed,
    amplitude,
    height,
    paused
  })

  return (
    <WavePresentation
      containerRef={containerRef}
      path={path}
      fill={fill}
      style={style}
    />
  )
}

// WavePresentation.tsx (dumb component)
export function WavePresentation({
  containerRef,
  path,
  fill,
  style
}: WavePresentationProps) {
  return (
    <div ref={containerRef} style={style}>
      <svg width="100%" height="100%">
        <path d={path} fill={fill} />
      </svg>
    </div>
  )
}

// Export as single component
export const Wave = animated(WaveContainer)
```

**Benefits:**
- Logic (container) is testable without rendering
- Presentation is testable with snapshots
- Clear separation of concerns

## Refactoring Order & Dependencies

### Phase 1: Foundation (No dependencies)
1. **Set up testing infrastructure**
   - Install vitest, @testing-library/react
   - Create vitest.config.ts
   - Create test setup files
   - Add test script to package.json

2. **Extract Perlin utility tests**
   - Create Perlin.test.ts
   - Test perlin2, simplex2 methods
   - Verify deterministic output for same seed

### Phase 2: Hooks Extraction (Depends on Phase 1)
3. **Create usePerlinNoise hook**
   - Extract noise instance management
   - Write tests
   - Stable across renders

4. **Create useAnimationFrame hook**
   - Extract RAF loop logic
   - Write tests with fake timers
   - Cleanup on unmount

5. **Create useWaveCalculation hook**
   - Extract point calculation logic
   - Write tests with known inputs
   - Pure function tests

### Phase 3: Component Refactor (Depends on Phase 2)
6. **Create functional Wave component**
   - Use hooks from Phase 2
   - Keep same props interface
   - Write component tests

7. **Update WavyBackground wrapper**
   - Ensure animated() wrapper still works
   - Test integration with react-spring

8. **Delete old Wave class component**
   - Remove class-based implementation
   - Verify all tests pass

### Phase 4: CSS Organization (Independent, can run parallel)
9. **Create Wave.module.css**
   - Move styles from waves.module.css
   - Add CSS module types

10. **Create Header.module.css**
    - Convert header.css to module
    - Update imports

11. **Extract theme.css**
    - CSS custom properties for colors, spacing
    - Remove from index.css

### Phase 5: Optimization (Depends on Phase 3)
12. **Memoization**
    - Add React.memo where appropriate
    - Use useMemo for expensive calculations
    - Profile with React DevTools

13. **Performance testing**
    - Add performance benchmarks
    - Monitor RAF timing
    - Optimize as needed

## Anti-Patterns to Avoid

### Anti-Pattern 1: Using .get() in Render
**What:** Calling `.get()` on animated values during render
```typescript
// DON'T
function Wave({ animatedHeight }) {
  const height = animatedHeight.get() // Breaks reactivity
  return <div style={{ height }} />
}
```

**Why bad:** Breaks react-spring's reactive flow, forces manual updates
**Instead:** Use animated() wrapper or useSpring to consume values

### Anti-Pattern 2: Managing RAF in Component State
**What:** Storing requestAnimationFrame ID in useState
```typescript
// DON'T
const [frameId, setFrameId] = useState<number>()

useEffect(() => {
  const id = requestAnimationFrame(loop)
  setFrameId(id) // Causes re-render
}, [])
```

**Why bad:** Causes unnecessary re-renders
**Instead:** Use useRef for RAF IDs

### Anti-Pattern 3: New Perlin Instance on Every Render
**What:** Creating new noise instance without memoization
```typescript
// DON'T
function Wave() {
  const noise = new Perlin(random(true)) // New instance every render!
}
```

**Why bad:** Breaks animation continuity, memory leak
**Instead:** Use useRef or useMemo to stabilize instance

### Anti-Pattern 4: Mixing Inline Styles and CSS Modules
**What:** Inconsistent styling approach
```typescript
// DON'T (pick one strategy)
<div className={styles.wave} style={{ opacity: 0.5 }}>
```

**Why bad:** Hard to maintain, unclear precedence
**Instead:** Use CSS modules for static, inline for animated values only

### Anti-Pattern 5: Testing Implementation Details
**What:** Testing internal hook state
```typescript
// DON'T
expect(result.current._elapsed).toBe(1000) // Internal detail
```

**Why bad:** Brittle tests, couples to implementation
**Instead:** Test observable behavior (path changes, renders correctly)

### Anti-Pattern 6: Large Monolithic Components
**What:** 200+ line components with mixed concerns
```typescript
// Current Wave.tsx is 228 lines with:
// - Animation logic
// - Path calculation
// - Noise generation
// - Rendering
// - RAF management
```

**Why bad:** Hard to test, hard to understand, hard to modify
**Instead:** Split into hooks + presentational component (as shown above)

## Performance Considerations

### Optimization Strategy

| Concern | Current State | Target State | Approach |
|---------|--------------|--------------|----------|
| **Re-renders** | Every parent re-render triggers Wave | Memoized, stable props | React.memo + useMemo |
| **RAF overhead** | 30 FPS hardcoded | Adaptive or configurable | FPS prop or adaptive timing |
| **Noise calculation** | Recalculated every frame | Memoized when possible | useMemo for expensive calcs |
| **Path generation** | String concatenation | Same (fast enough) | Benchmark before optimizing |
| **Bundle size** | lodash in devDeps but used | Tree-shakeable imports | Import only `random` |

### Recommended Memoization

```typescript
// Wave component
export const Wave = React.memo(
  animated(WaveComponent),
  (prev, next) => {
    // Custom comparison for animated props
    return (
      prev.points === next.points &&
      prev.paused === next.paused
      // Don't compare animated values (they're stable references)
    )
  }
)

// Hook calculations
function useWaveAnimation(options) {
  const points = useMemo(
    () => calculatePoints(options),
    [options.step, options.points, options.speed]
  )

  const path = useMemo(
    () => buildPath(points),
    [points]
  )

  return { path }
}
```

## Migration Checklist

### Pre-Migration
- [ ] Set up Vitest configuration
- [ ] Create test directory structure
- [ ] Document current behavior (visual regression baseline)

### During Migration
- [ ] Extract usePerlinNoise hook with tests
- [ ] Extract useAnimationFrame hook with tests
- [ ] Extract useWaveCalculation hook with tests
- [ ] Create functional Wave component
- [ ] Write Wave component tests
- [ ] Update WavyBackground integration
- [ ] Verify animated() still works

### Post-Migration
- [ ] Delete Wave class component
- [ ] Organize CSS modules
- [ ] Add performance benchmarks
- [ ] Update documentation
- [ ] Run full test suite

## Dependencies Between Refactors

```
Testing Setup
    ├── No dependencies
    └── Blocks: All hook tests, component tests

usePerlinNoise hook
    ├── Depends: Testing setup
    └── Blocks: useWaveCalculation

useAnimationFrame hook
    ├── Depends: Testing setup
    └── Blocks: useWaveAnimation

useWaveCalculation hook
    ├── Depends: Testing setup, usePerlinNoise
    └── Blocks: useWaveAnimation

useWaveAnimation hook (orchestrator)
    ├── Depends: All above hooks
    └── Blocks: Wave component

Wave functional component
    ├── Depends: useWaveAnimation
    └── Blocks: Nothing (leaf component)

CSS Module organization
    ├── No dependencies (can run in parallel)
    └── Blocks: Nothing
```

## Sources

**Note:** WebSearch and WebFetch were unavailable during research. This document is based on:

- **HIGH confidence:** Codebase analysis (actual code read from repository)
- **MEDIUM confidence:** React ecosystem patterns (established patterns as of training cutoff January 2025)
- **Needs verification:**
  - Latest react-spring API changes (using version 9.7.4 from package.json)
  - Vitest current best practices (not installed yet)
  - CSS Modules with TypeScript latest patterns

**Recommended verification sources:**
- https://www.react-spring.dev/docs (official react-spring docs)
- https://vitest.dev/guide (official Vitest docs)
- https://react.dev/learn (official React docs)
- https://github.com/css-modules/css-modules (CSS Modules spec)

**Training data caveat:** Patterns described here are based on React ecosystem as of January 2025. Always verify against official documentation for current versions.
