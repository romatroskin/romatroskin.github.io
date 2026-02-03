# Roadmap: Puff Puff Dev Portfolio v1

## Overview

Transform the existing Puff Puff Dev portfolio site from a visually impressive but fragile prototype into a production-ready, accessible, and performant single-page portfolio. The journey progresses from stabilizing the foundation (critical bugs, testing infrastructure) through architecture modernization (class to hooks), user-facing features (navigation, accessibility), visual polish (CSS organization, theming), performance optimization (Core Web Vitals), and finally comprehensive testing coverage with error handling.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Cleanup** - Critical bug fixes, testing setup, dependency cleanup
- [x] **Phase 2: Component Architecture** - Wave class-to-functional refactor with custom hooks
- [x] **Phase 3: Navigation & Core A11Y** - Scroll navigation, mobile menu, keyboard accessibility
- [ ] **Phase 4: CSS & Visual Design** - CSS modules, color contrast, responsive typography, theming
- [ ] **Phase 5: Performance & Animation** - Perlin caching, Core Web Vitals, lazy loading
- [ ] **Phase 6: Testing & Error Handling** - Error boundaries, accessibility tests, coverage

## Phase Details

### Phase 1: Foundation & Cleanup
**Goal**: Establish testing infrastructure and fix critical bugs that actively break user experience
**Depends on**: Nothing (first phase)
**Requirements**: REQ-CQ-002, REQ-CQ-003, REQ-CQ-004, REQ-CQ-005, REQ-CQ-006, REQ-TST-001, REQ-TST-002, REQ-PERF-002, REQ-PERF-003
**Success Criteria** (what must be TRUE):
  1. Running `npm test` executes Vitest and passes with at least one test
  2. Perlin noise algorithm has unit test coverage proving deterministic output
  3. Wave animations render without glitching or stuttering (random values stable)
  4. No console.log statements appear in browser dev tools on production build
  5. Bundle does not include lodash (verified via bundle analysis)
**Plans**: 3 plans in 2 waves

Plans:

- [x] 01-01-PLAN.md — Testing infrastructure (Vitest + React Testing Library + Perlin tests)
- [x] 01-02-PLAN.md — Critical bug fixes (useMemo stabilization, console.log removal, TypeScript fixes)
- [x] 01-03-PLAN.md — Dependency cleanup (lodash/PureCSS removal, CSS Modules for Header, bundle verification)

### Phase 2: Component Architecture
**Goal**: Migrate Wave class component to functional component with hooks for testability and react-spring integration
**Depends on**: Phase 1
**Requirements**: REQ-CQ-001, REQ-TST-003, REQ-TST-004
**Success Criteria** (what must be TRUE):
  1. Wave component renders identically to before (visual parity verified)
  2. Wave component is functional with hooks (no class syntax)
  3. Animation continues smoothly during scroll interactions
  4. Component smoke tests pass for App, Header, WavyBackground
**Plans**: 4 plans in 3 waves

Plans:

- [x] 02-01-PLAN.md — Custom hooks extraction (useAnimationFrame, usePerlinNoise) with unit tests
- [x] 02-02-PLAN.md — Wave functional component migration with smoke tests (visual parity checkpoint)
- [x] 02-03-PLAN.md — Gap closure: Fix scroll responsiveness and wave cutoff issues
- [x] 02-04-PLAN.md — Gap closure: Visual verification checkpoint

### Phase 3: Navigation & Core A11Y
**Goal**: Users can navigate the site via scroll, keyboard, and mobile menu with proper accessibility support
**Depends on**: Phase 2
**Requirements**: REQ-NAV-001, REQ-NAV-002, REQ-NAV-003, REQ-NAV-004, REQ-A11Y-001, REQ-A11Y-002, REQ-A11Y-004, REQ-A11Y-005, REQ-A11Y-006, REQ-A11Y-007, REQ-A11Y-008, REQ-A11Y-010
**Success Criteria** (what must be TRUE):
  1. Clicking nav links smooth-scrolls to corresponding section
  2. Current section is visually highlighted in navigation as user scrolls
  3. Mobile users can open hamburger menu, select section, menu closes
  4. User can Tab through all interactive elements with visible focus indicators
  5. Screen reader announces navigation landmarks and section headings correctly
  6. Skip-to-content link is first focusable element and jumps to main content
**Plans**: 4 plans in 3 waves

Plans:
- [x] 03-01-PLAN.md - Dependencies, useScrollSpy hook, semantic landmarks (Wave 1)
- [x] 03-02-PLAN.md - SkipLink component, focus indicators (Wave 1)
- [x] 03-03-PLAN.md - Mobile menu with focus trap and body scroll lock (Wave 2)
- [x] 03-04-PLAN.md - Integration and visual verification checkpoint (Wave 3)

### Phase 4: CSS & Visual Design
**Goal**: Organized CSS architecture with proper theming, contrast compliance, and responsive design
**Depends on**: Phase 3
**Requirements**: REQ-CQ-008, REQ-A11Y-003, REQ-RD-001, REQ-RD-002, REQ-RD-004, REQ-VP-001, REQ-VP-002, REQ-VP-003, REQ-VP-004, REQ-VP-005
**Success Criteria** (what must be TRUE):
  1. All text passes WCAG 4.5:1 contrast ratio (verifiable via axe or Lighthouse)
  2. Typography scales appropriately from 320px to desktop widths
  3. All tap targets are minimum 44x44px on touch devices
  4. User can toggle between dark and light modes (persisted preference)
  5. Content reflows at 320px without horizontal scrollbar
**Plans**: 4 plans in 2 waves

Plans:
- [x] 04-01-PLAN.md — CSS architecture and theme system (design tokens, themes, useTheme hook, ThemeToggle, FOUC prevention)
- [x] 04-02-PLAN.md — Responsive design (fluid typography, 44px touch targets, 320px reflow)
- [x] 04-03-PLAN.md — Visual polish (micro-interactions, GPU transitions, reduced-motion support, print stylesheet)
- [x] 04-04-PLAN.md — Gap closure: Fix logo visibility and text contrast over waves

### Phase 5: Performance & Animation
**Goal**: Achieve Core Web Vitals compliance with optimized animations across devices
**Depends on**: Phase 4
**Requirements**: REQ-RD-003, REQ-RD-005, REQ-A11Y-009, REQ-PERF-001, REQ-PERF-004, REQ-PERF-005, REQ-PERF-006, REQ-PERF-007, REQ-PERF-008
**Success Criteria** (what must be TRUE):
  1. Lighthouse performance score is 90+ on mobile
  2. LCP (Largest Contentful Paint) under 2.5 seconds
  3. INP (Interaction to Next Paint) under 200ms
  4. CLS (Cumulative Layout Shift) under 0.1
  5. Users with prefers-reduced-motion see static/minimal animations
  6. Wave animations run smoothly on mid-tier mobile devices (no frame drops)
**Plans**: TBD

Plans:
- [ ] 05-01: Perlin caching and animation optimization
- [ ] 05-02: Core Web Vitals optimization (LCP, INP, CLS)
- [ ] 05-03: Reduced motion support and responsive animation parameters

### Phase 6: Testing & Error Handling
**Goal**: Comprehensive test coverage and graceful error handling for production resilience
**Depends on**: Phase 5
**Requirements**: REQ-CQ-007, REQ-TST-005
**Success Criteria** (what must be TRUE):
  1. Error in wave animation shows fallback UI instead of white screen
  2. vitest-axe accessibility tests pass for all major components
  3. Application recovers gracefully from network failures or missing assets
**Plans**: TBD

Plans:
- [ ] 06-01: Error boundaries and fallback UI
- [ ] 06-02: Accessibility test suite with vitest-axe

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Cleanup | 3/3 | Complete | 2026-02-03 |
| 2. Component Architecture | 4/4 | Complete | 2026-02-03 |
| 3. Navigation & Core A11Y | 4/4 | Complete | 2026-02-03 |
| 4. CSS & Visual Design | 4/4 | Complete | 2026-02-03 |
| 5. Performance & Animation | 0/3 | Not started | - |
| 6. Testing & Error Handling | 0/2 | Not started | - |

---

*Created: 2026-02-03*
*Total Requirements: 45 mapped across 6 phases*
*Coverage: 100% (no orphaned requirements)*
