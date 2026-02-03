---
phase: 05-performance-animation
plan: 02
subsystem: performance
tags: [core-web-vitals, lighthouse, lcp, cls, preload, srcset]

# Dependency graph
requires:
  - phase: 05-01
    provides: web-vitals monitoring and performance baseline
provides:
  - Preload and preconnect hints for critical resources
  - Explicit dimensions preventing CLS
  - Responsive image support via srcSet
  - Layout stability with reserved space
affects: [05-03-code-splitting, 05-04-animation-optimization]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Preload hints for LCP elements
    - Explicit width/height on images
    - Min-height for layout stability
    - srcSet for responsive images

key-files:
  created: []
  modified:
    - index.html
    - src/App.tsx
    - src/App.css
    - tsconfig.app.json
    - src/hooks/useScrollSpy.ts

key-decisions:
  - "Preload logo SVG as LCP candidate element"
  - "Preconnect to GitHub raw content domain for faster resource loading"
  - "Set 500px min-height on hero-container for layout stability"
  - "Set 200px min-height on content-card to prevent collapse"
  - "Exclude test files from production TypeScript build"

patterns-established:
  - "Resource preloading: Critical above-fold images get preload hints"
  - "Explicit dimensions: All images have width/height to prevent CLS"
  - "Container stability: Interactive containers have min-height"

# Metrics
duration: 3min
completed: 2026-02-03
---

# Phase 05 Plan 02: Core Web Vitals Optimization Summary

**Preload hints, explicit dimensions, and layout stability to achieve LCP < 2.5s and CLS < 0.1**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-03T19:34:14Z
- **Completed:** 2026-02-03T19:37:11Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Added preload hint for logo SVG (LCP element) and preconnect for GitHub domain
- Set explicit width/height dimensions on logo image with srcSet for responsive support
- Established layout stability with min-height on hero-container (500px) and content-card (200px)
- Fixed TypeScript build errors blocking verification

## Task Commits

Each task was committed atomically:

1. **Task 1: Add explicit dimensions, srcset, and preload hints** - `77d334f` (feat)
2. **Task 2: Fix layout stability with reserved space** - `93e3136` (feat)
3. **Task 3: Verify Core Web Vitals improvements** - (verification only, no commit)

_Note: Task 1 commit included blocking bug fixes required for build verification_

## Files Created/Modified
- `index.html` - Added preconnect and preload hints for critical resources
- `src/App.tsx` - Added explicit width/height and srcSet to logo image
- `src/App.css` - Added min-height to hero-container (500px), content-card (200px), and logo (200x200)
- `tsconfig.app.json` - Excluded test files from production build to fix TypeScript errors
- `src/hooks/useScrollSpy.ts` - Fixed type narrowing issue (null → undefined)

## Decisions Made

**1. Preload logo as LCP candidate**
- Rationale: Logo is above-fold hero element, likely LCP candidate
- Impact: Reduces LCP by starting image fetch during HTML parse

**2. Preconnect to GitHub raw content domain**
- Rationale: Logo is hosted externally, DNS/TLS handshake adds latency
- Impact: Reduces connection time for external resource

**3. Hero container min-height: 500px**
- Rationale: Reserves space for logo (200px), title, and scroll indicator
- Impact: Prevents CLS when content loads

**4. Content card min-height: 200px**
- Rationale: Prevents collapse before React hydration
- Impact: Stable layout from first paint

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] TypeScript build failing on test files**
- **Found during:** Task 1 verification (npm run build)
- **Issue:** `tsc -b` checking test files without vitest types, causing 40+ TypeScript errors
- **Fix:** Added `exclude: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/setupTests.ts"]` to tsconfig.app.json
- **Files modified:** tsconfig.app.json
- **Verification:** Build succeeds with no errors
- **Committed in:** 77d334f (Task 1 commit)

**2. [Rule 1 - Bug] Type narrowing failure in useScrollSpy hook**
- **Found during:** Task 1 verification (npm run build after test exclusion)
- **Issue:** `activeEntry` initialized as `null` not narrowing correctly in if block (TS2339 error)
- **Fix:** Changed type from `IntersectionObserverEntry | null` to `IntersectionObserverEntry | undefined`
- **Files modified:** src/hooks/useScrollSpy.ts
- **Verification:** Build succeeds, type narrowing works correctly
- **Committed in:** 77d334f (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both auto-fixes necessary to unblock build verification. No scope change.

## Issues Encountered

**TypeScript project structure:**
- `tsconfig.app.json` was including test files but lacking vitest types
- Fixed by excluding test files from production build (tests run via vitest with separate config)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for next steps:**
- Layout is stable with explicit dimensions
- Critical resources are preloaded
- Build system verified working
- Ready for code splitting (05-03) and animation optimization (05-04)

**Verification pending:**
- Lighthouse audit requires manual Chrome DevTools testing
- Target metrics: LCP < 2.5s, CLS < 0.1
- Preview server ready at localhost:4173 for manual testing

**Technical foundation:**
- All preload hints present in built HTML
- All explicit dimensions verified in built CSS
- Min-height rules confirmed in production build

---
*Phase: 05-performance-animation*
*Completed: 2026-02-03*
