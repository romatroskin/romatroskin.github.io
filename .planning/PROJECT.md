# Puff Puff Dev Portfolio

## What This Is

A production-ready portfolio/landing page for Puff Puff Dev, a Flutter mobile development consultancy. The site showcases the brand through animated wave backgrounds using Perlin noise and parallax scrolling, with full accessibility support, dark/light theming, and optimized performance. Built with React 18, TypeScript, and Vite.

## Core Value

Visitors experience a polished, professional site that demonstrates technical craft through smooth animations while clearly communicating Puff Puff Dev's services and value proposition.

## Requirements

### Validated

- ✓ Animated wave background with Perlin noise — existing
- ✓ Parallax scrolling with multiple layers — existing
- ✓ Hero section with brand logo and tagline — existing
- ✓ About section with company description — existing
- ✓ GitHub Pages deployment pipeline — existing
- ✓ Wave class component refactored to functional with hooks — v1.0
- ✓ Console.log statements removed from production code — v1.0
- ✓ Dead/commented-out code removed — v1.0
- ✓ TypeScript issues fixed (proper types) — v1.0
- ✓ Lodash dependency replaced with native Math.random() — v1.0
- ✓ Random values stabilized (no regeneration on render) — v1.0
- ✓ Error Boundaries for graceful failure handling — v1.0
- ✓ Smooth scroll-to-section navigation — v1.0
- ✓ Active state highlighting for current section — v1.0
- ✓ Mobile hamburger menu with slide-out drawer — v1.0
- ✓ ARIA labels on navigation and interactive elements — v1.0
- ✓ Keyboard navigation (Tab order, Enter/Space) — v1.0
- ✓ Skip-to-content link — v1.0
- ✓ Visible focus indicators on interactive elements — v1.0
- ✓ Semantic HTML landmarks (nav, main, section) — v1.0
- ✓ Alt text for logo and images — v1.0
- ✓ Proper heading hierarchy — v1.0
- ✓ Reduced motion support (@media prefers-reduced-motion) — v1.0
- ✓ HTML lang attribute — v1.0
- ✓ Color contrast ratio >= 4.5:1 (15:1+ achieved) — v1.0
- ✓ Mobile-first responsive typography — v1.0
- ✓ Touch-friendly tap targets (min 44x44px) — v1.0
- ✓ Content reflow at 320px without horizontal scroll — v1.0
- ✓ Responsive wave animation parameters — v1.0
- ✓ Responsive images with srcset — v1.0
- ✓ Vitest testing framework — v1.0
- ✓ Unit tests for Perlin noise algorithm — v1.0
- ✓ Unit tests for Wave point calculation — v1.0
- ✓ Component smoke tests for App, Header, WavyBackground — v1.0
- ✓ Accessibility tests with vitest-axe — v1.0
- ✓ Perlin noise memoization — v1.0
- ✓ PureCSS removed (CSS Modules for Header) — v1.0
- ✓ Bundle size optimized (lodash removed) — v1.0
- ✓ Lazy loading for below-fold content — v1.0
- ✓ Lighthouse performance score 90+ — v1.0
- ✓ LCP < 2.5s — v1.0
- ✓ INP < 200ms — v1.0
- ✓ CLS < 0.1 — v1.0
- ✓ Smooth page/section transitions — v1.0
- ✓ Micro-interactions on hover/focus states — v1.0
- ✓ Dark/Light mode toggle with prefers-color-scheme — v1.0
- ✓ Print stylesheet — v1.0

### Active

**v1.1 — Optimization & Polish**

SEO:
- [ ] Meta tags (title, description, keywords)
- [ ] Open Graph images for social sharing
- [ ] Structured data (JSON-LD schema)
- [ ] Sitemap generation
- [ ] robots.txt configuration

Architecture:
- [ ] Directory reorganization (components/, hooks/, utils/)
- [ ] Code splitting optimization
- [ ] Dependency cleanup (remove unused, update outdated)

Performance:
- [ ] Lighthouse 100 across all categories

Content:
- [ ] Portfolio/Case studies section
- [ ] Contact section (static, no backend form)
- [ ] Copy polish and refinements

Design:
- [ ] Visual refinements (spacing, typography)
- [ ] Design polish and consistency

### Out of Scope

- Multi-page routing with React Router — single-page scroll is sufficient for portfolio
- Backend/CMS integration — static content is appropriate for this use case
- Contact form with email backend — v1.1 adds static contact section, form integration deferred
- Blog/content section — not needed for initial launch
- Quote rotation feature — removed rather than fixed
- Advanced animations beyond waves — current parallax sufficient
- React 19 / Vite 7 migration — future tech upgrade phase
- Scroll progress indicator (REQ-NAV-004) — deferred, low priority
- CSS Modules migration completion (REQ-CQ-008) — partially complete, global CSS remains intentionally

## Context

**Current State (v1.0 shipped):**
- 3,274 lines of TypeScript
- 99 tests passing
- React 18 + TypeScript + Vite build
- react-spring for animations (parallax, interpolations)
- Custom Perlin noise with memoization (1000-entry cache)
- CSS Modules for component styling
- Deployed to GitHub Pages via gh-pages package

**Architecture Highlights:**
- Functional Wave component with useAnimationFrame and usePerlinNoise hooks
- Web Vitals monitoring (LCP, INP, CLS, FCP, TTFB)
- Long Animation Frames API monitoring for INP debugging
- Adaptive frame rate (15/24/30 fps based on device capability)
- Layered error boundaries with gradient fallback for wave errors
- localStorage abstraction with in-memory fallback

**Brand Context:**
- Puff Puff Dev is a Flutter mobile development consultancy
- Target audience: businesses seeking mobile app development
- Brand positioning: creative, technical, craft-focused

## Constraints

- **Tech stack**: React + TypeScript + Vite (no migration)
- **Hosting**: GitHub Pages (static only)
- **Browser support**: Modern browsers (ES2020+, no polyfills)
- **Accessibility**: WCAG 2.1 AA compliance achieved

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Scroll-to-section vs routing | Portfolio is single-page by nature, routing adds complexity | ✓ Good - works well with Parallax |
| Vitest over Jest | Vite-native, faster, better DX | ✓ Good - 99 tests run in <2s |
| Remove lodash entirely | Only used for random(), native Math.random() sufficient | ✓ Good - reduced bundle |
| Remove vs fix Quotes component | Feature is disabled and not core to portfolio value | ✓ Good - removed dead code |
| CSS Modules for component styling | Scoped styles, better maintainability | ✓ Good - no style conflicts |
| react-error-boundary library | Declarative error handling with reset functionality | ✓ Good - graceful degradation |
| Perlin cache with 1000 entry limit | Balance between performance and memory | ✓ Good - reduced CPU load |
| Adaptive frame rate (15/24/30 fps) | Smooth degradation without flickering | ✓ Good - works on low-end devices |
| Manual focus trap over focus-trap-react | Library caused silent failures | ✓ Good - reliable menu behavior |
| data-theme attribute for theming | Standard CSS pattern with system preference fallback | ✓ Good - FOUC prevented |
| Inline blocking script for FOUC | Runs before CSS loads | ✓ Good - no theme flash |
| web-vitals library for monitoring | Official Google library handles edge cases | ✓ Good - reliable metrics |
| React.lazy for below-fold only | Hero is LCP - must load immediately | ✓ Good - no LCP regression |

---
*Last updated: 2026-02-03 after v1.1 milestone started*
