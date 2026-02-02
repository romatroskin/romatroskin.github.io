# Project Research Summary

**Project:** Puff Puff Dev Portfolio Site
**Domain:** React portfolio with complex animations (react-spring, canvas-based Perlin noise waves)
**Researched:** 2026-02-03
**Confidence:** MEDIUM

## Executive Summary

This is a React-based portfolio site with sophisticated canvas animations (Perlin noise waves) and parallax scrolling effects. The current implementation mixes class-based and functional components, uses inconsistent styling approaches, and lacks critical infrastructure (testing, accessibility features, performance monitoring). Research reveals this is a common portfolio site pattern elevated with physics-based animations, requiring careful attention to performance and accessibility.

The recommended approach is a phased refactoring strategy: establish testing infrastructure first, then systematically migrate to functional components with proper hooks, consolidate styling, and add accessibility features. The most critical risk is breaking existing animations during refactoring—mitigated by establishing test coverage before any structural changes. Secondary risks include performance degradation on mobile devices and accessibility violations (particularly motion sensitivity).

Key technical debt includes mixed react-spring package imports, random values regenerated on every render causing animation glitches, and no reduced motion support. These must be addressed before feature development to avoid compounding issues. The architecture is fundamentally sound but needs modernization; the stack choices are appropriate but need cleanup (remove lodash, consolidate packages, add testing frameworks).

## Key Findings

### Recommended Stack

**Current stack analysis:** React 18.3.1 + TypeScript 5.5.4 + Vite 5.4.2 + react-spring 9.7.4 is solid but has gaps in testing, accessibility, and performance monitoring infrastructure. Major version upgrades (React 19, Vite 7, react-spring v10) are available but should be deferred until test coverage exists.

**Core technologies to add:**
- **Vitest ^2.x**: Unit/integration testing — native Vite integration, ~10x faster than Jest, Jest-compatible API
- **@testing-library/react ^16.x**: Component testing — industry standard, encourages accessibility-focused tests
- **vitest-axe ^1.x**: Accessibility testing — automated WCAG compliance checks in tests
- **rollup-plugin-visualizer ^5.x**: Bundle analysis — identify bloat and optimization opportunities
- **web-vitals ^4.x**: Performance monitoring — track Core Web Vitals in production

**Critical cleanup:**
- Remove lodash (only used for `random`, native Math.random() sufficient) — saves ~70KB
- Remove redundant `react-spring` package (keep only `@react-spring/web` and `@react-spring/parallax`) — eliminates import conflicts
- Audit and potentially remove PureCSS (underused, adds unnecessary weight)

**Version strategy:**
- Immediate: Minor bumps (TypeScript 5.9.3, react-spring 9.7.5 patches)
- Short-term: Stay on stable majors (Vite 5.x, React 18.x)
- Deferred: Major version research after test coverage (React 19, Vite 7, react-spring v10)

### Expected Features

**Must have (table stakes):**
- Keyboard navigation with visible focus indicators — WCAG 2.1 AA requirement, currently missing
- Functional navigation (scroll-to-section) — all links currently point to `href="#"`, broken UX
- Mobile menu implementation — 60%+ traffic is mobile, desktop nav likely breaks
- Color contrast compliance (4.5:1) — WCAG 2.1 AA, needs verification for dark theme
- Semantic HTML with ARIA labels — screen readers need proper landmarks
- 44x44px touch targets — WCAG 2.1 AA, mobile usability requirement
- Core Web Vitals compliance — LCP < 2.5s, INP < 200ms, CLS < 0.1 (currently at risk from wave animations)

**Should have (competitive):**
- Reduced motion support — WCAG AAA, critical for users with vestibular disorders, currently missing
- Active section highlighting — shows current section in nav as user scrolls
- Scroll progress indicator — subtle UX enhancement showing journey progress
- Dark/light mode toggle — user preference (already has dark mode, needs toggle)
- Skip to content link — accessibility best practice for keyboard users

**Defer (v2+):**
- Contact form (requires backend integration)
- Print stylesheet (nice-to-have)
- Advanced animations beyond current waves
- Blog/case studies section (content-dependent)

### Architecture Approach

**Current architecture** has sound component boundaries but uses outdated patterns: class-based Wave component with imperative RAF loop, mixed CSS approaches (CSS modules + plain CSS + inline styles), and tight coupling between animation logic and rendering. The core insight is that animations should use react-spring's reactive flow throughout, not mix RAF with springs.

**Recommended refactoring pattern:** Extract animation logic into custom hooks (useWaveAnimation, usePerlinNoise, useAnimationFrame) that compose together, while keeping presentation components pure and testable. This enables the container/presentation split where logic is testable without rendering, and presentation is snapshot-testable.

**Major components post-refactor:**
1. **App** — Layout orchestration, scroll handling using react-spring's useScroll
2. **Header** — Navigation UI (presentational), receives scroll state from App
3. **AnimatedWaveLayer** — Coordinates wave rendering using useWaveAnimation hook
4. **WaveCanvas** — Pure SVG path rendering (presentational only)
5. **useWaveAnimation** — Manages RAF loop, animation state, path calculations
6. **usePerlinNoise** — Encapsulates Perlin instance management with stable reference

**CSS organization strategy:** Consolidate to CSS Modules for component-specific styles + CSS custom properties for theme values + inline animated() styles only for react-spring values. Remove PureCSS dependency and migrate to CSS Modules. Extract theme values from bloated index.css (435 lines) into theme.css.

### Critical Pitfalls

1. **Random values inside render creating new Perlin instances** — Currently `random(-20, 20)` is called on every render in App.tsx, creating glitchy animations, GC pressure, and potential memory leaks. Must move to useState or useMemo with empty deps array to stabilize values across renders.

2. **Mixed react-spring package imports causing conflicts** — Codebase imports from both `react-spring` and `@react-spring/web`, creating type mismatches, bundle bloat (~40KB duplication), and future upgrade blockers. Must choose one package and update all imports in single commit.

3. **Class component lifecycle mixing RAF with react-spring** — Wave.tsx runs its own RAF loop while receiving spring values from parent, creating double animation loops, 2-3x CPU usage, memory leaks on unmount, and impossible testing. Must choose one animation driver or use react-spring's loop mechanism.

4. **No reduced motion support** — Animations run continuously without checking `prefers-reduced-motion`, violating WCAG AAA and causing vestibular issues for users who requested reduced motion. Must add media query check and provide static fallback.

5. **Missing error boundaries around animations** — No error boundaries wrapping WavyBackground; any Perlin calculation error white-screens entire app. Must add error boundaries with graceful degradation (static fallback or remove animation).

**Additional critical issues:**
- Console.log in production build (Wave constructor logs every instance creation)
- Non-functional navigation links (all `href="#"`)
- No accessibility testing or automation
- Inline styles recreated every render causing performance issues

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation & Cleanup
**Rationale:** Must establish testing infrastructure and fix critical bugs before any refactoring. Can't safely migrate components without tests. Random value regeneration bug actively breaks animations and must be fixed immediately.

**Delivers:**
- Vitest + React Testing Library setup with configuration
- First passing test to validate infrastructure
- Critical bug fixes (random values, console.log, package consolidation)
- Bundle analysis baseline

**Addresses:**
- Testing framework setup (from STACK.md)
- Critical Pitfalls #1, #2, #4 (random values, package conflicts, console.log)
- Dependency cleanup (lodash removal)

**Avoids:**
- Refactoring without safety net
- Accumulating more bugs on unstable foundation
- Shipping broken animations to users

**Duration estimate:** 1-2 weeks
**Risk level:** LOW — infrastructure setup, no feature changes
**Research needs:** Minimal — Vitest setup is well-documented

---

### Phase 2: Component Architecture Refactor
**Rationale:** With test coverage in place, can safely migrate Wave class component to functional with custom hooks. This unblocks performance optimization and enables proper react-spring integration. Must happen before accessibility work since hook-based components are easier to extend.

**Delivers:**
- usePerlinNoise, useAnimationFrame, useWaveAnimation hooks
- Functional Wave component replacing class-based implementation
- Proper react-spring reactive flow (no .get() calls)
- Container/presentation split for testability

**Addresses:**
- Architecture patterns from ARCHITECTURE.md (hooks extraction)
- Critical Pitfall #3 (RAF/spring mixing)
- Wave component test coverage
- Performance optimization foundation

**Implements:**
- Custom hooks pattern for animation logic
- React.memo optimization points
- Proper cleanup in useEffect hooks

**Avoids:**
- Stale closures (common functional component migration pitfall)
- Lost instance variables from class to hooks migration
- Breaking animation continuity during refactor

**Duration estimate:** 2-3 weeks
**Risk level:** MEDIUM — requires careful testing of animation behavior
**Research needs:** Phase research recommended for react-spring v9.7 scroll-driven animation best practices

---

### Phase 3: Navigation & Accessibility
**Rationale:** With stable component architecture, can implement functional navigation and accessibility features. These are table stakes for professional portfolio and must be complete before performance optimization (need to measure real user interactions).

**Delivers:**
- Functional scroll-to-section navigation
- Mobile menu (hamburger + slide-out drawer)
- Keyboard navigation with focus indicators
- Skip to content link
- Semantic HTML landmarks and ARIA labels
- Reduced motion support (prefers-reduced-motion media query)

**Addresses:**
- Table stakes from FEATURES.md (keyboard nav, mobile menu, touch targets)
- Critical Pitfall #6 (reduced motion)
- Critical Pitfall #7 (non-functional navigation)
- WCAG 2.1 AA compliance requirements

**Avoids:**
- Accessibility retrofitting (expensive to add later)
- Legal compliance issues
- Unusable site for keyboard/screen reader users
- Motion sickness for sensitive users

**Duration estimate:** 2-3 weeks
**Risk level:** MEDIUM — requires UX testing, may need design iteration
**Research needs:** Standard patterns, skip phase research

---

### Phase 4: CSS Organization & Design System
**Rationale:** Can run in parallel with Phase 3 or after. CSS organization blocks theme switching features but doesn't block critical functionality. Consolidating CSS improves maintainability and enables dark/light mode toggle.

**Delivers:**
- CSS Modules migration (Header.module.css, Wave.module.css)
- Theme.css with CSS custom properties
- Cleaned-up index.css (remove component-specific rules)
- Dark/light mode toggle implementation
- PureCSS removal (if audit confirms underuse)

**Addresses:**
- CSS organization from ARCHITECTURE.md
- Pitfall #8 (inline styles, theme system)
- Design system foundation for future features

**Implements:**
- Consistent styling strategy
- Performance improvement (eliminate inline style recreation)

**Avoids:**
- Style conflicts from mixed approaches
- Difficulty implementing theme switching
- Maintenance burden from scattered styles

**Duration estimate:** 1-2 weeks
**Risk level:** LOW — visual changes only, easily testable
**Research needs:** Minimal — CSS Modules are well-established

---

### Phase 5: Performance Optimization
**Rationale:** After architecture, navigation, and CSS are stable, can focus on optimization. Need real user patterns (from Phase 3 navigation) to optimize effectively. Performance optimization informed by bundle analysis and profiling.

**Delivers:**
- Bundle size optimization (visualizer integration)
- Memoization where profiling shows benefit
- Web Vitals monitoring integration
- Core Web Vitals compliance (LCP, INP, CLS targets)
- Wave animation performance tuning for mobile
- Image optimization (lazy loading, srcset)

**Addresses:**
- Performance tools from STACK.md (rollup-plugin-visualizer, web-vitals)
- Pitfall #9 (missing memoization)
- Core Web Vitals compliance from FEATURES.md
- Mobile device performance concerns

**Avoids:**
- Premature optimization (Pitfall #13)
- Over-memoization without data
- Optimizing wrong metrics

**Duration estimate:** 2 weeks
**Risk level:** LOW — non-breaking improvements
**Research needs:** Minimal — standard optimization patterns

---

### Phase 6: Testing Coverage & Error Handling
**Rationale:** With all features stable, achieve comprehensive test coverage and production hardening. This phase can overlap with Phase 5 or extend beyond it.

**Delivers:**
- Component test suite (80%+ coverage target)
- Hook unit tests
- Accessibility tests with vitest-axe
- Error boundaries with fallback UI
- Visual regression baseline
- Animation performance benchmarks

**Addresses:**
- Test coverage requirements from STACK.md
- Accessibility testing infrastructure
- Critical Pitfall #5 (missing error boundaries)
- Pitfall #10 (animation testing patterns)

**Avoids:**
- Production errors causing white screens
- Regressions during future changes
- Accessibility violations slipping through

**Duration estimate:** 2-3 weeks
**Risk level:** LOW — adds safety, no feature changes
**Research needs:** Phase research recommended for react-spring animation testing patterns with Vitest

---

### Phase 7: Dependency Updates (Future)
**Rationale:** After full test coverage exists, can research and execute major version upgrades. This phase is lower priority but necessary for security and ecosystem compatibility.

**Delivers:**
- React 19 migration research and execution
- Vite 7.x upgrade
- react-spring v10 migration (if stable and beneficial)
- TypeScript latest features adoption

**Addresses:**
- Deferred updates from STACK.md
- Long-term maintainability

**Risk level:** HIGH — requires careful testing, may have breaking changes
**Research needs:** Deep research required for each major version migration

---

### Phase Ordering Rationale

**Sequential dependencies:**
1. Testing infrastructure (Phase 1) blocks all other phases — can't safely refactor without tests
2. Component refactor (Phase 2) must precede optimization (Phase 5) — can't optimize unstable architecture
3. Navigation (Phase 3) should precede performance (Phase 5) — need real interaction patterns to optimize

**Parallel opportunities:**
- Phase 3 (Navigation) and Phase 4 (CSS) can overlap — independent concerns
- Phase 6 (Testing) can start during Phase 5 (Performance) — add tests as you optimize

**Critical path:** Phase 1 → Phase 2 → Phase 3 → Phase 5 (minimum viable launch)

**Why this grouping:**
- Phase 1-2: Foundation (unstable without this)
- Phase 3-4: User-facing features (table stakes for portfolio)
- Phase 5-6: Polish and hardening (competitive quality)
- Phase 7: Maintenance (long-term health)

**Pitfall avoidance:**
- Establishes testing BEFORE refactoring (avoids "tests can wait" anti-pattern)
- Fixes critical bugs early (random values, package conflicts)
- Addresses accessibility throughout (not "Phase 10")
- Profiles before optimizing (avoids premature optimization)

### Research Flags

**Phases needing deeper research during planning:**

- **Phase 2 (Component Refactor):** Complex react-spring v9.7 integration patterns, especially scroll-driven animations with Interpolation types. Recommend `/gsd:research-phase` to verify latest best practices and migration patterns from class to hooks with react-spring.

- **Phase 6 (Testing Coverage):** Animation testing with Vitest is newer pattern (Vitest + react-spring + RAF mocking). Recommend `/gsd:research-phase` to establish testing patterns for time-based animations and verify vitest-axe integration.

**Phases with standard patterns (skip research-phase):**

- **Phase 1 (Foundation):** Vitest setup extremely well-documented, standard Vite project pattern
- **Phase 3 (Navigation):** Scroll-to-section and mobile menu are established patterns with abundant examples
- **Phase 4 (CSS Organization):** CSS Modules migration is straightforward with clear documentation
- **Phase 5 (Performance):** Standard optimization patterns, bundle analysis tools well-documented

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **MEDIUM** | Training knowledge limited to Jan 2025, exact versions need verification. Testing framework choices (Vitest) are high confidence; version numbers are hypothetical. React 19/Vite 7 compatibility needs verification. |
| Features | **HIGH** | WCAG 2.1 AA requirements are official W3C standard. Core Web Vitals metrics are established. Portfolio patterns are well-understood domain. Current state analysis based on actual code read. |
| Architecture | **HIGH** | Direct codebase analysis provides clear picture. React patterns (hooks, class migration) are stable. react-spring integration patterns confirmed from package.json and code inspection. |
| Pitfalls | **HIGH** | Identified from actual code analysis (random values in render, mixed packages, class/functional mixing, console.log). Common React refactoring pitfalls are well-documented in training data. |

**Overall confidence:** MEDIUM

Confidence is medium primarily due to inability to verify current library versions and best practices via web search. All recommendations are based on solid domain knowledge and direct code analysis, but implementation should verify:
- Exact Vitest API current best practices
- vitest-axe current status and stability
- react-spring v9.7.4 specific behavior with TypeScript
- React 19 compatibility timeline

### Gaps to Address

**Version verification needed:**
- All package versions should be confirmed against npm registry before installation
- react-spring v10 status — check if production-ready, migration path complexity
- vitest-axe existence and maintenance status — verify it's stable alternative to jest-axe
- Vite 7.x breaking changes — understand scope before recommending upgrade

**Testing patterns research:**
- react-spring animation testing with Vitest specifically (newer combination)
- Perlin noise deterministic testing strategies
- Visual regression testing approach for wave animations

**Performance unknowns:**
- Current Core Web Vitals metrics (need baseline measurement)
- Wave animation performance on low-end mobile devices
- Actual bundle size after tree-shaking (need measurement)

**Accessibility verification:**
- Current color contrast ratios (dark theme needs checking)
- Touch target sizing across all interactive elements
- Screen reader testing with actual NVDA/JAWS

**How to handle during planning:**
- Phase 1 should include baseline measurements (bundle size, Core Web Vitals, coverage)
- Phase 2 should include phase-level research for react-spring patterns if uncertainty remains
- All phases should include verification step against official docs before implementation
- Set up automated checks (Lighthouse CI, bundle size limits) to track gaps closing

## Sources

### Primary Sources (HIGH confidence)
- **Codebase analysis:** Direct reading of App.tsx, Wave.tsx, WavyBackground.tsx, Header.tsx, Perlin.tsx, package.json, CSS files
- **Official standards:** WCAG 2.1 (W3C), Core Web Vitals (Google official metrics)
- **Package versions:** Confirmed from package.json — React 18.3.1, TypeScript 5.5.4, Vite 5.4.2, react-spring 9.7.4

### Secondary Sources (MEDIUM confidence)
- **Training knowledge:** React ecosystem patterns as of January 2025 (hooks, testing, react-spring)
- **Domain expertise:** Portfolio site patterns, animation best practices, accessibility requirements
- **npm outdated analysis:** Version recommendations based on project's npm outdated output

### Limitations (verification recommended)
- **WebSearch unavailable:** Could not verify current library versions or check for breaking changes
- **Context7 unavailable:** Could not access deep technical documentation libraries
- **WebFetch unavailable:** Could not check official docs for latest API changes

**Recommended verification before implementation:**
- [Vitest Official Docs](https://vitest.dev) — Current setup patterns and API
- [React Testing Library](https://testing-library.com/react) — Latest best practices
- [react-spring Documentation](https://www.react-spring.dev) — v9.7 specifics, v10 status
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) — Official criterion references
- [Web Vitals](https://web.dev/vitals/) — Current thresholds and measurement techniques

---

*Research completed: 2026-02-03*
*Ready for roadmap: YES*
*Next step: Use this summary to create detailed roadmap with `/gsd:write-roadmap`*
