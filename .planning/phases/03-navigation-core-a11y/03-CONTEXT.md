# Phase 3: Navigation & Core A11Y - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Users navigate the portfolio via scroll, keyboard, and mobile menu with proper accessibility support. This phase covers navigation mechanics and core accessibility (landmarks, skip link, focus management). Visual design, color contrast, and theming belong in Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Scroll Behavior
- URL hash: Keep URL clean — no hash fragments when scrolling or clicking nav
- Scroll feel, active trigger threshold, and interrupt behavior: Claude's discretion

### Mobile Menu
- Backdrop: Blur effect behind menu when open
- Close behavior: Tapping backdrop or pressing Escape closes menu
- Menu style (slide direction) and scroll lock: Claude's discretion

### Focus Indicators
- All focus styling decisions: Claude's discretion
- Must ensure WCAG compliance and appropriate contrast

### Active State Styling
- All active state styling decisions: Claude's discretion
- Must be visually clear which section is current

### Claude's Discretion
- Smooth scroll duration and easing
- Scroll-spy threshold for active state
- Scroll interrupt behavior
- Mobile menu slide direction
- Scroll lock when menu is open
- Focus ring style (custom vs browser)
- Focus-visible vs always-show
- Focus ring color
- Focus trap in mobile menu
- Active item indicator style
- Active state animation/transition
- Mobile menu active state
- Between-sections handling

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User trusts Claude to make appropriate UX decisions within accessibility best practices.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-navigation-core-a11y*
*Context gathered: 2026-02-03*
