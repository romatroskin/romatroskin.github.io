# Phase 10: Design Polish & Performance - Research

**Researched:** 2026-02-04
**Domain:** CSS design systems, performance optimization, Core Web Vitals, image optimization
**Confidence:** HIGH

## Summary

This phase focuses on visual consistency through CSS design tokens and performance verification through Lighthouse audits and Core Web Vitals monitoring. The research reveals that achieving 90+ Lighthouse scores and green Core Web Vitals requires coordinated attention to spacing systems, typography hierarchy, interactive state styling, image optimization, and layout stability.

The project already has strong foundations: spacing tokens (8px base in tokens.css), theme system with CSS custom properties, web-vitals library installed, and Vite with compression plugins configured. The main work involves extending the existing token system for typography, adding comprehensive focus indicators, optimizing images to WebP format with fallbacks, and verifying that CLS < 0.1 through proper dimension reservations.

**Primary recommendation:** Build on the existing token system with a modular typography scale using CSS clamp() for fluid sizing, reserve explicit dimensions for all images to prevent CLS, and implement picture elements with WebP sources and JPEG fallbacks for optimal performance.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| web-vitals | 5.1.0 (installed) | Core Web Vitals monitoring | Official Google library for measuring LCP, CLS, INP in production |
| CSS Custom Properties | Native | Design tokens | Browser-native, theme-aware, no build step required |
| CSS clamp() | Native | Fluid typography | Modern responsive sizing without media queries |
| HTML picture element | Native | Responsive images | Browser-native format selection with fallbacks |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vite-plugin-image-optimizer | Latest | WebP conversion | Build-time image optimization with Sharp.js |
| vite-plugin-webp-generator | Latest | WebP generation | Alternative plugin specifically for WebP |
| Chrome DevTools | Native | Lighthouse audits | Performance verification and debugging |
| PageSpeed Insights | Web tool | Production metrics | Real-world Core Web Vitals data |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS clamp() | Media queries | More control but more code; clamp() is more maintainable |
| picture element | JavaScript detection | More fragile; picture element is more robust |
| web-vitals library | Manual PerformanceObserver | More work; library provides attribution data |
| vite-plugin-image-optimizer | Manual Sharp.js scripts | More flexible but requires custom build process |

**Installation:**
```bash
# Image optimization plugin (recommended)
npm install --save-dev vite-plugin-image-optimizer

# Alternative WebP-specific plugin
npm install --save-dev vite-plugin-webp-generator
```

## Architecture Patterns

### Recommended Design Token Structure
```
src/styles/
├── tokens.css           # Base units (spacing, radius, transitions) - EXISTS
├── themes.css           # Color tokens (theme-aware) - EXISTS
├── typography.css       # Font size scale, line heights - EXTEND
└── utilities.css        # Helper classes - EXISTS
```

### Pattern 1: 8px Spacing System
**What:** Base-8 spacing scale using CSS custom properties
**When to use:** All spacing, padding, margin, and gap values
**Example:**
```css
/* tokens.css - ALREADY EXISTS */
:root {
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 2rem;      /* 32px */
  --space-xl: 4rem;      /* 64px */
}

/* Usage - consistent across sections */
.section-container {
  padding: var(--space-md);
  gap: var(--space-lg);
}
```

**Why this works:**
- Multiples of 8px align with device pixel densities
- Matches tap target sizes (44px = 5.5 × 8px)
- Used by Atlassian, USWDS, Carbon Design System
- Project already uses this system

### Pattern 2: Modular Typography Scale with CSS clamp()
**What:** Fluid typography that scales between min/max using clamp()
**When to use:** All heading and body text sizes for responsive behavior
**Example:**
```css
/* Source: Modern fluid typography pattern from Smashing Magazine */
:root {
  /* Heading scale - fluid between viewports */
  --font-size-h1: clamp(2rem, 5vw + 1rem, 3.5rem);      /* 32-56px */
  --font-size-h2: clamp(1.5rem, 4vw + 0.5rem, 2.5rem);  /* 24-40px */
  --font-size-h3: clamp(1.25rem, 3vw + 0.5rem, 2rem);   /* 20-32px */

  /* Body scale - subtle fluid sizing */
  --font-size-body: clamp(1rem, 2vw, 1.125rem);         /* 16-18px */
  --font-size-small: clamp(0.875rem, 1.5vw, 1rem);      /* 14-16px */

  /* Line heights */
  --line-height-tight: 1.2;   /* Headings */
  --line-height-normal: 1.5;  /* Body text */
  --line-height-relaxed: 1.8; /* Long-form content */

  /* Font weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600; /* User preference for headings */
}

h1 {
  font-size: var(--font-size-h1);
  line-height: var(--line-height-tight);
  font-weight: var(--font-weight-semibold);
}

p {
  font-size: var(--font-size-body);
  line-height: var(--line-height-normal);
}
```

**Accessibility note:** Include rem in preferred value for zoom support:
```css
/* Respects user font-size preferences */
--font-size-h1: clamp(2rem, 1rem + 4vw, 3.5rem);
```

### Pattern 3: WCAG-Compliant Focus Indicators
**What:** Visible focus states with 3:1 contrast for keyboard navigation
**When to use:** All interactive elements (buttons, links, inputs)
**Example:**
```css
/* Source: WCAG 2.4.7 Focus Visible requirements */

/* Use :focus-visible to avoid mouse click outlines */
button:focus-visible,
a:focus-visible,
input:focus-visible,
textarea:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
  border-radius: 4px; /* Soften corners */
}

/* Remove outline for mouse users */
button:focus:not(:focus-visible),
a:focus:not(:focus-visible) {
  outline: none;
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  *:focus-visible {
    transition: none;
  }
}

/* Theme tokens - ALREADY EXISTS in themes.css */
:root {
  --color-focus: #535bf2; /* 3:1 contrast on light bg */
}
[data-theme="dark"] {
  --color-focus: #7c83ff; /* 3:1 contrast on dark bg */
}
```

**WCAG Requirements Met:**
- 2.4.7 Focus Visible (Level A): Keyboard focus always visible
- 1.4.11 Non-text Contrast (Level AA): 3:1 contrast ratio
- Consistent appearance across all interactive elements

### Pattern 4: WebP Images with JPEG Fallback
**What:** HTML picture element serving WebP with JPEG fallback
**When to use:** All raster images (photos, screenshots)
**Example:**
```html
<!-- Source: WebP implementation best practices -->
<picture>
  <!-- WebP for modern browsers (26-34% smaller) -->
  <source
    srcset="image-320w.webp 320w, image-640w.webp 640w, image-1280w.webp 1280w"
    type="image/webp"
    sizes="(max-width: 768px) 100vw, 50vw"
  />

  <!-- JPEG fallback for older browsers -->
  <source
    srcset="image-320w.jpg 320w, image-640w.jpg 640w, image-1280w.jpg 1280w"
    type="image/jpeg"
    sizes="(max-width: 768px) 100vw, 50vw"
  />

  <!-- Fallback img with explicit dimensions for CLS prevention -->
  <img
    src="image-640w.jpg"
    alt="Descriptive alt text"
    width="640"
    height="480"
    loading="lazy"
  />
</picture>
```

**Vite Configuration:**
```javascript
// Source: vite-plugin-image-optimizer documentation
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
  plugins: [
    ViteImageOptimizer({
      webp: { quality: 80 },    // 80% is sweet spot for quality/size
      jpeg: { quality: 75 },     // Fallback optimization
      png: { quality: 80 }       // For graphics with transparency
    })
  ]
});
```

### Pattern 5: CLS Prevention through Dimension Reservation
**What:** Explicit width/height or aspect-ratio to prevent layout shifts
**When to use:** All images, videos, iframes, and dynamically-loaded content
**Example:**
```css
/* Source: Core Web Vitals CLS optimization guide */

/* Method 1: Explicit dimensions (recommended for static images) */
img {
  width: 640px;
  height: 480px;
  max-width: 100%;
  height: auto; /* Maintains aspect ratio */
}

/* Method 2: Modern aspect-ratio property */
.image-container {
  aspect-ratio: 16 / 9;
  width: 100%;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Method 3: Padding hack for older browsers */
.aspect-ratio-box {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 ratio */
}

.aspect-ratio-box img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

**CLS Best Practices:**
- Always specify width and height attributes in HTML
- Use CSS aspect-ratio for responsive containers
- Reserve space for ads, embeds, late-loading content
- Use skeleton loaders that match final content height
- Use CSS transform for animations (not width/height changes)

### Anti-Patterns to Avoid
- **Hard-coded sizes everywhere:** Use design tokens, not magic numbers
- **px units for typography:** Use rem for accessibility (respects user preferences)
- **Linear scaling without limits:** Use clamp() to prevent mobile/desktop extremes
- **Cascading em units:** Use rem for predictable sizing
- **Missing image dimensions:** Causes CLS when images load
- **transform: translateY() on scroll indicators without will-change:** Can cause jank

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image format detection | JavaScript UA sniffing | picture element | Browser-native, more reliable, supports multiple formats |
| Viewport-based sizing | Multiple media queries | CSS clamp() | Single declaration, smooth scaling, easier maintenance |
| Core Web Vitals tracking | Custom PerformanceObserver | web-vitals library | Includes attribution data, handles edge cases, Google-maintained |
| Image optimization | Manual Sharp.js calls | vite-plugin-image-optimizer | Automated build-time processing, preserves source files |
| Focus indicator system | Per-element styles | :focus-visible pseudo-class | Automatic keyboard vs mouse detection, reduces code |
| Theme-aware colors | JavaScript theme switching | CSS custom properties + data-theme | No JS required, instant updates, already implemented |

**Key insight:** The browser platform has matured significantly. Native CSS features (clamp, aspect-ratio, custom properties, :focus-visible) and standard HTML patterns (picture element) are more robust than custom JavaScript solutions and better for performance.

## Common Pitfalls

### Pitfall 1: Over-Splitting Code Without Measuring
**What goes wrong:** Adding lazy loading and code splitting to everything, including small components
**Why it happens:** "Code splitting is always better" assumption
**How to avoid:** Only split bundles > 30-50KB; measure before and after
**Warning signs:** More HTTP requests but no actual load time improvement

### Pitfall 2: Missing Image Dimensions Causing CLS
**What goes wrong:** Layout shifts when images load, failing CLS < 0.1 target
**Why it happens:** Developers forget width/height attributes or use CSS-only sizing
**How to avoid:** Always specify width and height in HTML, even for responsive images
**Warning signs:** Content jumps during page load; CLS score > 0.1 in Lighthouse

### Pitfall 3: Inconsistent Unit Usage Breaking Accessibility
**What goes wrong:** px for typography fights user zoom settings
**Why it happens:** Designer specs are in pixels
**How to avoid:** Use rem for all font sizes; 1rem = 16px at default settings
**Warning signs:** Text doesn't scale when user increases browser font size

### Pitfall 4: Focus Indicators That Disappear
**What goes wrong:** outline: none without replacement; keyboard navigation invisible
**Why it happens:** Designers see blue outline as "ugly"
**How to avoid:** Use :focus-visible with custom styled outline; test with Tab key
**Warning signs:** Can't see which element is focused when tabbing; WCAG violations

### Pitfall 5: Linear Typography Scaling on Small Screens
**What goes wrong:** Headings become comically large on mobile or unreadably small on desktop
**Why it happens:** Using pure vw units without min/max constraints
**How to avoid:** Use clamp() with rem min/max values
**Warning signs:** Typography that looks great at one viewport but broken at others

### Pitfall 6: Optimizing Formats But Not Implementing Fallbacks Correctly
**What goes wrong:** WebP images don't load in older browsers; no JPEG served
**Why it happens:** Missing type attribute or incorrect source order
**How to avoid:** Use picture element with type="image/webp" and type="image/jpeg"
**Warning signs:** Images missing in Safari < 14, older Android browsers

### Pitfall 7: Animating Layout-Triggering Properties
**What goes wrong:** Poor performance from animating top, left, width, height
**Why it happens:** Not knowing which CSS properties trigger reflow
**How to avoid:** Use transform and opacity for animations; add will-change hint
**Warning signs:** Janky animations; low Lighthouse performance score

### Pitfall 8: Theme Transitions Causing Flash
**What goes wrong:** Brief flash of wrong theme colors during page load
**Why it happens:** CSS custom properties update after DOM render
**How to avoid:** Set data-theme attribute before first paint (in HTML or inline script)
**Warning signs:** White flash when loading dark mode; already handled in project

## Code Examples

Verified patterns from official sources:

### Lighthouse Performance Monitoring
```javascript
// Source: Lighthouse performance scoring documentation
// Current Lighthouse 10 metric weights:
// - Total Blocking Time: 30%
// - Largest Contentful Paint: 25%
// - Cumulative Layout Shift: 25%
// - Speed Index: 10%
// - First Contentful Paint: 10%

// Target thresholds for 90+ score:
// - LCP < 2.5s (mobile), < 1.2s (desktop)
// - CLS < 0.1
// - TBT minimal (depends on JavaScript execution)
```

### Core Web Vitals Monitoring (Already Installed)
```javascript
// Source: web-vitals npm library documentation
import { onLCP, onINP, onCLS } from 'web-vitals';

// Log metrics to console in development
function sendToAnalytics({ name, value, rating, delta, id }) {
  console.log(`[${name}] ${value} (${rating})`);

  // In production, send to analytics endpoint
  if (process.env.NODE_ENV === 'production') {
    navigator.sendBeacon('/analytics', JSON.stringify({
      metric: name,
      value,
      rating,
      id
    }));
  }
}

// Monitor Core Web Vitals
onLCP(sendToAnalytics);  // Target: < 2.5s
onINP(sendToAnalytics);  // Target: < 200ms
onCLS(sendToAnalytics);  // Target: < 0.1
```

### Complete Typography Scale
```css
/* Source: Modular typography scale patterns */
:root {
  /* Typography scale - fluid sizing with clamp() */
  --font-size-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);     /* 12-14px */
  --font-size-sm: clamp(0.875rem, 0.8rem + 0.4vw, 1rem);         /* 14-16px */
  --font-size-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);       /* 16-18px */
  --font-size-md: clamp(1.125rem, 1rem + 0.6vw, 1.25rem);        /* 18-20px */
  --font-size-lg: clamp(1.25rem, 1rem + 1vw, 1.5rem);            /* 20-24px */
  --font-size-xl: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);           /* 24-32px */
  --font-size-2xl: clamp(1.875rem, 1.5rem + 2vw, 2.5rem);        /* 30-40px */
  --font-size-3xl: clamp(2.25rem, 1.75rem + 2.5vw, 3rem);        /* 36-48px */
  --font-size-4xl: clamp(2.5rem, 2rem + 3vw, 3.5rem);            /* 40-56px */

  /* Line heights for different contexts */
  --line-height-none: 1;
  --line-height-tight: 1.2;    /* Headings */
  --line-height-snug: 1.375;   /* Short paragraphs */
  --line-height-normal: 1.5;   /* Body text */
  --line-height-relaxed: 1.625;
  --line-height-loose: 2;      /* Very spacious reading */

  /* Font weights */
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;  /* User preference */
  --font-weight-bold: 700;
}

/* Apply to heading hierarchy */
h1 {
  font-size: var(--font-size-4xl);
  line-height: var(--line-height-tight);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-lg);
}

h2 {
  font-size: var(--font-size-2xl);
  line-height: var(--line-height-tight);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-md);
}

h3 {
  font-size: var(--font-size-xl);
  line-height: var(--line-height-snug);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-sm);
}

body {
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  font-weight: var(--font-weight-normal);
}
```

### Interactive State Styling
```css
/* Source: WCAG accessibility best practices and performance guidelines */

/* Base interactive element styling */
.button,
button,
a[href] {
  /* Base state */
  position: relative;
  transition: transform var(--transition-fast),
              box-shadow var(--transition-fast),
              background-color var(--transition-fast),
              border-color var(--transition-fast);

  /* Minimum touch target size */
  min-height: 44px;
  min-width: 44px;
}

/* Hover state - pointer devices only */
@media (hover: hover) and (pointer: fine) {
  .button:hover,
  button:hover,
  a[href]:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-color: var(--color-accent);
  }
}

/* Focus state - keyboard navigation */
.button:focus-visible,
button:focus-visible,
a[href]:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Active state - click/tap */
.button:active,
button:active,
a[href]:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Disabled state */
button:disabled,
.button[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  .button,
  button,
  a[href] {
    transition: none;
  }

  .button:hover,
  button:hover,
  a[href]:hover {
    transform: none;
  }
}
```

### Comprehensive Image Optimization
```html
<!-- Source: WebP best practices with responsive images -->

<!-- Logo - use SVG (already done in project) -->
<img src="/logo.svg" alt="Puff Puff Dev" width="200" height="200" />

<!-- Raster images - WebP with JPEG fallback -->
<picture>
  <!-- WebP sources with responsive sizes -->
  <source
    type="image/webp"
    srcset="
      /images/project-320w.webp 320w,
      /images/project-640w.webp 640w,
      /images/project-1280w.webp 1280w,
      /images/project-1920w.webp 1920w
    "
    sizes="(max-width: 640px) 100vw,
           (max-width: 1024px) 50vw,
           640px"
  />

  <!-- JPEG fallback with same sizes -->
  <source
    type="image/jpeg"
    srcset="
      /images/project-320w.jpg 320w,
      /images/project-640w.jpg 640w,
      /images/project-1280w.jpg 1280w,
      /images/project-1920w.jpg 1920w
    "
    sizes="(max-width: 640px) 100vw,
           (max-width: 1024px) 50vw,
           640px"
  />

  <!-- Fallback img with dimensions for CLS prevention -->
  <img
    src="/images/project-640w.jpg"
    alt="Project screenshot"
    width="640"
    height="480"
    loading="lazy"
    decoding="async"
  />
</picture>
```

### CLS-Safe Layout Patterns
```css
/* Source: Cumulative Layout Shift prevention techniques */

/* Hero image - prevent shift with aspect ratio */
.hero-image-container {
  aspect-ratio: 16 / 9;
  width: 100%;
  overflow: hidden;
}

.hero-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Skeleton loader - matches final content height */
.skeleton-card {
  min-height: 300px; /* Match actual card height */
  background: linear-gradient(
    90deg,
    var(--color-bg-secondary) 25%,
    var(--color-bg-primary) 50%,
    var(--color-bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Transform animations - no layout shift */
.scroll-indicator {
  /* Good - uses transform (compositor-only) */
  transition: transform var(--transition-fast);
}

.scroll-indicator:hover {
  transform: translateY(4px); /* Already implemented in project */
}

/* Avoid animating these properties (trigger reflow) */
.bad-animation {
  /* BAD - triggers layout recalculation */
  /* transition: top 0.3s, height 0.3s, margin 0.3s; */

  /* GOOD - compositor-only properties */
  transition: transform 0.3s, opacity 0.3s;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| First Input Delay (FID) | Interaction to Next Paint (INP) | March 2024 | More comprehensive responsiveness metric |
| Media queries for responsive type | CSS clamp() | 2020-2021 | Single declaration, smooth scaling |
| JavaScript image format detection | picture element | Widely supported 2020+ | Native, more reliable |
| px for everything | rem for typography, px for borders | Ongoing | Better accessibility |
| Fixed font sizes | Fluid typography with clamp() | 2022+ | Responsive without breakpoints |
| Sass/LESS variables | CSS custom properties | Widely adopted 2018+ | Theme-aware, no build step |
| aspect-ratio padding hacks | CSS aspect-ratio property | 2021+ | Simpler, more readable |
| :focus styling | :focus-visible | Widely supported 2021+ | Better UX (no outline on click) |

**Deprecated/outdated:**
- FID (First Input Delay): Replaced by INP in Core Web Vitals (March 2024)
- Time to Interactive (TTI): Removed from Lighthouse 10 performance scoring (was 10% weight in Lighthouse 8)
- viewport-percentage lengths without fallback: Modern clamp() is more robust
- JavaScript-based theme switching: CSS custom properties handle this natively

## Open Questions

Things that couldn't be fully resolved:

1. **Current production Core Web Vitals baseline**
   - What we know: Targets are LCP < 2.5s, CLS < 0.1; web-vitals library installed
   - What's unclear: Current production values before optimization
   - Recommendation: Run Lighthouse audit on production site first; establish baseline metrics

2. **Existing images requiring optimization**
   - What we know: 7 PNG images in /public (favicons, logo, og-image)
   - What's unclear: Whether hero/content images exist that need WebP conversion
   - Recommendation: Audit public/ and src/ for all raster images > 10KB; prioritize LCP element optimization

3. **Typography scale preferences beyond semibold headings**
   - What we know: User wants semibold (600) for headings; some clamp() already used in App.css
   - What's unclear: Specific size preferences for H1/H2/H3, whether to standardize existing clamp() values
   - Recommendation: Extract existing clamp() values, propose unified scale based on current usage

4. **Lazy loading strategy for sections**
   - What we know: Project uses @react-spring/parallax; sections are already in DOM
   - What's unclear: Whether to lazy load Contact section (page 4) or keep eager loading
   - Recommendation: Measure current bundle size; only lazy load if ContactSection + deps > 30KB

5. **Image optimization quality settings**
   - What we know: WebP quality 80% is recommended; JPEG fallback quality 75%
   - What's unclear: User's preference for quality vs size tradeoff
   - Recommendation: Start with recommended defaults; A/B test if quality concerns arise

## Sources

### Primary (HIGH confidence)
- [Chrome DevTools - Lighthouse Performance Scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring) - Metric weights and thresholds verified
- [Google Search Central - Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals) - Official LCP, INP, CLS targets
- [W3C WCAG 2.2 - Focus Visible (2.4.7)](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) - Focus indicator requirements
- [web.dev - Cumulative Layout Shift](https://web.dev/articles/cls) - CLS definition and optimization
- [web.dev - Optimize CLS](https://web.dev/articles/optimize-cls) - CLS prevention techniques

### Secondary (MEDIUM confidence - verified with official sources)
- [U.S. Web Design System - Spacing Units](https://designsystem.digital.gov/design-tokens/spacing-units/) - 8px base system rationale
- [Smashing Magazine - Modern Fluid Typography Using CSS Clamp](https://www.smashingmagazine.com/2022/01/modern-fluid-typography-css-clamp/) - clamp() patterns and accessibility
- [Modern CSS Solutions - Generating Font-Size CSS Rules](https://moderncss.dev/generating-font-size-css-rules-and-creating-a-fluid-type-scale/) - Typography scale implementation
- [Sara Soueidan - WCAG-Compliant Focus Indicators](https://www.sarasoueidan.com/blog/focus-indicators/) - Focus state design patterns
- [Google Developers - WebP FAQ](https://developers.google.com/speed/webp/faq) - WebP compression data
- [GitHub - GoogleChrome/web-vitals](https://github.com/GoogleChrome/web-vitals) - Library usage patterns
- [vite-plugin-image-optimizer](https://www.npmjs.com/package/vite-plugin-image-optimizer) - Vite image optimization

### Tertiary (LOW confidence - WebSearch only, marked for validation)
- [WPDeveloper - Google Lighthouse Guide 2026](https://wpdeveloper.com/google-lighthouse-how-to-achieve-highest-score/) - Optimization strategies overview
- [DebugBear - Lighthouse Performance Scoring](https://www.debugbear.com/docs/metrics/lighthouse-performance) - Metric breakdown and targets
- [NitroPack - Core Web Vitals 2026](https://nitropack.io/blog/most-important-core-web-vitals-metrics/) - Current state of metrics
- [Medium - Spacing Guide from Design Tokens](https://iknowdavehouse.medium.com/the-spacing-is-all-wrong-f5b7d165ae66) - Common spacing mistakes
- [Useful Angle - Using WebP with Fallback](https://usefulangle.com/post/114/webp-image-in-html-with-fallback) - picture element implementation
- [LogRocket - Fluid vs Responsive Typography](https://blog.logrocket.com/fluid-vs-responsive-typography-css-clamp/) - clamp() use cases

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Google libraries, native browser features, verified documentation
- Architecture: HIGH - CSS custom properties and design tokens already implemented in project
- Pitfalls: HIGH - Based on official WCAG requirements, Core Web Vitals specifications, and verified performance patterns
- Image optimization: MEDIUM - Vite plugin options verified but user hasn't selected specific plugin yet
- Typography scale: MEDIUM - clamp() patterns verified but specific scale values are recommendations

**Research date:** 2026-02-04
**Valid until:** 2026-03-04 (30 days - stable domain, but Lighthouse scoring can change)

**Project-specific notes:**
- Project already has excellent foundations: spacing tokens, theme system, web-vitals installed
- Vite already configured with compression plugins (Brotli + Gzip)
- Focus indicators partially implemented but need :focus-visible upgrade
- No image optimization plugin installed yet
- Typography uses some clamp() but not systematically applied across hierarchy
