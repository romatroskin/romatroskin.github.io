# Phase 5: Performance & Animation - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Achieve Core Web Vitals compliance (Lighthouse 90+, LCP <2.5s, INP <200ms, CLS <0.1) with optimized wave animations across devices. Users with prefers-reduced-motion get appropriate accommodations. Adding new features or capabilities is out of scope.

</domain>

<decisions>
## Implementation Decisions

### Reduced motion behavior
- Use subtle drift (5-10x slower animation speed) instead of static or hidden waves
- Respect system preference only — no manual animation toggle needed
- Keep interface simple by relying on OS-level accessibility settings

### Mobile/low-power fallbacks
- Dynamic adaptation: start with full animation, auto-detect lag, progressively simplify
- Show subtle indicator when performance mode is active (user should know)
- Graceful degradation rather than hard cutoffs

### Loading experience
- Animated loader using simplified wave preview (teaser for the full experience)
- Transition via wave expansion — loader waves transform into full wave background
- Cohesive brand experience from first paint to interactive

### Performance budget priorities
- Animation smoothness is the #1 priority — 60fps waves are the brand
- Bundle size budget: under 400KB JS (reasonable room for animation libs)
- Willing to trade initial load time for smooth runtime experience

### Claude's Discretion
- Parallax effects behavior under reduced motion
- UI micro-interaction timing with reduced motion
- Minimum acceptable animation state before static fallback
- Performance indicator placement (footer, toast, etc.)
- Timeout threshold for loading fallback message
- Web Worker usage for Perlin noise (based on profiling)
- Lazy loading strategy for below-fold content

</decisions>

<specifics>
## Specific Ideas

- "60fps waves are the brand" — animation quality defines the portfolio's impression
- Wave preview loader that expands into full background creates continuity
- Dynamic adaptation means the site works everywhere, not just on powerful devices
- Subtle indicator respects users by acknowledging their device constraints

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-performance-animation*
*Context gathered: 2026-02-03*
