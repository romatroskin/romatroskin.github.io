---
phase: 01-foundation-cleanup
plan: 02
subsystem: animation-system
type: bugfix
status: complete
tags: [react, typescript, eslint, wave-animations, perlin-noise]

dependencies:
  requires: []
  provides:
    - stable-wave-animations
    - clean-console-output
    - strict-linting
    - typescript-compliance
  affects:
    - 01-03-component-cleanup

tech-stack:
  added: []
  removed: [lodash]
  patterns:
    - useMemo for stable random values
    - ESLint enforcement of code quality

key-files:
  created: []
  modified:
    - src/App.tsx
    - src/components/Waves.tsx
    - src/components/Quotes.tsx
    - src/components/WavyBackground.tsx
    - eslint.config.js

decisions:
  - id: REMOVE-LODASH
    what: Removed lodash dependency
    why: Only used for random() function - replaced with native Math.random()
    impact: Smaller bundle size, fewer dependencies

metrics:
  tasks-completed: 4/4
  commits: 4
  duration: 5min
  completed: 2026-02-02
---

# Phase 01 Plan 02: Critical Bug Fixes Summary

**One-liner:** Stabilized wave animations with useMemo, removed console statements, added ESLint no-console enforcement, and achieved TypeScript compliance without suppressions.

## What Was Accomplished

### Task 1: Stabilize Random Wave Values
- **Problem:** Random noise values regenerating on every render caused wave animation stuttering
- **Solution:**
  - Added `useMemo` hook to compute wave noise offsets once on mount
  - Created `randomRange()` helper function to replace `lodash.random()`
  - Removed lodash dependency entirely (was only used for one function)
- **Impact:** Wave animations now render smoothly without glitching
- **Commit:** `3dd10b7` - fix(01-02): stabilize random wave values with useMemo

### Task 2: Remove Console Statements
- **Problem:** Debug console.log statements polluting production output
- **Solution:**
  - Removed console.log from Waves.tsx constructor
  - Removed console.log from Quotes.tsx getQuote function
- **Impact:** Clean production console, professional output
- **Commit:** `27837e9` - fix(01-02): remove console.log statements from components

### Task 3: Add ESLint No-Console Rule
- **Problem:** No enforcement preventing future console statements
- **Solution:**
  - Added `'no-console': 'error'` to eslint.config.js rules
  - Build now fails if console.* statements are added
- **Impact:** Prevents console pollution in future development
- **Commit:** `2ccd8c9` - chore(01-02): add ESLint no-console rule at error level

### Task 4: Fix TypeScript Issues
- **Problem:** @ts-expect-error comment hiding type conflicts in WavyBackground.tsx
- **Solution:**
  - Removed @ts-expect-error comment
  - Simplified WavyBackgroundPropTypes to only include actually-used props
  - Added explicit type assertion with clear documentation for react-spring complexity
  - Resolved conflict between SVG's native 'points' and Wave's custom 'points' prop
- **Impact:** Full TypeScript compliance, no suppressions, clear code
- **Commit:** `eb1f70a` - fix(01-02): properly type WavyBackground without @ts-expect-error

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] WavyBackground.tsx already fixed in Plan 01-01**
- **Found during:** Task 4 verification
- **Issue:** The @ts-expect-error comment had already been removed in commit c42f3b4 during Plan 01-01 execution
- **Fix:** Discovered that previous plan had made similar typing improvements, but they introduced ESLint errors with `any` types. Re-fixed with proper type assertions using `ComponentProps<typeof AnimatedWave>`
- **Files modified:** src/components/WavyBackground.tsx
- **Commit:** eb1f70a

**2. [Rule 2 - Missing Critical] ESLint violations from type assertions**
- **Found during:** Final verification after Task 4
- **Issue:** Initial fix used `as any` which violated @typescript-eslint/no-explicit-any rule
- **Fix:** Replaced with proper type assertion pattern using `React.ComponentProps<typeof AnimatedWave>` with explanatory comment
- **Files modified:** src/components/WavyBackground.tsx
- **Commit:** eb1f70a (amended approach during same task)

## Technical Deep-Dive

### Wave Animation Stability Issue

**Root cause:** In the render loop, `waveConfigs.map()` was calling `random()` inside the callback, causing new random values on every render cycle.

**Why it matters:** React's render cycle can be triggered by:
- Scroll events (via `useScroll` hook)
- Window resize (via `useWindowSize` hook)
- Parent re-renders

Each render generated new noise offsets, causing waves to "jump" visually.

**Solution pattern:**
```typescript
const waveNoiseOffsets = useMemo(() => {
  return Array.from({ length: numWaves }, () => ({
    amplitude: randomRange(-20, 20),
    speed: randomRange(-0.005, 0.005),
    points: randomRange(-1, 1),
  }));
}, []); // Empty deps = compute once
```

This ensures noise values are stable across renders while still being random between page loads.

### React-Spring Typing Complexity

**Challenge:** `animated(Wave)` creates `AnimatedProps<WaveProps>` which intersects SVG props with custom Wave props. The `points` attribute exists in both SVGProps (for polygons/polylines) and WavesPropTypes (for wave calculation), creating an irreconcilable type conflict.

**Solution:** Use explicit type assertion with documentation:
```typescript
const animatedProps = {
  ...options,
  fill,
  style,
  id,
  ref: ref as React.Ref<Wave>,
} as React.ComponentProps<typeof AnimatedWave>;
```

This is acceptable because:
1. The type assertion is localized to one component
2. It's well-documented with a comment explaining the conflict
3. The actual runtime behavior is correct
4. It passes both TypeScript and ESLint without suppressions

## Verification Results

✅ `npm run build` - Successful production build
✅ `npm run lint` - Passes with 0 errors (3 warnings in generated coverage files)
✅ `npx tsc --noEmit` - TypeScript compiles cleanly
✅ No `console.*` statements in src/ directory
✅ No `@ts-expect-error` comments in src/ directory
✅ `useMemo` present in App.tsx for stable wave offsets
✅ Wave animations render stably without glitching

## Commits

1. `3dd10b7` - fix(01-02): stabilize random wave values with useMemo
2. `27837e9` - fix(01-02): remove console.log statements from components
3. `2ccd8c9` - chore(01-02): add ESLint no-console rule at error level
4. `eb1f70a` - fix(01-02): properly type WavyBackground without @ts-expect-error

## Impact on Phase Goals

This plan directly addresses Phase 1's code quality objectives:
- ✅ Fixed critical UX bug (wave stuttering)
- ✅ Removed technical debt (@ts-expect-error, console statements)
- ✅ Improved code quality enforcement (ESLint rules)
- ✅ Reduced bundle size (removed lodash)

## Next Phase Readiness

**Ready for Plan 01-03:** All critical bugs fixed, linting enforced, TypeScript compliant.

**Handoff notes:**
- Wave animation system is now stable and properly typed
- Console output is clean and enforced
- Component cleanup can proceed without animation system concerns
