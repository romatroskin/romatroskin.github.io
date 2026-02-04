---
phase: 12-final-cleanup
plan: 01
subsystem: code-quality
tags: [eslint, typescript, code-quality, linting, refactoring]

# Dependency graph
requires:
  - phase: 11-documentation
    provides: README with coverage badge and test documentation
provides:
  - Zero ESLint errors and warnings across codebase
  - Clean react-refresh configuration for HMR
  - TypeScript-first unused variable patterns with underscore prefix
  - Verified no dead code or unused files
affects: [12-02, 12-03, 12-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - ESLint console.warn/error allowed for monitoring code
    - Underscore prefix pattern for intentionally unused variables
    - Separate files for non-component exports to satisfy react-refresh
    - ts-prune for detecting unused exports

key-files:
  created:
    - src/components/ui/Header/Header.types.ts
    - src/utils/errorLogging.ts
  modified:
    - eslint.config.js
    - src/performance/vitals.ts
    - src/hooks/useAnimationFrame.test.ts
    - src/hooks/usePerlinNoise.test.ts
    - src/hooks/useScrollSpy.test.ts
    - src/components/ui/Header/Header.tsx
    - src/components/ui/Header/MobileMenu.tsx
    - src/components/common/ErrorBoundary/ErrorBoundary.tsx
    - src/components/common/ErrorBoundary/index.ts

key-decisions:
  - "Allow console.warn/error in ESLint for legitimate monitoring/logging"
  - "Use underscore prefix pattern for intentionally unused variables"
  - "Extract non-component exports to separate files for react-refresh compliance"
  - "Change console.log to console.warn in vitals.ts for consistency"

patterns-established:
  - "ESLint configuration: argsIgnorePattern/varsIgnorePattern for unused vars"
  - "React-refresh pattern: Separate .types.ts files for constants/interfaces"
  - "Error logging utility in utils/ for cross-boundary reuse"

# Metrics
duration: 4min
completed: 2026-02-04
---

# Phase 12 Plan 01: Fix ESLint Errors Summary

**Clean lint output achieved: 0 errors, 0 warnings. All 116 tests passing with proper TypeScript types and react-refresh compliance.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-04T13:23:40Z
- **Completed:** 2026-02-04T13:27:44Z
- **Tasks:** 4
- **Files modified:** 11

## Accomplishments
- Fixed all 17 ESLint errors and 2 warnings across codebase
- Configured ESLint to allow console.warn/error for monitoring code
- Implemented underscore prefix pattern for intentionally unused variables
- Extracted non-component exports to satisfy react-refresh HMR requirements
- Replaced all `any` types with proper TypeScript type definitions
- Verified no dead code, unused files, or orphaned imports exist

## Task Commits

Each task was committed atomically:

1. **Task 1: Update ESLint Configuration** - `a9eb24a` (chore)
2. **Task 2: Fix Remaining Code Lint Errors** - `45c7fc5` (fix)
3. **Task 3: Fix React-Refresh Warnings** - `c35a2b4` (refactor)
4. **Task 4: Scan and Remove Dead Code** - `fc6f4a4` (chore)

## Files Created/Modified

**Created:**
- `src/components/ui/Header/Header.types.ts` - Shared NavItem interface and navItems constant for Header components
- `src/utils/errorLogging.ts` - Extracted logErrorInDev utility for error logging across app

**Modified:**
- `eslint.config.js` - Added console.warn/error allowlist and underscore ignore patterns
- `src/performance/vitals.ts` - Changed console.log to console.warn, wrapped unused expression with void
- `src/hooks/useAnimationFrame.test.ts` - Removed unused act import, prefixed unused id param with _
- `src/hooks/usePerlinNoise.test.ts` - Removed redundant unused value1/value2 variables
- `src/hooks/useScrollSpy.test.ts` - Replaced `any` types with MockIntersectionObserver types
- `src/components/ui/Header/Header.tsx` - Import navItems from Header.types.ts
- `src/components/ui/Header/MobileMenu.tsx` - Import NavItem type from Header.types.ts
- `src/components/common/ErrorBoundary/ErrorBoundary.tsx` - Removed logErrorInDev re-export
- `src/components/common/ErrorBoundary/index.ts` - Re-export logErrorInDev from utils

## Decisions Made

1. **Console methods for monitoring:** Configured ESLint to allow console.warn and console.error for legitimate monitoring/logging use cases (vitals, loafMonitor, ErrorBoundary). Console.log remains prohibited.

2. **Underscore prefix pattern:** Implemented ESLint argsIgnorePattern/varsIgnorePattern to ignore variables prefixed with _ for intentionally unused parameters (e.g., cancelAnimationFrame's id parameter).

3. **React-refresh file extraction:** Created separate Header.types.ts and errorLogging.ts files to separate non-component exports from component files, satisfying react-refresh's "only export components" rule for optimal HMR.

4. **TypeScript type safety:** Replaced all `any` types with proper interface definitions (MockIntersectionObserverInstance, MockIntersectionObserverConstructor) for full type safety in tests.

## Deviations from Plan

None - plan executed exactly as written. All 19 lint problems (17 errors, 2 warnings) were resolved through configuration updates and code fixes as specified.

## Issues Encountered

None - all lint fixes applied cleanly, tests continued passing, and build succeeded.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for next plan:**
- Codebase is fully lint-clean with zero errors/warnings
- All 116 tests passing with proper TypeScript types
- Build succeeds without errors
- Dead code verification complete (no unused files or exports)

**Quality baseline established:**
- ESLint enforces code quality standards
- Console logging patterns standardized
- React-refresh optimized for fast HMR
- TypeScript strict mode fully compliant

**For Plan 12-02 (Extract Hero Section):**
- Lint baseline ensures all extracted code will pass quality checks
- React-refresh patterns established for new component files
- Type safety patterns documented for reuse

---
*Phase: 12-final-cleanup*
*Completed: 2026-02-04*
