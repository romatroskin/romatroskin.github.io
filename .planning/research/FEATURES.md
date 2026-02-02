# Feature Landscape: Professional Portfolio Sites

**Domain:** Professional portfolio website (single-page consultancy)
**Researched:** 2026-02-03
**Confidence:** MEDIUM (based on training knowledge as of January 2025, external verification tools unavailable)

## Table Stakes

Features users expect. Missing = product feels incomplete or unprofessional.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Keyboard Navigation** | WCAG 2.1 AA requirement, 10-15% of users | Low | Tab order, focus indicators, skip links |
| **Focus Indicators** | WCAG 2.1 AA requirement (2.4.7) | Low | Visible outline on all interactive elements |
| **Semantic HTML** | Screen readers, SEO, accessibility | Low | nav, main, section, article, headings hierarchy |
| **Color Contrast (4.5:1)** | WCAG 2.1 AA requirement (1.4.3) | Low | Text vs background, currently dark theme needs verification |
| **Mobile Menu** | 60%+ traffic is mobile | Medium | Hamburger menu, slide-out or dropdown |
| **Functional Navigation** | Users expect to jump to sections | Medium | Scroll-to-section with smooth scroll |
| **Responsive Images** | Performance, mobile bandwidth | Low | srcset, picture element, lazy loading |
| **Touch Targets (44x44px)** | WCAG 2.1 AA requirement (2.5.5) | Low | Mobile usability, fat finger problem |
| **Loading States** | User feedback during interactions | Medium | Skeleton screens, spinners, progressive loading |
| **Alt Text for Images** | WCAG 2.1 AA requirement (1.1.1) | Low | Screen readers, SEO, broken image fallback |
| **Readable Font Sizes** | Mobile usability, accessibility | Low | Min 16px body text, scalable with viewport |
| **Core Web Vitals Compliance** | SEO ranking factor, UX expectation | Medium-High | LCP < 2.5s, FID < 100ms, CLS < 0.1 |

## Differentiators

Features that set portfolio apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Scroll Progress Indicator** | Shows user where they are in journey | Low | Subtle bar or percentage indicator |
| **Micro-interactions** | Delightful hover states, transitions | Medium | Button animations, card flips, parallax effects (already present) |
| **Dark/Light Mode Toggle** | User preference, reduces eye strain | Medium | Respect prefers-color-scheme, persist choice |
| **Reduced Motion Support** | WCAG AAA, vestibular disorders | Low | @media (prefers-reduced-motion: reduce) |
| **Skip to Content Link** | Power users, screen reader users | Low | Hidden until focused, jumps past nav |
| **Active Section Highlighting** | Nav shows current section as user scrolls | Medium | Intersection Observer API |
| **Form Validation Patterns** | If contact form present | Medium | Inline validation, accessible error messages |
| **Print Stylesheet** | Some users want hard copy portfolio | Low | Hide nav, adjust colors, optimize layout |
| **Performance Budget UI** | Shows site is fast (subtle badge) | Low | "Loads in <1s" or similar trust signal |
| **ARIA Live Regions** | Dynamic content announcements | Medium | For SPAs with content changes |

## Anti-Features

Features to explicitly NOT build. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Auto-playing Audio/Video** | WCAG violation (1.4.2), user hostility | User-initiated play only, with controls |
| **Captcha on Contact Form** | Accessibility barrier, honeypot is better | Honeypot field + rate limiting |
| **Fixed Header on Mobile** | Wastes 10-15% of viewport height | Sticky header on desktop only, or hide-on-scroll |
| **Parallax Overload** | Motion sickness, performance issues | Subtle parallax only (current waves are good) |
| **Infinite Scroll** | Accessibility issues, no footer access | Pagination or "Load More" button |
| **Modal Popups** | Keyboard trap if not implemented correctly | Use native dialog element with proper focus management |
| **PDF Resume Download** | Not accessible, poor mobile UX | HTML resume view with optional PDF |
| **Splash Screen/Intro Animation** | Delays access to content, high bounce rate | Direct to content, optional animations after |
| **Carousels** | Low engagement, accessibility nightmare | Static hero or manual navigation only |
| **"Compatible with Chrome Only"** | Excludes 30%+ of users | Progressive enhancement, test cross-browser |

## Feature Dependencies

```
Foundation Layer (must come first):
- Semantic HTML structure
- Responsive layout (mobile-first)
- Color contrast fixes
  ↓
Navigation Layer:
- Mobile menu implementation
- Functional scroll-to-section
- Focus indicators
  ↓
Accessibility Layer:
- Keyboard navigation
- Skip links
- ARIA labels where needed
- Alt text for images
  ↓
Performance Layer:
- Image optimization
- Lazy loading
- Core Web Vitals tuning
  ↓
Enhancement Layer:
- Micro-interactions
- Scroll progress
- Active section highlighting
- Dark/light mode toggle
```

## Current State Analysis

**What's working:**
- Responsive breakpoints present (768px, 1024px, 600px, 48em, 78em)
- Dark theme with color variables
- Wave animations (good micro-interaction)
- Mobile-friendly padding and sizing

**Critical gaps (table stakes missing):**
- Navigation links are non-functional (all href="#")
- No mobile menu (desktop nav likely breaks on mobile)
- No keyboard focus indicators (commented out)
- No skip link for screen readers
- No ARIA labels or semantic landmarks
- Unknown color contrast ratios (needs verification)
- No loading states for page transitions
- Touch targets not verified (44x44px minimum)

**Performance unknowns:**
- Wave animation performance on low-end devices
- Image optimization strategy
- Bundle size and code splitting
- LCP timing with parallax effects

## WCAG 2.1 Level AA Requirements Summary

Based on training knowledge (needs verification with official WCAG docs):

**Perceivable:**
- 1.1.1: Non-text content has alt text
- 1.4.3: Contrast ratio minimum 4.5:1 (normal text) or 3:1 (large text)
- 1.4.10: Reflow content at 320px without horizontal scroll
- 1.4.11: Non-text contrast 3:1 for UI components

**Operable:**
- 2.1.1: All functionality available from keyboard
- 2.1.2: No keyboard trap
- 2.4.3: Focus order is logical
- 2.4.7: Focus indicator is visible
- 2.5.5: Target size at least 44x44 CSS pixels

**Understandable:**
- 3.1.1: Page language is identified (html lang attribute)
- 3.2.3: Consistent navigation
- 3.3.1: Error identification
- 3.3.2: Labels or instructions for input

**Robust:**
- 4.1.2: Name, role, value for UI components
- 4.1.3: Status messages can be determined programmatically

## Core Web Vitals Targets (2026)

Based on training knowledge (current as of early 2025):

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5s - 4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | < 200ms | 200ms - 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 |

**Note:** INP replaced FID (First Input Delay) in March 2024 as the official Core Web Vitals metric.

**Portfolio-specific concerns:**
- **LCP risk:** Wave animations may delay LCP if they block rendering
- **INP risk:** Heavy scroll animations could delay interaction response
- **CLS risk:** Dynamic wave heights and parallax transforms must reserve space

## Responsive Design Patterns

**Mobile-First Breakpoints (Industry Standard):**
```css
/* Base styles: 320px+ (mobile) */

@media (min-width: 480px) {
  /* Large mobile */
}

@media (min-width: 768px) {
  /* Tablet */
}

@media (min-width: 1024px) {
  /* Desktop */
}

@media (min-width: 1280px) {
  /* Large desktop */
}
```

**Current implementation uses:**
- 600px (small mobile)
- 768px (48em = 768px at 16px base)
- 1024px
- 1248px (78em = 1248px at 16px base)

These are reasonable but not perfectly aligned with modern standards.

**Touch-Friendly Patterns:**
- Minimum touch target: 44x44px (WCAG 2.1 AA)
- Comfortable spacing: 8px between targets
- Mobile menu: Slide-out drawer or dropdown accordion
- Avoid hover-only interactions

**Content Patterns:**
- Single column on mobile (<768px)
- Two column on tablet (768px-1024px)
- Three+ column on desktop (>1024px)
- Fluid typography: clamp() or calc() for smooth scaling

## Navigation Patterns

**Scroll-to-Section Best Practices:**
```javascript
// Smooth scroll with offset for fixed header
element.scrollIntoView({
  behavior: 'smooth',
  block: 'start'
});

// Or with offset calculation
window.scrollTo({
  top: element.offsetTop - headerHeight,
  behavior: 'smooth'
});

// Update URL without page jump
history.pushState(null, '', '#section-name');
```

**Mobile Menu Patterns:**
1. **Hamburger + Slide-out** (most common)
   - Icon: ☰ (hamburger)
   - Drawer from left or right
   - Overlay dims content

2. **Hamburger + Full-screen Overlay** (modern)
   - Full-height menu overlay
   - Large, readable links
   - Easy to dismiss

3. **Bottom Tab Bar** (app-like)
   - Fixed at bottom
   - 3-5 main sections
   - Icon + label

**Recommended for this project:** Hamburger + slide-out (classic, accessible, expected)

**Active Section Highlighting:**
```javascript
// Intersection Observer approach
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Update nav to show this section is active
      updateActiveLink(entry.target.id);
    }
  });
}, {
  rootMargin: '-50% 0px -50% 0px' // Middle of viewport
});

sections.forEach(section => observer.observe(section));
```

## Loading States & Micro-interactions

**Loading State Patterns:**
1. **Skeleton Screens** (preferred for content)
   - Gray placeholder boxes matching layout
   - Subtle shimmer animation
   - Better perceived performance than spinners

2. **Spinners** (for actions)
   - Button loading states
   - Form submissions
   - Include ARIA live region

3. **Progressive Loading**
   - Load above-the-fold first
   - Lazy load images below fold
   - Defer non-critical JS

**Micro-interaction Principles:**
```css
/* Smooth, purposeful animations */
transition: transform 200ms ease-out;

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus states with motion */
button:focus-visible {
  transform: scale(1.05);
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
```

**Current micro-interactions (wave animations):**
- Good: Subtle, not distracting
- Risk: Performance on low-end devices
- Missing: Reduced motion fallback

## MVP Recommendation

For professional portfolio milestone, prioritize:

**Phase 1: Foundation (Table Stakes)**
1. Fix navigation functionality (scroll-to-section)
2. Implement mobile menu
3. Add keyboard focus indicators
4. Verify/fix color contrast
5. Add semantic HTML landmarks and ARIA labels
6. Ensure 44x44px touch targets

**Phase 2: Accessibility Polish**
1. Skip to content link
2. Alt text for logo
3. Proper heading hierarchy
4. Reduced motion support
5. Keyboard trap testing

**Phase 3: Performance**
1. Measure Core Web Vitals baseline
2. Optimize wave animation performance
3. Lazy load images
4. Add loading states if needed

**Phase 4: Enhancement (Differentiators)**
1. Scroll progress indicator
2. Active section highlighting in nav
3. Dark/light mode toggle (already has dark mode)
4. Polish micro-interactions

**Defer to post-MVP:**
- Contact form (if needed, requires backend)
- Print stylesheet (nice-to-have)
- Advanced animations beyond current waves
- Blog/case studies section (content-dependent)

## Sources & Confidence Notes

**HIGH confidence (well-established standards):**
- WCAG 2.1 AA requirements (official W3C standard)
- Core Web Vitals metrics (official Google standard)
- Mobile-first responsive design principles
- Semantic HTML patterns

**MEDIUM confidence (training knowledge, needs verification):**
- Specific WCAG 2.1 AA criterion numbers
- INP metric transition from FID (occurred March 2024)
- Current best practices as of 2026

**LOW confidence (requires verification):**
- Exact Core Web Vitals targets for 2026 (may have changed)
- Latest accessibility testing tools and techniques
- Current browser support for specific features

**Verification needed:**
- Official WCAG 2.1 documentation for criterion references
- Google's Web Vitals documentation for current targets
- MDN Web Docs for latest browser support
- Current portfolio website trends and patterns

**Note:** External research tools (WebSearch, WebFetch) were unavailable during this research. All findings are based on training knowledge current as of January 2025. For production implementation, verify all standards and metrics with official sources.
