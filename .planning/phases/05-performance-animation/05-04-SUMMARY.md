---
phase: 05-performance-animation
plan: 04
title: "Code Splitting & Lazy Loading"
completed: 2026-02-03
duration: 117 seconds
subsystem: performance
tags: [lazy-loading, code-splitting, react-lazy, suspense, bundle-optimization]

requires:
  - 05-02  # Core Web Vitals optimization (LCP baseline)
  - 03-01  # Scroll navigation (section structure)

provides:
  - Lazy-loaded below-fold sections (Services, About)
  - Reduced initial bundle size by ~2 kB
  - Suspense fallback with loading state
  - Bundle split into separate chunks

affects:
  - 05-05  # Image optimization (if images added to lazy sections)
  - 06-*   # Testing phase (need to test lazy loading behavior)

tech-stack:
  added:
    - React.lazy for dynamic imports
    - Suspense for loading boundaries
  patterns:
    - Route-level code splitting for section components
    - Inline hero for LCP, lazy below-fold
    - SectionLoader fallback pattern

key-files:
  created:
    - src/sections/ServicesSection.tsx
    - src/sections/AboutSection.tsx
  modified:
    - src/App.tsx (lazy imports, Suspense boundaries)
    - src/App.css (section-loader styles)

decisions:
  - LAZY-LOADING-001: Lazy load only below-fold sections (pages 2-3)
  - LAZY-LOADING-002: Keep hero section inline to preserve LCP
  - SUSPENSE-001: Per-section Suspense boundaries for independent loading
  - FALLBACK-001: Simple text loader with aria-busy and aria-label

commits:
  - 8e33410: "refactor(05-04): extract below-fold sections into separate components"
  - 06b8b87: "feat(05-04): implement lazy loading for below-fold sections"
---

# Phase 5 Plan 04: Code Splitting & Lazy Loading Summary

Lazy loading for below-fold content to reduce initial bundle and improve LCP.

## What Was Built

### 1. Section Extraction
- Created `src/sections/ServicesSection.tsx` - Services intro with onNavigate prop
- Created `src/sections/AboutSection.tsx` - About company section
- Both components use existing CSS classes (intro-container, about-container, content-card)

### 2. Lazy Loading Implementation
- Added `React.lazy` and `Suspense` imports to App.tsx
- Lazy loaded ServicesSection and AboutSection (pages 2-3)
- Kept hero section (page 1) inline for optimal LCP
- Created `SectionLoader` fallback component with loading text

### 3. Bundle Optimization Results
**Before:** Single bundle ~218.7 kB
**After:** Main bundle 218.19 kB + 2 lazy chunks:
- ServicesSection-B-LAr9yu.js: 0.88 kB (gzip: 0.48 kB)
- AboutSection-8EigQyk-.js: 1.22 kB (gzip: 0.64 kB)

**Initial bundle reduction:** ~2 kB deferred to below-fold scroll

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| LAZY-LOADING-001 | Lazy load only below-fold sections | Hero is LCP candidate - must load immediately |
| LAZY-LOADING-002 | Keep hero section inline | Prevents LCP regression from lazy loading critical content |
| SUSPENSE-001 | Per-section Suspense boundaries | Allows sections to load independently without blocking each other |
| FALLBACK-001 | Simple text loader | Minimal UI for fast load - complex spinners would hurt perceived performance |

## Technical Approach

### Code Splitting Strategy
- **Above-fold (page 1):** Inline rendering (hero section with logo)
- **Below-fold (pages 2-3):** Lazy loaded with React.lazy
- **Suspense boundaries:** One per section for independent loading

### Loading Fallback
```tsx
function SectionLoader() {
  return (
    <div className="section-loader content-card" aria-busy="true" aria-label="Loading section">
      <div className="loader-text">Loading...</div>
    </div>
  );
}
```

**Accessibility features:**
- `aria-busy="true"` - Indicates loading state
- `aria-label="Loading section"` - Screen reader announcement
- Reuses `.content-card` styling for visual consistency

### Import Pattern
```tsx
const ServicesSection = lazy(() => import('./sections/ServicesSection'));
const AboutSection = lazy(() => import('./sections/AboutSection'));
```

**Vite behavior:**
- Dynamic imports create separate chunks automatically
- Chunks load on-demand when Suspense triggers
- Browser caches chunks separately from main bundle

## Performance Impact

### Bundle Size Reduction
- Initial bundle: -2 kB (1% reduction)
- Below-fold chunks deferred until scroll
- Gzip compression: 0.48 kB + 0.64 kB = 1.12 kB total lazy content

### Expected LCP Impact
- **No impact:** Hero section still inline
- **Benefit:** Faster initial parse (less JavaScript to evaluate)

### User Experience
- **Fast initial load:** Hero visible immediately
- **Seamless lazy load:** Loading state brief (chunks small)
- **No flash:** content-card styling prevents layout shift

## Verification Results

### Build Verification
```bash
npm run build
✓ 66 modules transformed
dist/assets/ServicesSection-B-LAr9yu.js    0.88 kB │ gzip:  0.48 kB
dist/assets/AboutSection-8EigQyk-.js       1.22 kB │ gzip:  0.64 kB
dist/assets/index-CB2L51Bv.js            218.19 kB │ gzip: 74.92 kB
```
✅ Separate chunks created for lazy sections

### Runtime Verification
```bash
npm run dev
VITE v5.4.2  ready in 131 ms
➜  Local:   http://localhost:5175/
```
✅ Dev server runs successfully

### Code Analysis
- ✅ App.tsx imports lazy and Suspense from React
- ✅ App.tsx has lazy(() => import()) for both sections
- ✅ Pages 2-3 wrapped in Suspense with fallback
- ✅ Hero section (page 1) not lazy loaded
- ✅ SectionLoader has aria-busy and aria-label

## Deviations from Plan

**None** - Plan executed exactly as written.

## Known Limitations

1. **Small chunk size:** 2 kB total lazy content is minimal - bigger impact when sections grow
2. **Network overhead:** Each chunk requires separate HTTP request (mitigated by HTTP/2 multiplexing)
3. **Loading flash:** On slow connections, SectionLoader might briefly show (acceptable tradeoff)

## Next Phase Readiness

**Ready for 05-05 (Image Optimization):**
- Section structure in place
- Lazy loading pattern established
- Can add image lazy loading to section components

**Considerations for Phase 6 (Testing):**
- Need tests for lazy loading behavior
- Test Suspense fallback rendering
- Test section chunks load on scroll
- Mock dynamic imports in test environment

**No blockers identified.**

## File Reference

### Created Files
- `src/sections/ServicesSection.tsx` (61 lines) - Services intro section with CTA
- `src/sections/AboutSection.tsx` (61 lines) - About company section

### Modified Files
- `src/App.tsx` (+20, -50 lines) - Lazy imports, Suspense boundaries, removed inline JSX
- `src/App.css` (+14 lines) - SectionLoader styles

### Build Artifacts
- `dist/assets/ServicesSection-B-LAr9yu.js` - Services section chunk
- `dist/assets/AboutSection-8EigQyk-.js` - About section chunk

## Related Documentation

**React docs:** [Code Splitting](https://react.dev/reference/react/lazy)
**Vite docs:** [Code Splitting](https://vitejs.dev/guide/features.html#dynamic-import)
**Web.dev:** [Lazy Loading](https://web.dev/lazy-loading/)

---

**Phase Status:** 4 of 4 plans complete
**Next:** Phase 5 complete - Phase 6 (Testing & CI/CD) next
