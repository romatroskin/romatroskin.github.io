# Phase 6: Testing & Error Handling - Research

**Researched:** 2026-02-03
**Domain:** React Error Boundaries, Accessibility Testing (vitest-axe), Production Error Handling
**Confidence:** HIGH

## Summary

Phase 6 focuses on implementing comprehensive error boundaries and accessibility testing for production resilience. The standard approach uses `react-error-boundary` for modern error boundary implementation with functional component support, and `vitest-axe` for automated accessibility testing integrated with the existing Vitest test suite.

Error boundaries should be placed strategically at multiple levels (app-level catch-all plus section-level for critical features like wave animations) to provide graceful degradation without breaking the entire application. Accessibility testing with vitest-axe can automatically catch ~57% of WCAG issues and should be integrated into existing test files rather than maintained separately.

The tech stack already includes Vitest with jsdom (compatible with vitest-axe) and @testing-library/react, making integration straightforward. Wave animation errors require special handling due to their continuous rendering nature, and lazy-loaded sections benefit from error boundaries wrapping Suspense.

**Primary recommendation:** Use `react-error-boundary` with layered error boundaries (app-level + wave animation section-level), integrate `vitest-axe` into existing test files, implement localStorage feature detection with in-memory fallback, and configure React Spring to skip animations during tests.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-error-boundary | ^4.x | Modern error boundary implementation | Production-ready (239k+ dependents), functional component support, built-in retry/reset, TypeScript-first (93% TS), official React community recommendation |
| vitest-axe | ^1.x | Accessibility testing with axe-core | Direct jest-axe port for Vitest, mature axe-core engine, zero false positives design |
| axe-core | ^4.x | Accessibility testing engine | Industry standard (Deque), finds ~57% of WCAG issues automatically, supports WCAG 2.0/2.1/2.2 Level A/AA/AAA |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/jest-dom | ^6.x (existing) | DOM matchers for tests | Already in project, provides `toBeInTheDocument()` etc. |
| @testing-library/react | ^16.x (existing) | React component testing utilities | Already in project, provides `render()`, queries, etc. |
| @testing-library/user-event | ^14.x (existing) | User interaction simulation | Already in project, use for testing interactive components |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-error-boundary | Custom class component | Custom solution lacks retry logic, reset keys, and TypeScript types. Library is mature and maintained. |
| vitest-axe | Manual ARIA assertions | Manual testing catches <10% of issues, requires deep a11y expertise, very time-consuming |
| jsdom | happy-dom | happy-dom is incompatible with vitest-axe due to Node.prototype.isConnected bug |

**Installation:**
```bash
npm install --save-dev vitest-axe
npm install react-error-boundary
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── ErrorBoundary/
│   │   ├── ErrorBoundary.tsx           # Main error boundary wrapper
│   │   ├── FallbackUI.tsx              # Generic fallback component
│   │   ├── WaveAnimationFallback.tsx   # Wave-specific fallback
│   │   └── ErrorBoundary.test.tsx      # Error boundary tests + a11y
├── utils/
│   ├── storage.ts                      # localStorage wrapper with fallback
│   ├── errorLogging.ts                 # Error logging utilities (dev only)
└── setupTests.ts                       # Add vitest-axe matchers here
```

### Pattern 1: Layered Error Boundaries

**What:** Multiple error boundaries at different component tree levels for granular error isolation.

**When to use:** When different parts of the app have different criticality levels and failure domains.

**Example:**
```typescript
// App-level catch-all
function App() {
  return (
    <ErrorBoundary
      FallbackComponent={AppLevelFallback}
      onError={logErrorToService}
    >
      {/* Wave animation section with dedicated boundary */}
      <ErrorBoundary
        FallbackComponent={WaveAnimationFallback}
        onReset={resetWaveState}
      >
        <WavyBackground {...waveProps} />
      </ErrorBoundary>

      {/* Main content continues to work even if waves fail */}
      <MainContent />
    </ErrorBoundary>
  );
}
```

**Key insight:** Facebook Messenger uses this pattern: sidebar, info panel, conversation log, and message input each have separate boundaries so failures are isolated.

### Pattern 2: Error Boundary with Reset Keys

**What:** Automatic error boundary reset when related state changes.

**When to use:** When errors are state-dependent and changing props should trigger a retry.

**Example:**
```typescript
// Source: https://github.com/bvaughn/react-error-boundary
<ErrorBoundary
  FallbackComponent={ErrorFallback}
  resetKeys={[theme, qualityLevel]} // Reset when these change
  onReset={() => {
    // Optional: Reset component state
  }}
>
  <WavyBackground theme={theme} quality={qualityLevel} />
</ErrorBoundary>
```

### Pattern 3: localStorage with Feature Detection

**What:** Detect localStorage availability and gracefully fallback to in-memory storage.

**When to use:** When localStorage is used for non-critical features like theme persistence.

**Example:**
```typescript
// utils/storage.ts
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

// In-memory fallback
const memoryStorage = new Map<string, string>();

export const storage = {
  getItem: (key: string): string | null => {
    if (isLocalStorageAvailable()) {
      return localStorage.getItem(key);
    }
    return memoryStorage.get(key) ?? null;
  },
  setItem: (key: string, value: string): void => {
    if (isLocalStorageAvailable()) {
      localStorage.setItem(key, value);
    } else {
      memoryStorage.set(key, value);
    }
  },
};
```

### Pattern 4: Image Loading with Fallback

**What:** Handle broken images with state-based fallback.

**When to use:** When loading external images that may fail (logo, assets).

**Example:**
```typescript
function ImageWithFallback({ src, fallback, alt }: Props) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(fallback)}
    />
  );
}

// Usage for logo
<ImageWithFallback
  src="https://external-cdn.com/logo.svg"
  fallback="/logo-fallback.svg" // Local fallback
  alt="Puff Puff logo"
/>
```

### Pattern 5: Network Retry with Exponential Backoff

**What:** Retry failed network requests with increasing delays to prevent server overload.

**When to use:** For non-critical network requests (analytics, optional data fetching).

**Example:**
```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3
): Promise<Response> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);

      // Don't retry 4xx client errors
      if (response.status >= 400 && response.status < 500) {
        return response;
      }

      if (response.ok) {
        return response;
      }

      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error as Error;

      // Exponential backoff: 1s, 2s, 4s
      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
```

### Pattern 6: Accessibility Testing Integration

**What:** Add vitest-axe assertions to existing component tests.

**When to use:** For all major UI components, especially interactive ones.

**Example:**
```typescript
// src/setupTests.ts
import 'vitest-axe/extend-expect';

// src/components/Header/Header.test.tsx
import { axe } from 'vitest-axe';
import { render } from '@testing-library/react';
import { Header } from './Header';

describe('Header', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Header />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has accessible navigation', () => {
    const { getByRole } = render(<Header />);
    expect(getByRole('navigation')).toBeInTheDocument();
  });
});
```

### Anti-Patterns to Avoid

- **Single app-level error boundary only:** Loses granularity, one error breaks entire UI. Use layered boundaries instead.
- **Exposing error details in production:** Never show stack traces, error types, or internal paths to end users. Generic "Something went wrong" only.
- **Retrying all errors automatically:** Don't retry 4xx client errors (bad requests), only retry network failures and 5xx server errors.
- **Using console.error in production for monitoring:** Console logs are lost in user browsers. Use error boundaries' `onError` callback to send to monitoring service.
- **Testing with happy-dom:** vitest-axe requires jsdom due to happy-dom's Node.prototype.isConnected bug.
- **Not mocking console.error in error boundary tests:** Error boundaries log to console, causing test output noise. Always mock it.
- **Separate accessibility test suite:** Adds maintenance burden. Integrate `await axe(container)` into existing component tests.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Error boundary with retry | Custom class component with reset logic | react-error-boundary | Library has resetKeys, resetErrorBoundary, onReset callbacks, TypeScript types, 239k+ dependents, battle-tested |
| Accessibility testing | Manual ARIA attribute checks | vitest-axe + axe-core | Manual testing catches <10% of issues, axe-core finds ~57% automatically with zero false positives, tests 100+ WCAG rules |
| localStorage fallback | Custom storage wrapper | Built-in feature detection pattern | Many edge cases (SecurityError, QuotaExceededError, null localStorage), established pattern works |
| Exponential backoff | Custom delay calculations | Standard pattern with Math.pow(2, attempt) | Edge cases: jitter to prevent thundering herd, max retry limits, error classification |
| React Spring test mocking | Manual animation mocking | Globals.assign({ skipAnimations: true }) | Official react-spring testing approach, skips all animations uniformly |

**Key insight:** Error boundaries and accessibility testing have mature, well-tested libraries that handle edge cases you'll discover only after production issues. The investment in learning these libraries (< 1 hour) saves weeks of debugging and maintenance.

## Common Pitfalls

### Pitfall 1: Error Boundaries Don't Catch Everything

**What goes wrong:** Errors in event handlers, async code (useEffect, setTimeout), and server-side rendering aren't caught by error boundaries. Developer assumes error boundary is comprehensive protection.

**Why it happens:** Error boundaries only catch errors during rendering, in lifecycle methods, and in constructors of the component tree below them. React's error boundary API doesn't support async errors.

**How to avoid:**
- Wrap async code in try-catch blocks and then throw errors synchronously
- Use try-catch in event handlers or setState with error state
- Document which errors are caught vs. not caught

**Warning signs:**
- Unhandled promise rejections in console
- Errors in onClick handlers showing white screen
- Errors in useEffect not triggering fallback UI

**Example:**
```typescript
// BAD: Error boundary won't catch this
function Component() {
  useEffect(() => {
    fetchData(); // Unhandled promise rejection
  }, []);
}

// GOOD: Catch and re-throw synchronously
function Component() {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchData().catch(err => setError(err));
  }, []);

  if (error) throw error; // Now error boundary catches it
}

// BETTER: Use try-catch for side effects
async function handleClick() {
  try {
    await sendData();
  } catch (err) {
    logError(err);
    showToast('Failed to save');
  }
}
```

### Pitfall 2: vitest-axe Requires jsdom

**What goes wrong:** Tests fail with "Node.prototype.isConnected is not a function" when using happy-dom environment.

**Why it happens:** vitest-axe depends on axe-core which requires Node.prototype.isConnected, which happy-dom doesn't implement correctly (known bug).

**How to avoid:**
- Use jsdom as test environment (already configured in this project)
- Verify `vite.config.ts` has `test: { environment: 'jsdom' }`
- Don't switch to happy-dom without removing vitest-axe

**Warning signs:**
- Test failures mentioning "isConnected"
- axe-core throwing TypeError
- Tests pass without vitest-axe, fail with it

**Example:**
```typescript
// vite.config.ts - CORRECT
export default defineConfig({
  test: {
    environment: 'jsdom', // Required for vitest-axe
    setupFiles: './src/setupTests.ts',
  }
});

// WRONG - will break vitest-axe
export default defineConfig({
  test: {
    environment: 'happy-dom', // Incompatible with vitest-axe
  }
});
```

### Pitfall 3: Forgetting to Skip Animations in Tests

**What goes wrong:** Tests using react-spring animated components timeout waiting for animations to complete or have flaky timing issues.

**Why it happens:** React Spring animations run in tests by default, requiring async waiting with waitFor, making tests slow and unreliable.

**How to avoid:**
- Import Globals from '@react-spring/web' in setupTests.ts
- Call Globals.assign({ skipAnimations: true }) once globally
- Still use waitFor for state updates (needs one environment tick)

**Warning signs:**
- Tests timing out on animated components
- Flaky tests that sometimes pass/fail
- Tests taking multiple seconds per component

**Example:**
```typescript
// src/setupTests.ts
import { Globals } from '@react-spring/web';

// Skip animations in all tests
Globals.assign({ skipAnimations: true });

// Still need waitFor for state updates
import { render, waitFor } from '@testing-library/react';

test('animated component', async () => {
  const { getByText } = render(<AnimatedComponent />);

  // Even with skipAnimations, need to wait for state update
  await waitFor(() => {
    expect(getByText('Updated')).toBeInTheDocument();
  });
});
```

### Pitfall 4: Testing Suspense + Lazy Components

**What goes wrong:** Tests render fallback UI forever and never show lazy component content, especially in React 19.

**Why it happens:** React 18/19 changes in Suspense behavior, lazy components not resolving properly in test environment, missing act() warnings.

**How to avoid:**
- Always wrap lazy components in Suspense in tests (same as app code)
- Use findBy queries (async) instead of getBy (sync) to wait for lazy load
- Wrap Suspense in error boundary to catch lazy loading failures
- Mock lazy imports with vi.mock() for predictable behavior if needed

**Warning signs:**
- Tests only seeing "Loading..." fallback
- act() warnings about suspended resources
- Tests hanging or timing out on lazy components

**Example:**
```typescript
// Component using lazy loading
const LazySection = lazy(() => import('./Section'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazySection />
    </Suspense>
  );
}

// Test approach
test('lazy section loads', async () => {
  render(<App />);

  // Initial state: fallback visible
  expect(screen.getByText('Loading...')).toBeInTheDocument();

  // Wait for lazy component to load (use findBy, not getBy)
  const heading = await screen.findByRole('heading', { name: /section title/i });
  expect(heading).toBeInTheDocument();
});

// Alternative: Mock the lazy import for faster, more reliable tests
vi.mock('./Section', () => ({
  default: () => <div>Mocked Section</div>
}));
```

### Pitfall 5: Over-Aggressive Error Recovery

**What goes wrong:** Application repeatedly retries failed operations, hammering the server or creating infinite loops. Poor UX with constant retry attempts.

**Why it happens:** No circuit breaker pattern, retrying all errors including client errors (4xx), no exponential backoff, no max retry limit.

**How to avoid:**
- Don't retry 4xx client errors (400, 401, 403, 404)
- Use exponential backoff with max retry limit (typically 3)
- Implement circuit breaker after N consecutive failures
- Show user-visible error state, let them trigger retry manually

**Warning signs:**
- Network tab showing dozens of identical failed requests
- Server receiving request floods from error states
- User seeing loading spinners that never resolve
- High error rates in monitoring without user awareness

**Example:**
```typescript
// BAD: Retries everything including 404s
async function fetchData() {
  for (let i = 0; i < 10; i++) { // Too many retries
    try {
      return await fetch(url);
    } catch (err) {
      await new Promise(r => setTimeout(r, 1000)); // Fixed delay
    }
  }
}

// GOOD: Smart retry logic
async function fetchData(url: string, maxRetries = 3) {
  let consecutiveFailures = 0;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url);

      // Don't retry client errors
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.status}`);
      }

      if (response.ok) {
        consecutiveFailures = 0; // Reset on success
        return response;
      }

      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      consecutiveFailures++;

      // Circuit breaker: stop trying after 5 consecutive failures
      if (consecutiveFailures >= 5) {
        throw new Error('Circuit breaker opened - too many failures');
      }

      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}
```

## Code Examples

Verified patterns from official sources:

### Error Boundary Setup (react-error-boundary)
```typescript
// Source: https://github.com/bvaughn/react-error-boundary

import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

// Generic fallback component
function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert" className="error-fallback">
      <h2>Something went wrong</h2>
      {import.meta.env.DEV && (
        <pre style={{ color: 'red' }}>{error.message}</pre>
      )}
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

// Wave-specific fallback (matches design)
function WaveAnimationFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div
      className="wave-fallback"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, hsl(235, 40%, 85%) 0%, hsl(210, 40%, 75%) 100%)',
      }}
      aria-label="Background animation unavailable"
    />
  );
}

// Usage in App
function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // Development: log to console
        if (import.meta.env.DEV) {
          console.error('App error:', error, errorInfo);
        }
        // Production: send to monitoring service
        // logErrorToService(error, errorInfo);
      }}
    >
      <ErrorBoundary
        FallbackComponent={WaveAnimationFallback}
        resetKeys={[theme]} // Reset when theme changes
      >
        <WavyBackground {...waveProps} />
      </ErrorBoundary>

      <MainContent />
    </ErrorBoundary>
  );
}
```

### vitest-axe Setup and Usage
```typescript
// Source: https://github.com/chaance/vitest-axe

// src/setupTests.ts
import 'vitest-axe/extend-expect';

// Add to existing setup (already has @testing-library/jest-dom matchers)
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

// Mock ResizeObserver (already in setupTests.ts)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Component test with accessibility
// src/components/Header/Header.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Header } from './Header';

describe('Header', () => {
  it('renders without crashing', () => {
    render(<Header currentPage={0} onNavigate={() => {}} />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Header currentPage={0} onNavigate={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('navigation is accessible', () => {
    render(<Header currentPage={0} onNavigate={() => {}} />);
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();

    // Verify navigation links are accessible
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
  });
});
```

### React Spring Test Configuration
```typescript
// Source: https://react-spring.dev/docs/guides/testing

// src/setupTests.ts
import { Globals } from '@react-spring/web';

// Skip animations in tests
Globals.assign({ skipAnimations: true });

// Test animated component
import { render, waitFor } from '@testing-library/react';
import WavyBackground from './WavyBackground';

describe('WavyBackground', () => {
  it('renders without crashing', async () => {
    const { container } = render(
      <WavyBackground
        options={{ height: 300, amplitude: 50, speed: 0.015 }}
      />
    );

    // Even with skipAnimations, wait for initial render
    await waitFor(() => {
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });
});
```

### Testing Error Boundaries
```typescript
// Source: https://chrisboakes.com/testing-react-component-error-boundaries/

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from 'react-error-boundary';

// Component that throws on demand
function ThrowError({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  it('catches errors and shows fallback', () => {
    // Suppress console.error in test output
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error occurred')).toBeInTheDocument();
    expect(screen.queryByText('No error')).not.toBeInTheDocument();

    spy.mockRestore();
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByText('Error occurred')).not.toBeInTheDocument();
  });
});
```

### localStorage with Fallback
```typescript
// utils/storage.ts

type StorageKey = 'theme' | 'reducedMotion';

// Feature detection
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

// In-memory fallback for when localStorage unavailable
const memoryStorage = new Map<StorageKey, string>();

export const storage = {
  getItem: (key: StorageKey): string | null => {
    try {
      if (isLocalStorageAvailable()) {
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.warn('localStorage access failed:', error);
    }
    return memoryStorage.get(key) ?? null;
  },

  setItem: (key: StorageKey, value: string): void => {
    try {
      if (isLocalStorageAvailable()) {
        localStorage.setItem(key, value);
        return;
      }
    } catch (error) {
      console.warn('localStorage write failed:', error);
    }
    // Fallback to memory storage
    memoryStorage.set(key, value);
  },

  removeItem: (key: StorageKey): void => {
    try {
      if (isLocalStorageAvailable()) {
        localStorage.removeItem(key);
        return;
      }
    } catch (error) {
      console.warn('localStorage remove failed:', error);
    }
    memoryStorage.delete(key);
  },
};

// Usage in useTheme hook
import { storage } from '../utils/storage';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = storage.getItem('theme');
    return (stored as Theme) ?? 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    storage.setItem('theme', newTheme);
  };

  return { theme, toggleTheme };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom class-based error boundaries | react-error-boundary library | 2020-2021 | Simplified error handling, added retry/reset features, better TypeScript support |
| jest-axe | vitest-axe | 2023 | Vitest compatibility without Jest/Vitest type conflicts |
| Manual ARIA testing | Automated axe-core rules | 2018+ (axe-core maturity) | Catches 57% of issues automatically vs <10% manual |
| Single app-level error boundary | Layered/scoped boundaries | 2018+ (React docs update) | Better UX - errors don't break entire app |
| react-error-boundary v3 | react-error-boundary v4 | 2023 | Better TypeScript types, improved reset behavior |
| Console logging for errors | Structured error logging + monitoring | 2020+ | Production visibility, error aggregation, user impact tracking |
| jest (CRA default) | vitest | 2022+ | Faster tests, native ESM, better Vite integration |

**Deprecated/outdated:**
- **componentDidCatch without getDerivedStateFromError**: Deprecated pattern - use both lifecycle methods or use react-error-boundary
- **Error boundaries in functional components with hooks**: Not possible - error boundaries require class components or use react-error-boundary
- **jest-axe with Vitest**: Use vitest-axe to avoid Jest/Vitest type conflicts
- **happy-dom with vitest-axe**: Incompatible - use jsdom

## Open Questions

Things that couldn't be fully resolved:

1. **React 19 Suspense Test Behavior**
   - What we know: React 19 changed Suspense behavior in tests, with over 300 tests in react-testing-library failing due to components stuck in fallback state
   - What's unclear: Whether this affects lazy loading tests in this project, best workarounds
   - Recommendation: Test lazy-loaded sections early in Phase 6 implementation. If issues occur, consider mocking lazy imports with vi.mock() or updating to latest @testing-library/react which may have fixes

2. **Wave Animation Error Frequency**
   - What we know: Wave animations use Perlin noise, canvas/SVG rendering, continuous animation loops - all potential failure points
   - What's unclear: How often wave animations actually fail in production, whether error boundary overhead is worth it
   - Recommendation: Implement wave error boundary proactively (low overhead), monitor error rates post-deployment to validate necessity

3. **Production Error Monitoring Service**
   - What we know: Should use error boundary's onError callback to send errors to monitoring service
   - What's unclear: Which service to use (Sentry, LogRocket, custom), whether user wants monitoring at all
   - Recommendation: Implement error logging infrastructure with pluggable backend. Development: console.error only. Production: stub for future monitoring service integration

4. **Accessibility Test Coverage Priority**
   - What we know: Should test major components, but project has 8+ components and sections
   - What's unclear: Which components are highest priority, whether to test all at once or incrementally
   - Recommendation: Start with interactive components (Header, ThemeToggle, MobileMenu) and main App. Add to section tests as they're created. Target: all components with user interaction + main page layouts

## Sources

### Primary (HIGH confidence)
- [GitHub: react-error-boundary](https://github.com/bvaughn/react-error-boundary) - Official library documentation and examples
- [GitHub: vitest-axe](https://github.com/chaance/vitest-axe) - Official library documentation, setup guide, TypeScript configuration
- [React Official Docs: Error Boundaries](https://legacy.reactjs.org/docs/error-boundaries.html) - Authoritative React documentation on error boundary behavior and limitations
- [React Spring Testing Guide](https://react-spring.dev/docs/guides/testing) - Official documentation for testing animated components
- [Axe Core GitHub](https://github.com/dequelabs/axe-core) - Official accessibility testing engine documentation
- [Testing Library: ByRole](https://testing-library.com/docs/queries/byrole/) - Official documentation for accessible queries

### Secondary (MEDIUM confidence)
- [Error Boundaries – Refine](https://refine.dev/blog/react-error-boundaries/) - Comprehensive best practices guide (2025-2026)
- [Kent C. Dodds: Use react-error-boundary](https://kentcdodds.com/blog/use-react-error-boundary-to-handle-errors-in-react) - Industry expert guidance
- [Sentry: Error & Exception Handling in React](https://blog.sentry.io/guide-to-error-and-exception-handling-in-react/) - Production error handling best practices
- [LogRocket: React Logging Best Practices](https://www.loggly.com/blog/best-practices-for-client-side-logging-and-error-handling-in-react/) - Client-side logging patterns
- [React Query Retry Strategies](https://www.dhiwise.com/blog/design-converter/react-query-retry-strategies-for-better-error-handling) - Exponential backoff and retry patterns (2026)
- [React 19 Resilience Guide](https://medium.com/@connect.hashblock/react-19-resilience-retry-suspense-error-boundaries-40ea504b09ed) - React 19 error handling updates
- [Testing Error Boundaries - Chris Boakes](https://chrisboakes.com/testing-react-component-error-boundaries/) - Practical testing guide
- [Playwright: Accessibility Testing](https://playwright.dev/docs/accessibility-testing) - axe-core integration patterns
- [React Image Fallback Patterns](https://medium.com/@webcore1/react-fallback-for-broken-images-strategy-a8dfa9c1be1e) - Image error handling strategies
- [React Testing Library Suspense Issues](https://github.com/testing-library/react-testing-library/issues/1375) - React 19 testing challenges

### Tertiary (LOW confidence)
- Various Medium articles on error boundaries - Community patterns, not authoritative
- DEV.to posts on accessibility testing - Helpful examples but not official sources
- Stack Overflow discussions on localStorage fallback - Community solutions, not standards

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - react-error-boundary and vitest-axe are established, mature libraries with official documentation and large user bases
- Architecture: HIGH - Patterns verified through official React docs, library documentation, and industry expert sources (Kent C. Dodds, Chris Boakes)
- Pitfalls: MEDIUM-HIGH - Based on GitHub issues, official documentation warnings, and community experiences. Some pitfalls documented in official sources (error boundary limitations, vitest-axe jsdom requirement)
- React 19 Suspense testing: LOW - Emerging issue with limited documentation on solutions

**Research date:** 2026-02-03
**Valid until:** 2026-04-03 (60 days - stable domain with mature libraries, but React 19 changes warrant earlier review if issues arise)
