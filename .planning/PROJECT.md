# Puff Puff Dev Portfolio

## What This Is

A portfolio/landing page for Puff Puff Dev, a Flutter mobile development consultancy. The site showcases the brand through animated wave backgrounds using Perlin noise and parallax scrolling, conveying creativity and technical expertise to potential clients.

## Core Value

Visitors experience a polished, professional site that demonstrates technical craft through smooth animations while clearly communicating Puff Puff Dev's services and value proposition.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Animated wave background with Perlin noise — existing
- ✓ Parallax scrolling with multiple layers — existing
- ✓ Header navigation bar with Pure CSS menu — existing
- ✓ Hero section with brand logo and tagline — existing
- ✓ About section with company description — existing
- ✓ GitHub Pages deployment pipeline — existing

### Active

<!-- Current scope. Building toward these. -->

**Code Quality:**
- [ ] Refactor Wave class component to functional component with hooks
- [ ] Remove all console.log statements from production code
- [ ] Remove dead/commented-out code throughout codebase
- [ ] Fix TypeScript issues (replace @ts-expect-error with proper types)
- [ ] Replace lodash dependency with native Math.random()

**Navigation:**
- [ ] Implement smooth scroll-to-section navigation
- [ ] Add active state highlighting for current section
- [ ] Create mobile hamburger menu with slide-out drawer

**Testing:**
- [ ] Set up Vitest testing framework
- [ ] Unit tests for Perlin noise algorithm
- [ ] Unit tests for Wave point calculation
- [ ] Component smoke tests for App, Header, WavyBackground

**Responsive Design:**
- [ ] Mobile-first responsive typography
- [ ] Touch-friendly tap targets (min 44px)
- [ ] Responsive wave animation parameters

**Accessibility:**
- [ ] Add ARIA labels to navigation
- [ ] Implement keyboard navigation
- [ ] Ensure sufficient color contrast
- [ ] Add skip-to-content link

**Visual Polish:**
- [ ] Add loading states for async content
- [ ] Implement smooth page transitions
- [ ] Add micro-interactions on hover/focus

**Performance:**
- [ ] Cache Perlin noise calculations
- [ ] Remove unused PureCSS (or use fully)
- [ ] Optimize bundle size (remove lodash)
- [ ] Add lazy loading for below-fold content
- [ ] Achieve Lighthouse performance score 90+

### Out of Scope

- Multi-page routing with React Router — single-page scroll is sufficient for portfolio
- Backend/CMS integration — static content is appropriate for this use case
- Contact form with email integration — defer to future milestone
- Blog/content section — not needed for initial launch
- Dark mode toggle — single theme is sufficient
- Quote rotation feature (currently disabled) — remove rather than fix

## Context

**Existing Codebase:**
- React 18 with TypeScript, Vite build
- react-spring for animations (parallax, interpolations)
- Custom Perlin noise implementation for organic wave movement
- PureCSS framework (minimally used, mainly header menu)
- Deployed to GitHub Pages via gh-pages package

**Known Issues (from CONCERNS.md):**
- Wave.tsx is class component in functional codebase
- No error handling for external API calls
- Zero test coverage
- Performance bottleneck: Perlin recalculated every frame
- Navigation links non-functional (point to #)

**Brand Context:**
- Puff Puff Dev is a Flutter mobile development consultancy
- Target audience: businesses seeking mobile app development
- Brand positioning: creative, technical, craft-focused

## Constraints

- **Tech stack**: React + TypeScript + Vite (no migration)
- **Hosting**: GitHub Pages (static only)
- **Browser support**: Modern browsers (ES2020+, no polyfills)
- **Accessibility**: WCAG 2.1 AA compliance target

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Scroll-to-section vs routing | Portfolio is single-page by nature, routing adds complexity | — Pending |
| Vitest over Jest | Vite-native, faster, better DX | — Pending |
| Remove lodash entirely | Only used for random(), native Math.random() sufficient | — Pending |
| Remove vs fix Quotes component | Feature is disabled and not core to portfolio value | — Pending |

---
*Last updated: 2026-02-02 after initialization*
