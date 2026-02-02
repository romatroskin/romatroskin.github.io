# Technology Stack Research

**Project:** Puff Puff Dev Portfolio Site
**Current Stack:** React 18.3.1 + TypeScript 5.5.4 + Vite 5.4.2 + react-spring 9.7.4
**Research Focus:** Testing, animations, accessibility, performance monitoring, bundle optimization
**Researched:** 2026-02-03
**Overall Confidence:** MEDIUM (Limited to training knowledge as of January 2025 - external verification tools unavailable)

## Research Constraints

**IMPORTANT:** This research was conducted without access to Context7, WebSearch, or WebFetch tools. All recommendations are based on training knowledge current as of January 2025 and analysis of the existing project dependencies. Version numbers and current best practices should be verified against official documentation before implementation.

## Current Project Analysis

From `package.json`:
- React 18.3.1 (React 19.2.4 available but major version upgrade)
- react-spring 9.7.4 (v10.0.3 available - major version)
- Vite 5.4.2 (v7.3.1 available - major version)
- TypeScript 5.5.4 (v5.9.3 available - minor)
- No testing framework installed
- No accessibility testing tools
- No performance monitoring tools
- lodash 4.17.21 (only used for random - likely removable)
- PureCSS 3.0.0 (underused - candidate for removal)

## Recommended Stack Additions

### Testing Framework
| Technology | Recommended Version | Purpose | Why | Confidence |
|------------|-------------------|---------|-----|------------|
| **Vitest** | ^2.x (verify latest) | Unit/integration testing | Native Vite integration, fast, Jest-compatible API, better TypeScript support, faster than Jest for Vite projects | HIGH |
| **@vitest/ui** | ^2.x (match Vitest) | Test UI dashboard | Built-in visual test runner, better DX than terminal-only | HIGH |
| **@testing-library/react** | ^16.x | React component testing | Industry standard, encourages accessibility-focused tests, works seamlessly with Vitest | HIGH |
| **@testing-library/jest-dom** | ^6.x | DOM assertion matchers | Readable assertions (toBeVisible, toHaveAttribute), essential companion to RTL | HIGH |
| **@testing-library/user-event** | ^14.x | User interaction simulation | More realistic than fireEvent, simulates actual user behavior | HIGH |
| **jsdom** | ^25.x | DOM environment for tests | Required by Vitest for component tests, lightweight browser environment | HIGH |

**Rationale for Vitest over Jest:**
- **Native Vite integration**: No configuration needed, reuses Vite config
- **Performance**: ~10x faster cold starts due to ESM and no transform step
- **Shared config**: Same transforms, path resolution as dev environment
- **Modern by default**: ESM, top-level await, worker threads
- **Jest compatibility**: Drop-in replacement for most Jest APIs

**Alternative Considered: Jest**
- More mature ecosystem
- More tutorials and Stack Overflow answers
- BUT: Requires additional configuration for ESM and Vite, slower, requires babel transform

**Why NOT Jest for this project:**
- Already using Vite - Vitest is the natural choice
- Portfolio site doesn't need Jest's advanced features (snapshot testing less critical)
- Setup friction is significant for Vite + TypeScript + ESM

### Animation Optimization
| Technology | Current Version | Recommended | Purpose | Why | Confidence |
|------------|----------------|-------------|---------|-----|------------|
| **react-spring** | 9.7.4 | Stay on v9.x for now | Physics-based animations | Already in use, v10 is major rewrite, v9 is stable and performant | MEDIUM |
| **@react-spring/web** | 9.7.4 | Upgrade to 9.7.5 | Core spring animations | Bug fixes in 9.7.5, staying in v9.x for stability | MEDIUM |
| **@react-spring/parallax** | 9.7.4 | Upgrade to 9.7.5 | Parallax scrolling | Bug fixes in 9.7.5 | MEDIUM |

**react-spring v10 Status (as of training data):**
- v10.0.x exists but represents major API changes
- May have breaking changes in parallax implementation
- Recommendation: Defer v10 upgrade until after test coverage exists
- **Action**: Research v10 migration guide before major version bump

**Performance Best Practices for react-spring:**
1. **Use `useSpring` with `immediate` for instant values** - avoid animating when not needed
2. **Leverage `config` presets** - `config.gentle`, `config.slow` instead of custom configs
3. **Memoize animation configs** - prevent unnecessary re-renders
4. **Use `useSpringValue` for imperative animations** - better performance for programmatic control
5. **Avoid animating layout properties** - transform and opacity are GPU-accelerated, width/height are not

**Alternative Considered: Framer Motion**
- Pros: More popular (especially for simple animations), better TypeScript inference, simpler API
- Cons: Different animation model (tweens vs springs), migration cost, less powerful for physics-based animations
- **Verdict**: Stay with react-spring - already integrated, portfolio showcases parallax which is react-spring's strength

### Accessibility Testing
| Technology | Recommended Version | Purpose | Why | Confidence |
|------------|-------------------|---------|-----|------------|
| **axe-core** | ^4.x | Core a11y testing engine | Industry standard, used by Deque (a11y leaders) | HIGH |
| **vitest-axe** | ^1.x | Vitest integration for axe | Native Vitest matchers, better DX than jest-axe for Vitest projects | MEDIUM |
| **@axe-core/react** | ^4.x | Runtime a11y violation detection | Development-only warnings, catches issues during development | HIGH |
| **eslint-plugin-jsx-a11y** | ^6.x | Static analysis for a11y | Catch issues at write-time, not test-time | HIGH |

**Rationale:**
- **vitest-axe over jest-axe**: Built for Vitest, same API as jest-axe but better integration
- **@axe-core/react in development**: Real-time feedback loop, catches issues immediately
- **eslint-plugin-jsx-a11y**: First line of defense, prevents commits with obvious a11y issues

**Testing Strategy:**
```typescript
// Example: Every component test should include a11y check
import { axe, toHaveNoViolations } from 'vitest-axe'

test('Component has no a11y violations', async () => {
  const { container } = render(<Component />)
  expect(await axe(container)).toHaveNoViolations()
})
```

**Alternative Considered: Lighthouse CI**
- Pros: Full page analysis, performance + a11y in one tool
- Cons: Slower (full page load), harder to run in unit tests, more CI overhead
- **Verdict**: Use both - vitest-axe for unit tests, Lighthouse CI for integration/deployment checks (future phase)

### Performance Monitoring & Optimization
| Technology | Recommended Version | Purpose | Why | Confidence |
|------------|-------------------|---------|-----|------------|
| **vite-plugin-inspect** | ^0.8.x | Vite plugin analysis | Visualize Vite plugin pipeline, debug build issues | MEDIUM |
| **rollup-plugin-visualizer** | ^5.x | Bundle visualization | Treemap view of bundle size, identify bloat | HIGH |
| **@vitejs/plugin-legacy** | ^6.x | Legacy browser support | Only if needed - adds polyfills and increases bundle size | LOW (avoid unless required) |
| **vite-plugin-compression** | ^0.5.x | Pre-compress assets | Generate gzip/brotli for static hosting | MEDIUM |
| **web-vitals** | ^4.x | Runtime performance metrics | Track CLS, LCP, FID in production | HIGH |

**Built-in Vite Optimizations (Already Available):**
- **Code splitting**: Automatic via dynamic imports
- **Tree shaking**: Built-in via Rollup
- **CSS code splitting**: Automatic per component
- **Minification**: Enabled in production builds (esbuild)
- **Image optimization**: Via `vite-imagetools` (not installed - optional)

**Recommended: rollup-plugin-visualizer for Bundle Analysis**
```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
})
```

**Performance Monitoring Strategy:**
1. **Development**: vite-plugin-inspect for build analysis
2. **Build-time**: rollup-plugin-visualizer for bundle analysis
3. **Runtime**: web-vitals for Core Web Vitals tracking
4. **CI/CD**: Lighthouse CI (future phase)

### Dependencies to Remove
| Package | Current Version | Why Remove | When | Confidence |
|---------|----------------|------------|------|------------|
| **lodash** | 4.17.21 | Only used for `_.random`, native `Math.random()` sufficient | Immediately | HIGH |
| **purecss** | 3.0.0 | Underused per project context, dead weight | After audit of usage | MEDIUM |
| **react-spring (root)** | 9.7.4 | Redundant with @react-spring/web and @react-spring/parallax | Immediately | HIGH |

**lodash Removal:**
```typescript
// Instead of: import { random } from 'lodash'
// Use: Math.random() * (max - min) + min
// Or: crypto.getRandomValues() for better randomness
```

**PureCSS Analysis Needed:**
- Grep codebase for PureCSS class usage
- If < 5 classes used, replace with custom CSS
- If grid system is used, consider CSS Grid/Flexbox migration

## Version Upgrade Strategy

### Immediate (Low Risk)
- TypeScript 5.5.4 → 5.9.3 (minor bump, bug fixes)
- react-spring packages 9.7.4 → 9.7.5 (patch bump)
- eslint/typescript-eslint to latest minor versions

### Short-term (Medium Risk - Test Coverage First)
- Vite 5.4.2 → 5.4.21 (stay in v5.x, avoid v7.x major bump)
- @vitejs/plugin-react 4.3.1 → 4.7.0 (stay in v4.x, avoid v5.x major bump)

### Deferred (High Risk - Requires Research)
- Vite 5.x → 7.x (major version, breaking changes likely)
- React 18 → 19 (major version, new features but migration required)
- react-spring 9.x → 10.x (major API rewrite)
- @vitejs/plugin-react 4.x → 5.x (likely tied to Vite 7.x)

**Rationale for Conservative Approach:**
- Establish test coverage before major version bumps
- Major versions often have subtle breaking changes
- Portfolio site - stability > cutting edge

## Installation Commands

### Phase 1: Testing Infrastructure
```bash
# Testing framework
npm install -D vitest@^2.1 @vitest/ui@^2.1 jsdom@^25

# React testing utilities
npm install -D @testing-library/react@^16 @testing-library/jest-dom@^6 @testing-library/user-event@^14

# Accessibility testing
npm install -D vitest-axe@^1 axe-core@^4
npm install -D eslint-plugin-jsx-a11y@^6

# Runtime a11y monitoring (development only)
npm install @axe-core/react@^4
```

### Phase 2: Performance & Optimization
```bash
# Bundle analysis
npm install -D rollup-plugin-visualizer@^5

# Performance monitoring
npm install web-vitals@^4

# Optional: Compression for static hosting
npm install -D vite-plugin-compression@^0.5
```

### Phase 3: Cleanup
```bash
# Remove lodash
npm uninstall lodash @types/lodash

# Audit PureCSS usage, then potentially:
# npm uninstall purecss

# Remove redundant react-spring root package
npm uninstall react-spring
```

## Configuration Requirements

### vitest.config.ts (New File)
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true, // Parse CSS imports
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}'
      ]
    }
  }
})
```

### src/test/setup.ts (New File)
```typescript
import '@testing-library/jest-dom'
import { expect } from 'vitest'
import * as matchers from 'vitest-axe'

// Extend Vitest's expect with axe matchers
expect.extend(matchers)
```

### .eslintrc updates (Add jsx-a11y)
```json
{
  "extends": [
    "plugin:jsx-a11y/recommended"
  ],
  "plugins": ["jsx-a11y"]
}
```

### vite.config.ts updates (Bundle Analysis)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: './dist/stats.html'
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'spring-vendor': ['@react-spring/web', '@react-spring/parallax']
        }
      }
    }
  }
})
```

## Alternatives Considered

### Testing: Vitest vs Jest vs Playwright
| Tool | Type | Verdict | Why |
|------|------|---------|-----|
| **Vitest** | Unit/Integration | ✅ RECOMMENDED | Native Vite integration, fast, Jest-compatible |
| **Jest** | Unit/Integration | ❌ NOT for this project | Slower, requires transform config, friction with Vite |
| **Playwright** | E2E | ⏸️ DEFER | Overkill for portfolio site, add later if needed |

### Animation: react-spring vs Framer Motion vs CSS
| Tool | Verdict | Why |
|------|---------|-----|
| **react-spring** | ✅ KEEP | Already integrated, excellent for parallax, physics-based |
| **Framer Motion** | ❌ NO | Migration cost, different model, no clear benefit for this project |
| **CSS Animations** | ✅ USE MORE | Complement react-spring for simple animations, better performance |

### Bundle Analysis: rollup-plugin-visualizer vs webpack-bundle-analyzer
| Tool | Verdict | Why |
|------|---------|-----|
| **rollup-plugin-visualizer** | ✅ RECOMMENDED | Native Rollup support (Vite uses Rollup) |
| **webpack-bundle-analyzer** | ❌ NO | Webpack-specific, not compatible with Vite/Rollup |
| **vite-bundle-visualizer** | 🤔 ALTERNATIVE | Vite-specific wrapper, may be more polished but less mature |

## React 19 Consideration

React 19 is available (19.2.4) but represents a major version upgrade:

**Known Changes (from training data):**
- New React Compiler (opt-in optimization)
- Actions and `useActionState` for forms
- `use()` hook for reading promises/context
- Ref as prop (no more forwardRef)
- Context as provider (no more `.Provider`)

**Recommendation: Stay on React 18**
- Portfolio site doesn't need React 19 features yet
- Wait for react-spring v10+ which may have better React 19 support
- Establish test coverage first to catch breaking changes

**Future Research Needed:**
- react-spring compatibility with React 19
- React 19 migration guide specifics
- Performance improvements in React 19 (if any for this use case)

## Missing from Research

Due to unavailable verification tools, the following should be validated before implementation:

1. **Exact current versions** - All version numbers should be verified against npm/official docs
2. **vitest-axe vs jest-axe** - Confirm vitest-axe is maintained and stable
3. **react-spring v10 status** - Check if v10 is production-ready and migration path
4. **Vite 7.x changes** - Understand breaking changes from v5 to v7
5. **React 19 + react-spring compatibility** - Verify no known issues
6. **@axe-core/react performance impact** - Ensure it's truly dev-only and tree-shaken in production

## Confidence Assessment

| Category | Confidence | Reason |
|----------|-----------|--------|
| Testing Framework (Vitest) | **HIGH** | Well-established pattern for Vite projects, stable as of training data |
| Testing Libraries (RTL) | **HIGH** | Industry standard, unlikely to have changed |
| Animation Optimization | **MEDIUM** | react-spring v10 status unclear, best practices may have evolved |
| Accessibility Testing | **MEDIUM** | vitest-axe existence confirmed in training but currency uncertain |
| Bundle Analysis | **HIGH** | rollup-plugin-visualizer is standard for Rollup/Vite |
| Version Numbers | **LOW** | All version numbers are hypothetical or from npm outdated, need verification |
| React 19 Compatibility | **LOW** | Training data from January 2025, React 19 was recent, ecosystem may have shifted |

## Sources

**Source Limitations:**
- Context7: Unavailable during research
- WebSearch: Unavailable during research
- WebFetch: Unavailable during research

**Sources Used:**
- Training knowledge (January 2025 cutoff)
- Project's `package.json` analysis via file read
- `npm outdated` output from project directory

**Recommended Verification:**
- [Vitest Official Docs](https://vitest.dev) - Verify current version and setup
- [React Testing Library](https://testing-library.com/react) - Current best practices
- [react-spring Documentation](https://react-spring.dev) - v10 status and migration
- [axe-core npm](https://npmjs.com/package/axe-core) - Current ecosystem packages
- [Vite Bundle Optimization](https://vitejs.dev/guide/build) - Current recommendations

## Next Steps for Roadmap

Based on this stack research, recommended phase structure:

1. **Testing Infrastructure Setup** (Foundation)
   - Install Vitest + RTL + vitest-axe
   - Create test configuration files
   - Write first test to validate setup
   - LOW risk, HIGH value

2. **Component Test Coverage** (Core)
   - Test existing components with a11y checks
   - Identify animation testing strategy
   - Achieve >80% coverage
   - MEDIUM risk, HIGH value

3. **Performance Baseline & Optimization** (Enhancement)
   - Add bundle analysis
   - Identify and remove unused dependencies (lodash, possibly PureCSS)
   - Optimize react-spring usage
   - Add web-vitals monitoring
   - LOW risk, MEDIUM value

4. **Dependency Updates** (Maintenance)
   - Minor version bumps (TypeScript, react-spring patches)
   - Stay on stable major versions
   - MEDIUM risk, LOW value (but necessary for security)

5. **Major Version Research** (Future)
   - Research React 19 migration when test coverage exists
   - Research Vite 7.x migration
   - Research react-spring v10 migration
   - HIGH risk, MEDIUM value (defer until other phases complete)

**Critical Path:**
Testing Infrastructure → Test Coverage → Performance Optimization → (Optional) Major Versions

**Rationale:**
- Can't safely upgrade major versions without tests
- Can't optimize confidently without performance monitoring
- Can't ensure accessibility without automated testing
- Portfolio site = stability and performance matter more than cutting edge
