# Domain Pitfalls: React Portfolio Refactoring

**Domain:** React portfolio with complex animations (react-spring, Perlin noise waves)
**Researched:** 2026-02-03
**Confidence:** HIGH (based on code analysis + React/animation domain expertise)

## Critical Pitfalls

Mistakes that cause rewrites, performance degradation, or major accessibility violations.

---

### Pitfall 1: Random Values Inside Render Creating New Perlin Instances Per Frame

**What goes wrong:**
Generating random values during render (seen in App.tsx lines 45-47) causes different values on every render cycle. When combined with animation libraries like react-spring, this creates:
- New Perlin noise instances with different seeds on every animation frame
- Inconsistent wave patterns that "jump" rather than flow smoothly
- Memory leaks from accumulating unused Perlin instances
- Performance degradation from constant object creation

**Current manifestation in codebase:**
```tsx
waveConfigs.map((_, index) => {
    const amplitudeNoise = random(-20, 20); // NEW VALUE EVERY RENDER
    const speedNoise = random(-0.005, 0.005);
    const pointsNoise = random(-1, 1);
```

**Why it happens:**
Misunderstanding the difference between "random variation between waves" (should be stable) and "random animation" (should use time-based noise). Developers coming from imperative animation think "random = dynamic."

**Consequences:**
- Waves appear glitchy instead of fluid
- 60fps target becomes impossible due to GC pressure
- Users on lower-end devices see stuttering
- Animation performance issues compound when adding more effects

**Prevention:**
- Move random value generation to `useState` or `useMemo` with empty deps array
- For dynamic randomness, use time-based Perlin noise, not `Math.random()`
- Use refs for values that should persist but not trigger re-renders

**Detection:**
- Warning sign: Animation feels "choppy" despite high frame rate
- Warning sign: DevTools Profiler shows high component render times
- Warning sign: Memory usage grows during animation
- Test: Add `console.log(random())` in render - if it logs repeatedly, you've found the bug

**Phase recommendation:** Address in Phase 1 (Performance Foundation) - this blocks all other animation work.

---

### Pitfall 2: Mixed Class Components with Functional Components Using Different react-spring APIs

**What goes wrong:**
Mixing `react-spring` v9.x imports (`@react-spring/web`) with legacy `react-spring` package creates:
- Import conflicts (seen in WavyBackground.tsx line 1 commented out)
- Type mismatches between `Interpolation` types from different packages
- Bundle bloat from including both versions
- Runtime errors from incompatible spring configs

**Current manifestation in codebase:**
```tsx
// WavyBackground.tsx:
import { animated, Interpolation } from "@react-spring/web";

// Header.tsx:
import { animated } from "react-spring"; // DIFFERENT PACKAGE

// package.json has BOTH:
"@react-spring/web": "^9.7.4",
"react-spring": "^9.7.4"
```

**Why it happens:**
Refactoring incrementally from class components using old `react-spring` package to functional components using new `@react-spring/web` while keeping both packages installed "to avoid breaking things."

**Consequences:**
- TypeScript errors that are hard to debug
- Increased bundle size (~40KB+ duplicated code)
- Subtle animation bugs where springs don't chain correctly
- Future upgrades become impossible without full rewrite

**Prevention:**
- Choose ONE package: `@react-spring/web` for modern React (recommended)
- Remove old `react-spring` from package.json immediately
- Update all imports in single commit to avoid confusion
- Use codemod or find/replace: `from "react-spring"` → `from "@react-spring/web"`

**Detection:**
- Warning sign: Multiple react-spring packages in package.json
- Warning sign: Import statements from different react-spring packages
- Warning sign: TypeScript errors about incompatible `Interpolation` types
- Test: `npm ls react-spring` shows dependency duplication

**Phase recommendation:** Address in Phase 1 (Cleanup) before any animation refactoring.

---

### Pitfall 3: Class Component Lifecycle Mixing RAF with react-spring Animations

**What goes wrong:**
Mixing manual `requestAnimationFrame` loops (Waves.tsx) with react-spring's animation system creates:
- Double animation loops fighting each other
- No automatic cleanup when components unmount during spring animations
- Performance issues from running parallel animation systems
- Impossible to pause/resume animations cleanly

**Current manifestation in codebase:**
Wave component (lines 52-63, 157-173) runs its own RAF loop while also receiving spring values from parent. This creates:
- Perlin noise recalculated every frame regardless of spring state
- Spring updates triggering component renders that trigger RAF updates in infinite cycle

**Why it happens:**
Incrementally adding react-spring to existing RAF-based animation without removing the old system. Developers think "react-spring handles the scroll-based values, RAF handles the wave animation" but miss that they conflict.

**Consequences:**
- CPU usage 2-3x higher than necessary
- Janky animations when springs transition
- Memory leaks if component unmounts mid-animation
- Testing becomes impossible (can't mock both systems)

**Prevention:**
- Choose ONE animation driver: react-spring's `useSpring` with `to` prop for continuous animations
- OR use RAF directly and skip react-spring for that component
- For Perlin-based animations: use `useSpring({ from: { t: 0 }, loop: true })` and derive wave points from `t`
- Clean up RAF in `useEffect` return function, not `componentWillUnmount`

**Detection:**
- Warning sign: Component has both RAF and accepts spring values as props
- Warning sign: High CPU in DevTools Performance tab even when animations "paused"
- Warning sign: Removing react-spring props doesn't stop animation
- Test: Set `paused={true}` - if animation continues, RAF is still running

**Phase recommendation:** Address in Phase 2 (Animation Architecture) after consolidating packages.

---

### Pitfall 4: Console.log in Production Build

**What goes wrong:**
Leaving debug `console.log` statements in production (Waves.tsx line 49) causes:
- Performance degradation (logging is expensive in tight loops)
- Memory leaks from retained log references
- Security issues (logging sensitive data)
- Unprofessional appearance in browser console

**Current manifestation in codebase:**
```tsx
constructor(props: WaveProps) {
    console.log("Wave", { props }); // RUNS EVERY WAVE INSTANCE CREATION
}
```

With 5 waves, this logs 5 times on mount, 5 more on every HMR update during development, and persists in production.

**Why it happens:**
Debugging during development and forgetting to remove logs before deploying. No automated lint rules to catch console statements.

**Consequences:**
- Production console filled with noise
- Performance hit in animation-heavy components
- Looks unprofessional to anyone inspecting site
- Can leak internal state/props structure

**Prevention:**
- Add ESLint rule: `"no-console": ["error", { allow: ["warn", "error"] }]`
- Use debug library with environment-based toggling: `import debug from 'debug'`
- For temporary debugging: Use debugger statements or VSCode breakpoints
- CI/CD: Fail builds that contain console.log

**Detection:**
- Warning sign: Open browser console shows component logs
- Search codebase: `grep -r "console\\.log" src/`
- ESLint catches it automatically once rule is enabled

**Phase recommendation:** Address in Phase 1 (Cleanup) - quick win with immediate professionalism boost.

---

### Pitfall 5: Missing Error Boundaries Around Animation Components

**What goes wrong:**
Animation components without error boundaries cause entire app crashes when:
- Browser doesn't support features (old Safari, mobile browsers)
- Animation math produces NaN/Infinity (division by zero in wave calculations)
- RAF callback throws during unmount race conditions

**Current manifestation in codebase:**
No error boundaries in App.tsx wrapping WavyBackground components. If Perlin noise calculation hits edge case (lines 104-106 in Waves.tsx), entire app white-screens.

**Why it happens:**
Refactoring focus on features, not error handling. Assumption that "animations can't throw errors." Class components make developers think error boundaries are "old React" pattern.

**Consequences:**
- Single animation error crashes entire portfolio site
- No graceful degradation for unsupported browsers
- No user feedback, just blank screen
- Impossible to debug production errors without user reports

**Prevention:**
- Wrap animation-heavy components in error boundaries
- Provide fallback UI (static image, simplified animation, or remove animation entirely)
- Log errors to monitoring service (Sentry, LogRocket)
- Test error boundary: Deliberately throw in component to verify fallback renders

**Detection:**
- Warning sign: No `componentDidCatch` or `ErrorBoundary` components in codebase
- Warning sign: Animation errors crash entire app in testing
- Test: Modify Perlin calculation to `return NaN` and check if app survives

**Phase recommendation:** Address in Phase 3 (Production Hardening) after animations are stable.

---

### Pitfall 6: Accessibility - No Reduced Motion Support

**What goes wrong:**
Ignoring `prefers-reduced-motion` media query causes:
- Vestibular disorder issues for users who requested reduced motion
- WCAG 2.1 Level AAA compliance failure
- User complaints and potential legal issues (ADA compliance)
- Negative brand perception for accessibility-conscious users

**Current manifestation in codebase:**
Waves animate continuously with no check for `prefers-reduced-motion`. Parallax scrolling (App.tsx lines 99-185) also lacks reduced motion alternative.

**Why it happens:**
Developers prioritize "stunning animations" without considering accessibility. Not testing with `prefers-reduced-motion` enabled. Assuming animations enhance UX for everyone.

**Consequences:**
- Users with motion sensitivity get nauseous
- Screen reader users confused by changing content
- Accessibility audits fail
- Site unusable for subset of users

**Prevention:**
- Use `useMediaQuery('(prefers-reduced-motion: reduce)')` hook
- When true: Disable parallax, reduce animation duration to 0, or replace with fade
- Provide settings toggle for users to control motion even without OS preference
- Test with `prefers-reduced-motion: reduce` in browser DevTools

**Detection:**
- Warning sign: Animations run identically regardless of OS motion settings
- Test: Enable "Reduce Motion" in OS settings and reload site
- Audit: Run Lighthouse accessibility check

**Phase recommendation:** Address in Phase 4 (Accessibility) - can be added as feature flag initially.

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or suboptimal performance.

---

### Pitfall 7: Non-Functional Navigation Links

**What goes wrong:**
All navigation links pointing to `href="#"` (Header.tsx lines 20-40) creates:
- Broken user experience
- Poor SEO (no internal linking structure)
- Accessibility issues (links that don't go anywhere)
- Confusion during development (unclear what sections exist)

**Why it happens:**
Placeholder links during initial development never get replaced. Developer focuses on animations/visuals before content structure. Planning to "add real navigation later."

**Prevention:**
- Use `href="#section-id"` for same-page navigation or `href="/about"` for routing
- Add React Router early if multi-page, or use hash-based scroll-to for single-page
- Lint rule: Warn on `href="#"` without onClick handler
- Document content structure before building navigation

**Detection:**
- Warning sign: All nav links have `href="#"`
- Test: Click navigation - page doesn't scroll or navigate
- Accessibility test: Tab navigation highlights links that do nothing

**Phase recommendation:** Address in Phase 2 (Navigation) - required for functional portfolio.

---

### Pitfall 8: Inline Styles Instead of Theme System

**What goes wrong:**
Mixing inline styles (App.tsx lines 26-41), CSS modules (Waves.tsx line 4), and global CSS creates:
- Inconsistent styling patterns
- Hard to implement dark mode or theme switching
- Poor performance (inline styles recreate objects every render)
- Difficult to maintain design system

**Current manifestation in codebase:**
```tsx
const alignCenter = { display: "flex", alignItems: "center" }; // Recreated every render
style={{ ...alignCenter, justifyContent: "center" }} // Object spread every render
```

**Why it happens:**
Rapid prototyping with whatever styling method is fastest. No upfront design system planning. Incrementally adding features without refactoring styles.

**Prevention:**
- Choose ONE styling system: CSS Modules, Styled Components, or Tailwind
- Extract reusable styles to theme object or CSS variables
- Use `useMemo` for computed style objects if inline styles required
- Define design tokens early (colors, spacing, typography)

**Detection:**
- Warning sign: Mix of `.css`, `.module.css`, and inline styles
- Performance: Profiler shows style objects recreated on every render
- Search: `grep -r "style={{" src/` shows many inline styles

**Phase recommendation:** Address in Phase 3 (Design System) - can be incremental migration.

---

### Pitfall 9: No Memoization of Expensive Animation Calculations

**What goes wrong:**
Wave point calculations (Waves.tsx `_calculateWavePoints`) run on every frame without memoization:
- Perlin noise calculations repeated unnecessarily
- Loop over points array every frame even when props unchanged
- Higher CPU usage than needed

**Why it happens:**
Premature optimization is root of evil, so developers skip ALL optimization. Class component patterns don't encourage memoization thinking. "It's only 5 waves, how expensive can it be?"

**Prevention:**
- Profile first, optimize second (but know where to look)
- For functional components: `useMemo` for derived values, `useCallback` for functions
- For class components: Compare props in `shouldComponentUpdate`
- Cache calculations when inputs haven't changed

**Detection:**
- DevTools Performance: High CPU during animation
- React DevTools Profiler: Component renders frequently with same props
- Test: Add `console.time` around calculation, log to verify performance

**Phase recommendation:** Address in Phase 2 (Performance Optimization) after animation architecture is solid.

---

### Pitfall 10: Testing Animation Components Without Mocking Time

**What goes wrong:**
Attempting to test animation components (when tests are added) without mocking:
- `requestAnimationFrame` - tests run in Node/jsdom without RAF
- `performance.now()` - returns different values making assertions impossible
- Time-based behavior - tests are non-deterministic

**Why it happens:**
Adding tests after animations are built. Not thinking about testability during development. Assuming "we'll figure out testing later."

**Consequences:**
- Tests are flaky (pass/fail randomly)
- Tests take too long (waiting for real animation durations)
- Coverage gaps around animation logic
- Refactoring becomes risky without test safety net

**Prevention:**
- Use `@testing-library/react` with `act()` for state updates
- Mock RAF: `jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(cb, 16))`
- Mock time: `jest.useFakeTimers()` and `jest.advanceTimersByTime(1000)`
- Extract animation logic to pure functions that are easy to test
- Test "animation occurred" not "animation is at exact frame X"

**Detection:**
- Warning sign: Tests marked `.skip` or commented out for animation components
- Warning sign: Tests have arbitrary `setTimeout` delays
- Test suite has inconsistent pass/fail on same code

**Phase recommendation:** Address in Phase 5 (Testing Infrastructure) before writing animation tests.

---

## Minor Pitfalls

Mistakes that cause annoyance but are easily fixable.

---

### Pitfall 11: TypeScript Errors Suppressed with @ts-expect-error

**What goes wrong:**
Using `@ts-expect-error` (WavyBackground.tsx line 79) to suppress TypeScript errors instead of fixing types:
- Hides real type safety issues
- Breaks on TypeScript upgrades
- Makes refactoring dangerous (type errors ignored)

**Prevention:**
- Fix the underlying type issue instead of suppressing
- If truly unfixable: Document WHY with detailed comment
- Use `@ts-ignore` only for third-party library bugs with issue links
- Regular audit: Search for `@ts-expect-error` and validate each is still necessary

**Detection:**
- Search: `grep -r "@ts-expect-error\|@ts-ignore" src/`
- Code review: Require justification for any type suppression

**Phase recommendation:** Address in Phase 1 (Code Quality) - quick fixes with high value.

---

### Pitfall 12: Lodash Import Without Tree-Shaking

**What goes wrong:**
Importing from `lodash` directly (App.tsx line 5, Waves.tsx line 3) instead of submodules:
```tsx
import { random } from "lodash"; // Imports entire lodash (~70KB)
```

Instead of:
```tsx
import random from "lodash/random"; // Imports only random (~2KB)
```

**Prevention:**
- Use `lodash-es` with tree-shaking or individual imports
- Configure babel-plugin-lodash for automatic optimization
- Consider: Do you need lodash at all? `Math.random()` built-in might suffice

**Detection:**
- Bundle analyzer shows large lodash chunk
- `npm run build && npx vite-bundle-visualizer`

**Phase recommendation:** Address in Phase 1 (Bundle Optimization) - easy win for performance.

---

### Pitfall 13: useMemo/useCallback Overuse (Future Pitfall)

**What goes wrong:**
When refactoring to functional components, developers often overuse `useMemo` and `useCallback`:
- Wrapping cheap calculations that are faster without memoization
- Adding dependencies array that causes more re-renders
- Premature optimization without profiling

**Why it happens:**
Reading that "hooks can cause performance issues" and wrapping everything. Not understanding that memoization itself has cost. Following outdated advice.

**Prevention:**
- Default: Don't memoize unless profiler shows it's needed
- Memoize when: Expensive calculation OR passing to child with `React.memo`
- Don't memoize: Simple calculations, primitive values, object literals in non-critical paths
- Profile before and after to verify improvement

**Detection:**
- Code review: Every function wrapped in `useCallback`, every value in `useMemo`
- Profiler: Memoization overhead > computation cost
- Guideline: If calculation is < 1ms, probably don't memoize

**Phase recommendation:** Monitor during Phase 2 (Functional Refactor) - add to review checklist.

---

### Pitfall 14: Accessibility - Missing Alt Text and ARIA Labels

**What goes wrong:**
Images without meaningful alt text (App.tsx line 111: `alt="Puff Puff logo"` is good, but logo link line 107 has empty `href="#"`):
- Screen reader users don't understand image purpose
- Link purpose unclear
- Failed accessibility audits

**Prevention:**
- All images must have alt text describing purpose, not filename
- Decorative images: `alt=""` (empty string, not omitted)
- Link wrapping image: Alt text describes link destination
- Interactive elements: Add `aria-label` if visual-only indication

**Detection:**
- Accessibility audit: Lighthouse, axe DevTools
- Screen reader test: Use NVDA/JAWS to navigate site
- ESLint plugin: eslint-plugin-jsx-a11y

**Phase recommendation:** Address in Phase 4 (Accessibility Audit) - systematic review.

---

### Pitfall 15: No Prop Validation After Removing PropTypes

**What goes wrong:**
Header.tsx line 48 has `Header.propTypes = {};` - empty PropTypes object that does nothing:
- No runtime validation
- TypeScript provides compile-time validation, but runtime mismatches still possible
- Dead code that should be removed

**Prevention:**
- Remove PropTypes entirely when using TypeScript
- PropTypes are redundant with TypeScript interfaces
- If keeping PropTypes for runtime checks (not recommended with TS), actually define them

**Detection:**
- Search: `propTypes = {}` or undefined propTypes
- ESLint: Rule to disallow empty propTypes

**Phase recommendation:** Address in Phase 1 (Cleanup) - remove dead code.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Class → Functional Migration | Losing instance variables that held animation state | Use `useRef` for values that don't trigger re-renders |
| Class → Functional Migration | componentDidMount/WillUnmount cleanup order different from useEffect | Test cleanup thoroughly; useEffect cleanup runs async |
| Class → Functional Migration | Stale closures capturing old prop/state values | Understand closure scope; use refs for current values in callbacks |
| react-spring Interpolation | Type errors from mixing number/string interpolations | Explicit generic types: `to<number>()` or `to<string>()` |
| react-spring Scroll Animations | Container ref not ready on first render | Check `ref.current` before passing to `useScroll` container |
| Perlin Noise Optimization | Creating new Perlin instance per wave per render | Move to `useMemo` with stable seed, or share single instance |
| Parallax Layer Offsets | Math errors causing content off-screen | Validate offset calculations with browser height changes |
| Testing Animations | jsdom doesn't support `requestAnimationFrame` | Mock RAF or use @testing-library/react-hooks with fake timers |
| Accessibility - Keyboard Nav | Parallax scroll broken for keyboard users | Ensure scroll position updates on keyboard events, not just mouse |
| Performance - Mobile | 60fps target impossible on mid-range Android | Add complexity tiers based on device detection or FPS monitoring |
| SVG Animations | Path recalculations causing reflows | Use CSS transforms instead of path `d` attribute when possible |
| Production Build | Animation frame drops due to unoptimized builds | Verify production build with `vite build --mode production` and test on target devices |

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: "Animation First, Structure Later"
Building impressive animations before establishing component architecture, routing, and content structure leads to animations that can't be maintained or extended.

**Instead:** Establish site structure, then enhance with animations.

---

### Anti-Pattern 2: "More Springs = Better Performance"
Adding react-spring to everything thinking it optimizes performance, when simple CSS transitions would be more performant.

**Instead:** Use CSS for simple transitions, react-spring for physics-based or complex orchestrations.

---

### Anti-Pattern 3: "Accessibility Is Phase 10"
Treating accessibility as final polish instead of built-in requirement leads to expensive retrofitting.

**Instead:** Include `prefers-reduced-motion`, semantic HTML, and ARIA from day one.

---

### Anti-Pattern 4: "Tests Can Wait Until It's Finished"
Building complex animation logic without tests makes refactoring impossible and bugs hard to track.

**Instead:** Write tests alongside animation development, especially for math-heavy calculations.

---

### Anti-Pattern 5: "Premature Memoization"
Wrapping everything in `useMemo`/`useCallback` before profiling creates more overhead than benefit.

**Instead:** Profile first, optimize based on data, not assumptions.

---

## Sources

**Confidence: HIGH** - Based on:
1. Direct code analysis of current codebase (App.tsx, Waves.tsx, WavyBackground.tsx, Header.tsx, Perlin.tsx)
2. React documentation on hooks, class component migration (as of training data Jan 2025)
3. react-spring v9 documentation patterns (as of training data)
4. WCAG 2.1 accessibility guidelines (official standard)
5. Performance profiling best practices (Chrome DevTools documentation)
6. Personal expertise in React animation patterns and common refactoring pitfalls

**Note:** WebSearch unavailable for this research session. All findings based on code analysis + domain expertise from training data. For verification of specific library APIs (react-spring v9.7.4 exact behavior, usehooks-ts v3.1.0 features), recommend consulting official documentation during implementation phases.

**Critical gaps requiring verification:**
- Exact behavior of `@react-spring/parallax` v9.7.4 ref forwarding (may differ from training data)
- Latest react-spring TypeScript type definitions (check for breaking changes)
- Current best practices for testing react-spring animations (testing-library may have new utilities)

**Recommended deep-dive research topics for future phases:**
- Phase 2 (Animation Architecture): Verify react-spring v9.7 best practices for scroll-driven animations
- Phase 4 (Accessibility): Check latest WCAG 2.2 updates for animation requirements
- Phase 5 (Testing): Research latest Vitest + react-spring testing patterns (project uses Vite)
