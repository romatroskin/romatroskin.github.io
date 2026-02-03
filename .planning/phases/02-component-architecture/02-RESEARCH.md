# Phase 2: Component Architecture - Research

**Researched:** 2026-02-03
**Domain:** React class-to-functional component migration with custom hooks and animation testing
**Confidence:** HIGH

## Summary

Migrating the Wave class component to a functional component with custom hooks is a well-established pattern in modern React. The standard approach involves extracting stateful logic into custom hooks (usePerlinNoise, useAnimationFrame), using useRef for animation state to avoid unnecessary re-renders, and useEffect for lifecycle management. React 18+ with react-spring 9.7+ fully supports functional components with the animated() HOC, provided the component forwards the style prop to native elements.

Testing strategy combines unit tests for hook logic, component smoke tests for render verification, and integration tests through the actual component usage. The existing Vitest setup with @testing-library/react and jsdom provides all necessary tools. Animation frame rate testing in jsdom is simulated at 60fps but can be controlled manually through elapsed time calculations.

**Primary recommendation:** Extract animation logic into useAnimationFrame and usePerlinNoise hooks, use useRef for non-rendering state (frame IDs, timestamps, noise instances), and verify visual parity through manual review since automated visual regression is deferred.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 | UI framework | Already in use, hooks API is stable since 16.8 |
| @react-spring/web | 9.7.4 | Animation library | Already in use, supports functional components via animated() HOC |
| TypeScript | 5.5.3 | Type safety | Already in use, required for type-safe hook APIs |

### Testing
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vitest | 4.0.18 | Test runner | Already configured (Phase 01 decision TEST-001) |
| @testing-library/react | 16.3.2 | Component testing | Already in use, includes renderHook for hooks testing in v13+ |
| @testing-library/jest-dom | 6.9.1 | DOM matchers | Already configured (Phase 01 decision TEST-002) |
| @vitest/coverage-v8 | 4.0.18 | Coverage reporting | Already configured (Phase 01 decision TEST-003) |
| jsdom | 28.0.0 | DOM simulation | Already configured for Vitest environment |

### Supporting
No additional libraries needed — all required tools are already in package.json.

**Installation:**
```bash
# No installation needed - all dependencies present
npm test  # Verify test environment works
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/           # Component files
│   ├── Waves.tsx        # Migrated functional Wave component
│   ├── waves.module.css # Existing styles
│   ├── WavyBackground.tsx # May need updates for new Wave API
│   ├── Perlin.tsx       # Existing, unchanged
│   └── Header/          # Existing, needs smoke test
├── hooks/               # Custom hooks (Claude's discretion on location)
│   ├── useAnimationFrame.ts   # RAF management
│   └── usePerlinNoise.ts      # Noise instance management
└── __tests__/           # OR co-located *.test.tsx files
    ├── Waves.test.tsx
    ├── App.test.tsx
    ├── Header.test.tsx
    └── WavyBackground.test.tsx
```

### Pattern 1: Class Component to Functional Migration

**What:** Systematic conversion from class lifecycle methods to hooks equivalents

**When to use:** Any class component migration, especially for components with animation state

**Lifecycle Mapping:**
- `constructor` → useState/useRef initialization
- `componentDidMount` → useEffect with [] dependencies
- `componentDidUpdate` → useEffect with specific dependencies
- `componentWillUnmount` → useEffect cleanup return function
- Instance variables (`this._elapsed`) → useRef
- State (`this.state`) → useState (only if changes trigger renders)

**Example:**
```typescript
// Source: React official docs (https://react.dev/reference/react/hooks)
// Class pattern
class Wave extends React.Component {
  constructor(props) {
    super(props);
    this.state = { path: "" };
    this._elapsed = 0;
    this._frameId = undefined;
  }

  componentDidMount() {
    this._frameId = requestAnimationFrame(this._update);
  }

  componentWillUnmount() {
    cancelAnimationFrame(this._frameId);
  }
}

// Functional pattern
function Wave(props) {
  const [path, setPath] = useState("");
  const elapsed = useRef(0);
  const frameId = useRef<number>();

  useEffect(() => {
    frameId.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId.current!);
  }, []);
}
```

### Pattern 2: useAnimationFrame Custom Hook

**What:** Encapsulate requestAnimationFrame lifecycle management in a reusable hook

**When to use:** Any component needing smooth animations at controlled frame rates

**Key principles:**
- Use useRef for frameId and lastUpdate timestamp (don't trigger renders)
- Initialize RAF once in useEffect with empty dependency array
- Use functional setState updates to access current state in RAF callback
- Return cleanup function to cancel animation on unmount
- Accept callback parameter for reusability

**Example:**
```typescript
// Source: CSS-Tricks article (https://css-tricks.com/using-requestanimationframe-with-react-hooks/)
function useAnimationFrame(callback: (deltaTime: number) => void) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [callback]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [animate]);
}
```

### Pattern 3: react-spring animated() HOC with Functional Components

**What:** Wrap functional components with animated() to enable SpringValue props

**Requirements:** Component MUST forward style prop to a native DOM element

**Example:**
```typescript
// Source: react-spring docs (https://react-spring.dev/docs/concepts/animated-elements)
// Functional component that can be animated
function Wave({ style, ...props }: WaveProps) {
  return (
    <div style={style}>  {/* MUST forward style prop */}
      <svg>{/* ... */}</svg>
    </div>
  );
}

// Wrap with animated()
const AnimatedWave = animated(Wave);

// Use with SpringValues
<AnimatedWave
  style={{
    transform: scrollY.to(value => `scaleY(${value})`)
  }}
/>
```

### Pattern 4: Hook Testing with renderHook

**What:** Test custom hooks in isolation using @testing-library/react's renderHook

**When to use:** Unit testing hook logic without full component render

**Example:**
```typescript
// Source: Testing Library docs + WebSearch findings
import { renderHook } from '@testing-library/react';

test('useAnimationFrame calls callback on each frame', () => {
  const callback = vi.fn();
  const { result } = renderHook(() => useAnimationFrame(callback));

  // Advance time and verify callback was called
  vi.advanceTimersByTime(16); // ~60fps
  expect(callback).toHaveBeenCalled();
});
```

### Pattern 5: Component Smoke Tests

**What:** Minimal test verifying component renders without crashing

**When to use:** All components as baseline test coverage

**Example:**
```typescript
// Source: Multiple testing guides from WebSearch
import { render } from '@testing-library/react';

test('App renders without crashing', () => {
  render(<App />);
  // Test passes if no error thrown
});

test('Header contains navigation', () => {
  const { getByText } = render(<Header />);
  expect(getByText('Home')).toBeInTheDocument();
});
```

### Anti-Patterns to Avoid

- **Using useState for animation frame state:** Causes unnecessary re-renders on every frame (30-60fps). Use useRef instead for frameId, timestamps, elapsed time.
- **Missing dependencies in useEffect:** Leads to stale closures. Always include all used variables or use functional updates.
- **Not cleaning up RAF:** Memory leaks if requestAnimationFrame continues after unmount. Always return cleanup function from useEffect.
- **Overusing useMemo/useCallback:** Adds complexity without measured benefit. Use only for proven performance bottlenecks.
- **Testing implementation details:** Don't test hook internals; test behavior and output.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Animation frame throttling | Custom frame rate limiter with timestamps | Built-in elapsed time checks in RAF callback | Already implemented in current Wave component (lines 154-166), proven pattern |
| DOM measurement | Manual offsetWidth/Height in RAF | ResizeObserver or measure in useEffect | But current pattern acceptable for this use case |
| Spring animations | Custom easing functions | react-spring's SpringValues | Already integrated, more complex than it looks |
| Noise generation | Custom noise algorithm | Existing Perlin class | Already tested and working (Phase 01) |

**Key insight:** Animation frame management looks simple but has subtle bugs around cleanup, state closure, and performance. Use established patterns.

## Common Pitfalls

### Pitfall 1: Stale Closures in RAF Callbacks

**What goes wrong:** Animation callback uses outdated prop/state values because it was captured at initialization

**Why it happens:** useEffect with empty [] creates closure over initial values; RAF callback keeps running with stale references

**How to avoid:**
- Use useRef for values that change but don't need re-renders
- Use functional setState updates: `setState(prev => prev + delta)`
- For props that change, use refs: `propsRef.current = props`

**Warning signs:**
- Animation doesn't respond to prop changes
- State updates appear to "lag behind" or use wrong values
- Console logs in RAF show old prop values

### Pitfall 2: Forgetting `this.` Removal

**What goes wrong:** Copy-paste class methods but keep `this.props` or `this.state` references

**Why it happens:** Muscle memory from class components during migration

**How to avoid:**
- Search for all `this.` references and convert to direct variable access
- TypeScript will catch most of these, but not all (e.g., in comments)
- Review every method being migrated line-by-line

**Warning signs:**
- TypeScript errors about 'this' implicitly has type 'any'
- Runtime errors: "Cannot read property 'props' of undefined"

### Pitfall 3: requestAnimationFrame in jsdom Tests

**What goes wrong:** Tests that rely on RAF timing behave unpredictably or fail intermittently

**Why it happens:** jsdom simulates RAF with setInterval at 60fps, not actual browser timing

**How to avoid:**
- Use fake timers: `vi.useFakeTimers()` and manually advance time
- Test behavior, not frame timing (e.g., "path updates" not "updates at 30fps")
- For frame rate verification, calculate expected frame interval manually
- Consider manual review for actual visual smoothness

**Warning signs:**
- Tests pass locally but fail in CI
- Timing-dependent assertions are flaky
- Need to add arbitrary delays to make tests pass

### Pitfall 4: Unnecessary Re-renders from Prop Changes

**What goes wrong:** Component re-renders on every parent render, breaking RAF performance

**Why it happens:** Not using React.memo or stable prop references

**How to avoid:**
- Wrap component with React.memo if props are stable
- Parent passes callbacks via useCallback with correct dependencies
- Parent passes objects via useMemo if they don't actually change
- BUT: Don't optimize prematurely; measure first

**Warning signs:**
- Animation stutters or drops frames
- DevTools profiler shows excessive renders
- Performance degrades with multiple wave instances

### Pitfall 5: Animated Component Not Animating

**What goes wrong:** Component wrapped with animated() but style changes don't animate

**Why it happens:** Component doesn't forward style prop to native DOM element

**How to avoid:**
- Ensure style prop is spread onto the root native element (div, svg, etc.)
- Check that react-spring SpringValues are passed via style prop
- Verify component is wrapped with animated()

**Warning signs:**
- No TypeScript errors but no animation occurs
- Style prop present in component but changes are instant, not animated
- react-spring logs show animations running but no visual change

## Code Examples

Verified patterns from official sources:

### Example 1: Basic useAnimationFrame Hook

```typescript
// Pattern from: https://css-tricks.com/using-requestanimationframe-with-react-hooks/
import { useEffect, useRef, useCallback } from 'react';

function useAnimationFrame(callback: (deltaTime: number) => void) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [callback]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate]);
}
```

### Example 2: Throttled Animation Frame (30fps target)

```typescript
// Pattern adapted from current Wave component + frame throttling articles
function useThrottledAnimationFrame(
  callback: (elapsed: number) => void,
  fps: number = 30,
  paused: boolean = false
) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const elapsedRef = useRef(0);

  const frameInterval = 1000 / fps;

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!paused && previousTimeRef.current !== undefined) {
        const elapsed = timestamp - previousTimeRef.current;

        if (elapsed >= frameInterval) {
          elapsedRef.current += elapsed;
          previousTimeRef.current = timestamp;
          callback(elapsedRef.current);
        }
      } else if (paused) {
        previousTimeRef.current = timestamp;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [callback, fps, paused, frameInterval]);

  return elapsedRef;
}
```

### Example 3: Perlin Noise Hook

```typescript
// Pattern: Encapsulate stateful instance in hook
import { useRef, useMemo } from 'react';
import Perlin from '../components/Perlin';

function usePerlinNoise(seed?: number) {
  // Stable seed if not provided
  const stableSeed = useMemo(() => seed ?? Math.random(), [seed]);

  // Create instance once
  const perlinRef = useRef<Perlin>();
  if (!perlinRef.current) {
    perlinRef.current = new Perlin(stableSeed);
  }

  return perlinRef.current;
}
```

### Example 4: Component Smoke Test

```typescript
// Pattern from: Testing Library best practices
import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';
import Header from './components/Header/Header';
import WavyBackground from './components/WavyBackground';

describe('Component smoke tests', () => {
  it('App renders without crashing', () => {
    render(<App />);
  });

  it('Header renders navigation elements', () => {
    const { getByText } = render(<Header />);
    expect(getByText('Home')).toBeInTheDocument();
  });

  it('WavyBackground renders with default props', () => {
    const { container } = render(
      <WavyBackground
        options={{
          points: 3,
          speed: 0.1,
          amplitude: 10,
          height: 50,
          paused: false
        }}
      />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
```

### Example 5: Hook Unit Test

```typescript
// Pattern from: @testing-library/react docs
import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

describe('usePerlinNoise', () => {
  it('returns same instance across re-renders', () => {
    const { result, rerender } = renderHook(() => usePerlinNoise(12345));
    const firstInstance = result.current;

    rerender();

    expect(result.current).toBe(firstInstance);
  });

  it('creates different instances for different seeds', () => {
    const { result: result1 } = renderHook(() => usePerlinNoise(111));
    const { result: result2 } = renderHook(() => usePerlinNoise(222));

    const value1 = result1.current.perlin2(5, 5);
    const value2 = result2.current.perlin2(5, 5);

    expect(value1).not.toBe(value2);
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Class components | Functional components with hooks | React 16.8 (2019) | Industry standard; class components legacy |
| Separate testing-library/react-hooks | renderHook in @testing-library/react | v13+ (2022) | One less dependency, simpler imports |
| Manual useMemo/useCallback everywhere | Use only for measured bottlenecks | React Compiler era (2024+) | Less boilerplate, better performance defaults |
| Jest | Vitest for new Vite projects | 2021+ | Faster, native ESM, better DX with Vite |
| Enzyme shallow rendering | Testing Library render | 2020+ | Test user behavior, not implementation |

**Deprecated/outdated:**
- **@testing-library/react-hooks package:** Merged into @testing-library/react v13+, use renderHook from main package
- **Component.defaultProps:** TypeScript default parameters preferred
- **componentWillReceiveProps/componentWillUpdate:** Use useEffect with dependencies instead

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal hook file location**
   - What we know: Can be src/hooks/ or co-located with components
   - What's unclear: No strong convention in React community; both patterns common
   - Recommendation: Claude's discretion based on reusability expectations; suggest src/hooks/ if hooks might be shared, co-located if Wave-specific

2. **Frame rate testing reliability in jsdom**
   - What we know: jsdom simulates RAF with setInterval at 60fps, can be unreliable
   - What's unclear: Best way to verify 30fps target without visual inspection
   - Recommendation: Test that throttling logic exists and elapsed time calculations are correct; defer actual frame rate verification to manual review

3. **Snapshot testing for SVG paths**
   - What we know: Could capture SVG path strings, but they're noise-based and vary per render
   - What's unclear: Whether deterministic seed + snapshot would be valuable
   - Recommendation: Claude's discretion; probably not worth it since manual visual review is the acceptance criteria

4. **WavyBackground prop interface changes**
   - What we know: WavyBackground currently wraps Wave class component
   - What's unclear: Whether Wave API changes will require WavyBackground updates
   - Recommendation: Maintain backward compatibility if possible, but OK to change if it improves design (per CONTEXT.md)

## Sources

### Primary (HIGH confidence)
- React Official Docs - Hooks Reference: https://react.dev/reference/react/hooks
- React Official Docs - Component Reference: https://react.dev/reference/react/Component
- react-spring Animated Elements: https://react-spring.dev/docs/concepts/animated-elements
- CSS-Tricks - useAnimationFrame Pattern: https://css-tricks.com/using-requestanimationframe-with-react-hooks/
- Testing Library - React Testing Library Intro: https://testing-library.com/docs/react-testing-library/intro

### Secondary (MEDIUM confidence)
- [Migrating from class components to React hooks](https://dev.to/subdeveloper/migrating-from-class-components-to-react-hooks-4lp3) - Community guide verified with official docs
- [React Fundamentals in 2026](https://www.nucamp.co/blog/react-fundamentals-in-2026-components-hooks-react-compiler-and-modern-ui-development) - Current year guidance
- [How to Test Custom React Hooks](https://kentcdodds.com/blog/how-to-test-custom-react-hooks) - Kent C. Dodds (React core team adjacent)
- [useState vs useRef](https://blog.logrocket.com/usestate-vs-useref/) - LogRocket technical article
- [When to useMemo and useCallback](https://kentcdodds.com/blog/usememo-and-usecallback) - Kent C. Dodds performance guidance

### Tertiary (LOW confidence - community patterns)
- [Using React Spring for animation](https://blog.logrocket.com/animations-with-react-spring/) - General react-spring usage
- [Vitest vs Jest 2026](https://dev.to/dataformathub/vitest-vs-jest-30-why-2026-is-the-year-of-browser-native-testing-2fgb) - Community comparison
- [React Testing Library smoke tests](https://create-react-app.dev/docs/running-tests/) - CRA patterns (still relevant)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in package.json, versions verified, no new dependencies needed
- Architecture patterns: HIGH - Core patterns verified with official React and react-spring docs; testing patterns verified with Testing Library
- Hook patterns: HIGH - useAnimationFrame pattern from authoritative CSS-Tricks article, verified against React official docs
- Testing approach: MEDIUM - renderHook from official Testing Library, but frame rate testing in jsdom has known limitations
- Pitfalls: HIGH - Based on current codebase analysis + verified migration guides + official warnings

**Research date:** 2026-02-03
**Valid until:** ~30 days (stable ecosystem - React/react-spring/Vitest patterns unlikely to change rapidly)
