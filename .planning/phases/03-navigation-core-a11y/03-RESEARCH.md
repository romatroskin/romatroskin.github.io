# Phase 3: Navigation & Core A11Y - Research

**Researched:** 2026-02-03
**Domain:** Web accessibility (WCAG 2.1), React navigation patterns, keyboard navigation, ARIA
**Confidence:** HIGH

## Summary

This phase implements accessible navigation with keyboard support, screen reader compatibility, and mobile menu functionality. The research reveals a mature ecosystem with well-established patterns:

**Core approach:** Use native HTML5 semantic elements (`<nav>`, `<main>`, `<header>`) combined with ARIA attributes where needed, Intersection Observer API for scroll spy, programmatic focus management with focus-trap-react for modals/menus, and CSS `scroll-behavior` with JavaScript fallbacks for smooth scrolling.

**Key insight:** Modern React accessibility relies on native HTML semantics first, ARIA attributes second. The "First Rule of ARIA" states: if you can use a native HTML element with the semantics and behavior you require already built in, instead of re-purposing an element and adding an ARIA role, do so.

**Primary recommendation:** Build accessible-first using semantic HTML, add keyboard navigation with focus trapping for mobile menu, implement Intersection Observer-based scroll spy for active states, and ensure WCAG 2.1 Level AA compliance for focus indicators (3:1 contrast ratio).

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Intersection Observer API | Native | Scroll spy / active state detection | Native browser API, performant, widely supported (97%+), replaces expensive scroll listeners |
| focus-trap-react | 11.x | Focus management in modal/menu | Official focus-trap wrapper, handles Tab/Shift+Tab cycling, React 18+ compatible, TypeScript support |
| Native CSS + ARIA | Built-in | Semantic landmarks and roles | WCAG 2.1 standard, screen reader compatible, no dependencies |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| usehooks-ts | 3.1.0 | useMediaQuery hook | Already in project - use for prefers-reduced-motion detection |
| body-scroll-lock | 4.x | Prevent background scroll | Mobile menu - handles iOS Safari issues, cross-platform |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| focus-trap-react | react-focus-lock | focus-lock has more features but heavier; focus-trap simpler and sufficient |
| Intersection Observer | Scroll event listeners | Events are less performant, harder to debounce correctly, more complex logic |
| body-scroll-lock | Custom CSS overflow:hidden | Custom solution fails on iOS Safari, doesn't handle edge cases |

**Installation:**
```bash
npm install focus-trap-react body-scroll-lock
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── Header/
│   │   ├── Header.tsx           # Desktop header (existing)
│   │   ├── Header.module.css    # Desktop styles (existing)
│   │   ├── MobileMenu.tsx       # NEW: Mobile hamburger menu
│   │   └── MobileMenu.module.css
│   └── SkipLink/
│       ├── SkipLink.tsx         # NEW: Skip to content link
│       └── SkipLink.module.css
├── hooks/
│   ├── useScrollSpy.ts          # NEW: Intersection Observer hook
│   └── useScrollSpy.test.ts
└── App.tsx                      # Update with landmarks
```

### Pattern 1: Semantic Landmarks with HTML5

**What:** Use native HTML5 semantic elements to define page structure
**When to use:** Every page - this is the foundation of accessible navigation
**Example:**
```tsx
// App.tsx structure
<>
  <SkipLink href="#main-content" />
  <Header component="header" role="banner" />
  <main id="main-content" role="main">
    <Parallax>
      <section aria-labelledby="hero-heading">
        <h1 id="hero-heading">Hero Title</h1>
      </section>
      <section aria-labelledby="services-heading">
        <h2 id="services-heading">Services</h2>
      </section>
      <section aria-labelledby="about-heading">
        <h2 id="about-heading">About</h2>
      </section>
    </Parallax>
  </main>
</>
```

**Key points:**
- Use `<header>`, `<nav>`, `<main>`, `<section>` for structure
- All page content except skip link must be within landmarks
- Add `aria-labelledby` to sections for screen reader context
- Single `<h1>` per page, then `<h2>` for sections (no skipping levels descending)

### Pattern 2: Intersection Observer for Scroll Spy

**What:** Detect which section is currently visible using Intersection Observer
**When to use:** For active navigation state highlighting
**Example:**
```typescript
// hooks/useScrollSpy.ts
import { useState, useEffect, useRef } from 'react';

export function useScrollSpy(sectionIds: string[], options?: IntersectionObserverInit) {
  const [activeId, setActiveId] = useState<string>('');
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const observerOptions = {
      rootMargin: '-10% 0px -85% 0px', // Trigger when section is 10% from top
      threshold: [0, 0.25, 0.5, 0.75, 1],
      ...options,
    };

    observer.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    }, observerOptions);

    // Observe all sections
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.current?.observe(element);
    });

    return () => observer.current?.disconnect();
  }, [sectionIds, options]);

  return activeId;
}
```

**rootMargin best practice:** Use negative margins to create a "trigger line" in viewport. `-10% 0px -85% 0px` means section becomes active when it's 10% from top of viewport. Sum should equal -100% or less to avoid multiple sections being active.

**threshold best practice:** Use array with multiple values but not too many (max 5-7) to avoid excessive callback calls. [0, 0.25, 0.5, 0.75, 1] provides good granularity.

### Pattern 3: Focus Trap for Mobile Menu

**What:** Trap keyboard focus inside mobile menu when open
**When to use:** Any modal or overlay that should contain focus
**Example:**
```tsx
// components/Header/MobileMenu.tsx
import FocusTrap from 'focus-trap-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (isOpen) {
      disableBodyScroll(document.body);
    } else {
      enableBodyScroll(document.body);
    }
    return () => clearAllBodyScrollLocks();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <FocusTrap
      focusTrapOptions={{
        onDeactivate: onClose,
        escapeDeactivates: true,
        clickOutsideDeactivates: true,
        initialFocus: '#close-menu-button',
      }}
    >
      <div className={styles.overlay} onClick={onClose}>
        <nav className={styles.menu} onClick={(e) => e.stopPropagation()}>
          <button id="close-menu-button" onClick={onClose} aria-label="Close menu">
            ✕
          </button>
          {/* Menu items */}
        </nav>
      </div>
    </FocusTrap>
  );
}
```

**Key FocusTrap options:**
- `escapeDeactivates: true` - Pressing Escape closes menu (required for WCAG 2.1.1)
- `clickOutsideDeactivates: true` - Click backdrop to close
- `initialFocus` - Set focus to close button on open (best practice: focus on a close/cancel action)
- `returnFocusOnDeactivate: true` (default) - Returns focus to trigger button when closed

### Pattern 4: Smooth Scroll Navigation

**What:** Smooth scroll to sections when clicking nav links
**When to use:** Internal page navigation links
**Example:**
```tsx
// Using react-spring Parallax ref
const handleNavClick = (page: number) => {
  parallaxRef.current?.scrollTo(page);
};

// For non-parallax or fallback
const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  element?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
};
```

**Why not CSS `scroll-behavior: smooth`?**
- Cannot control timing/easing
- Applies to all scrolls (including Find on page - annoying)
- Less control over which interactions are smooth

**Best practice:** Use JavaScript-triggered smooth scrolling for specific user interactions only.

### Pattern 5: aria-current for Active Navigation

**What:** Indicate current page/section to screen readers
**When to use:** Active navigation links
**Example:**
```tsx
<nav aria-label="Main navigation">
  <ul>
    {navItems.map((item) => (
      <li key={item.id}>
        <a
          href="#"
          onClick={(e) => handleNavClick(e, item.page)}
          aria-current={currentPage === item.page ? 'page' : undefined}
          className={currentPage === item.page ? styles.active : ''}
        >
          {item.label}
        </a>
      </li>
    ))}
  </ul>
</nav>
```

**aria-current values:**
- `"page"` - Current page in set of pages
- `"step"` - Current step in process
- `"location"` - Current location in flow
- `"true"` - Current item in set (generic)

For single-page navigation, `"page"` is most appropriate even though it's technically one page with sections.

### Pattern 6: Skip Link

**What:** First focusable element that jumps to main content
**When to use:** Every page (WCAG 2.4.1 Level A best practice)
**Example:**
```tsx
// components/SkipLink/SkipLink.tsx
function SkipLink({ href }: { href: string }) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.setAttribute('tabindex', '-1');
      (target as HTMLElement).focus();
      target.removeAttribute('tabindex');
    }
  };

  return (
    <a href={href} onClick={handleClick} className={styles.skipLink}>
      Skip to main content
    </a>
  );
}
```

```css
/* SkipLink.module.css */
.skipLink {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 9999;
}

.skipLink:focus {
  top: 0;
}
```

**Why set tabindex temporarily?**
- Not all elements are naturally focusable (like `<main>`)
- Setting `tabindex="-1"` makes it programmatically focusable
- Remove after focus to avoid polluting tab order

### Anti-Patterns to Avoid

**1. Double Semantics**
- ❌ `<nav role="navigation">` - Redundant, nav already has navigation role
- ✅ `<nav>` - Native element is sufficient

**2. Hiding Focus Indicators**
```css
/* ❌ NEVER do this */
*:focus {
  outline: none;
}
```
Removing focus indicators violates WCAG 2.4.7. If you don't like default browser focus, style it - don't remove it.

**3. Using onClick Without Keyboard Support**
```tsx
// ❌ Not keyboard accessible
<div onClick={handleClick}>Click me</div>

// ✅ Keyboard accessible
<button onClick={handleClick}>Click me</button>
```

**4. Skipping Heading Levels Downward**
```tsx
// ❌ Confuses screen readers
<h1>Page Title</h1>
<h3>Section Title</h3> // Skipped h2

// ✅ Proper hierarchy
<h1>Page Title</h1>
<h2>Section Title</h2>
```

**5. Only Visual Active States**
```tsx
// ❌ Screen readers don't know which is active
<a className={isActive ? 'active' : ''}>Home</a>

// ✅ Screen readers know
<a
  aria-current={isActive ? 'page' : undefined}
  className={isActive ? 'active' : ''}
>
  Home
</a>
```

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Focus trapping | Custom Tab key listener | focus-trap-react | Edge cases: Shift+Tab backwards, dynamically added elements, tabbable vs focusable, iframe handling |
| Body scroll lock | `overflow: hidden` on body | body-scroll-lock | iOS Safari ignores overflow on body, touch events propagate, position:fixed shifting, scroll position restoration |
| Scroll spy | Scroll event listener with offsetTop | Intersection Observer API | Performance: no layout thrashing, automatic threshold calculations, no debouncing needed, passive observation |
| Focus visible detection | :focus + manual classes | :focus-visible CSS | Browser-native, handles mouse vs keyboard, matches user expectations, automatic heuristics |
| Smooth scrolling | Custom requestAnimationFrame loop | element.scrollIntoView({behavior:'smooth'}) or react-spring Parallax scrollTo | Respects prefers-reduced-motion, handles interrupts, consistent easing |

**Key insight:** Accessibility edge cases are far more complex than they appear. Screen readers, different input methods (keyboard, touch, voice), browser quirks, and assistive technologies create scenarios impossible to anticipate. Use battle-tested libraries.

**Example of hidden complexity in focus trapping:**
- Must handle Shift+Tab to go backwards
- Radio buttons in group should be treated as single tab stop with arrow keys
- Shadow DOM boundaries
- Iframes within trap
- Elements that become focusable dynamically
- contenteditable regions
- SVG focusable elements
- Browser extensions modifying DOM

focus-trap-react handles all of this. Don't hand-roll it.

## Common Pitfalls

### Pitfall 1: Forgetting prefers-reduced-motion

**What goes wrong:** Smooth scrolling and animations trigger vestibular disorders (dizziness, nausea, migraines)

**Why it happens:** Developers test on default systems without motion sensitivity settings enabled

**How to avoid:**
```css
/* Respect user preference */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Also handle in JavaScript:
```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scrollToPage = (page: number) => {
  if (prefersReducedMotion) {
    // Instant scroll
    parallaxRef.current?.container?.current?.scrollTo({
      top: page * window.innerHeight,
      behavior: 'auto',
    });
  } else {
    // Smooth scroll
    parallaxRef.current?.scrollTo(page);
  }
};
```

**Warning signs:**
- Users report feeling "sick" or "dizzy" using site
- No media query for prefers-reduced-motion
- All animations are forced regardless of user settings

### Pitfall 2: Focus Trap Without Escape Hatch

**What goes wrong:** User opens mobile menu, cannot close it with Escape key, gets stuck in focus trap

**Why it happens:** Forgetting to configure `escapeDeactivates: true` in focus-trap options

**How to avoid:**
```tsx
<FocusTrap
  focusTrapOptions={{
    escapeDeactivates: true,  // REQUIRED: Escape key closes
    clickOutsideDeactivates: true, // Click backdrop closes
    onDeactivate: onClose,
  }}
>
  {/* Menu content */}
</FocusTrap>
```

Also ensure visual close button:
```tsx
<button onClick={onClose} aria-label="Close menu">
  <span aria-hidden="true">✕</span>
</button>
```

**Warning signs:**
- WCAG 2.1.1 Keyboard failure (no Escape to close)
- Users report "can't get out of menu"
- Tab cycling works but no way to dismiss

### Pitfall 3: Missing Focus Visible Styles

**What goes wrong:** Keyboard users can't see where focus is, get lost navigating

**Why it happens:** Custom styles remove outline, forget to add visible focus indicators

**How to avoid:**
```css
/* ❌ NEVER do this without replacement */
*:focus {
  outline: none;
}

/* ✅ Always provide visible focus */
button:focus-visible,
a:focus-visible {
  outline: 2px solid #535bf2;
  outline-offset: 2px;
  /* WCAG 2.1 requirement: 3:1 contrast against adjacent colors */
}
```

**WCAG requirements:**
- Focus indicator must have 3:1 contrast ratio against adjacent colors (WCAG 2.1 SC 1.4.11)
- Must be visible when component receives focus (WCAG 2.1 SC 2.4.7)
- WCAG 2.2 adds: must be at least 2px thick perimeter (SC 2.4.13)

**Warning signs:**
- Pressing Tab shows no visual change
- Can't tell which element has focus
- axe DevTools reports "Elements must have sufficient color contrast"

### Pitfall 4: Incorrect Heading Hierarchy

**What goes wrong:** Screen reader users jump between headings (h1, h2, h3) to navigate - broken hierarchy means they miss content or get confused

**Why it happens:** Choosing heading levels for visual size instead of semantic structure

**How to avoid:**
```tsx
// ✅ Correct hierarchy
<h1>Page Title</h1>
<section>
  <h2>Section 1</h2>
  <h3>Subsection 1.1</h3>
  <h3>Subsection 1.2</h3>
</section>
<section>
  <h2>Section 2</h2> {/* OK to skip back up */}
</section>

// ❌ Incorrect - skips level
<h1>Page Title</h1>
<h3>Section</h3> {/* Skipped h2 - confusing */}
```

Use CSS for visual sizing:
```css
h2 {
  font-size: 1.2rem; /* Visual size independent of semantic level */
}
```

**Warning signs:**
- Skipping from h1 to h3 (only going down - going back up is OK)
- Using headings for visual effect not semantic structure
- axe DevTools reports "Heading levels should only increase by one"

### Pitfall 5: Parallax Container Breaks Scroll Events

**What goes wrong:** react-spring Parallax creates its own scroll container, so listening to window scroll events doesn't work

**Why it happens:** Assuming page scrolling uses window scroll when it actually uses container scroll

**How to avoid:**
```tsx
// ❌ Won't work - listening to wrong element
useEffect(() => {
  const handleScroll = () => {
    console.log(window.scrollY); // Always 0
  };
  window.addEventListener('scroll', handleScroll);
}, []);

// ✅ Listen to Parallax container
useEffect(() => {
  const container = parallaxRef.current?.container?.current;
  if (!container) return;

  const handleScroll = () => {
    console.log(container.scrollTop); // Correct value
  };
  container.addEventListener('scroll', handleScroll, { passive: true });
  return () => container.removeEventListener('scroll', handleScroll);
}, []);
```

**Warning signs:**
- Scroll events never fire
- window.scrollY is always 0
- Intersection Observer doesn't trigger (need to set root option)

### Pitfall 6: Body Scroll Lock Fails on iOS

**What goes wrong:** Setting `overflow: hidden` on body doesn't prevent scrolling on iOS Safari - background still scrolls behind menu

**Why it happens:** iOS Safari ignores overflow on body element, touch events propagate

**How to avoid:**
Use body-scroll-lock library:
```tsx
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

useEffect(() => {
  if (isMenuOpen) {
    disableBodyScroll(document.body);
  } else {
    enableBodyScroll(document.body);
  }
  return () => clearAllBodyScrollLocks();
}, [isMenuOpen]);
```

Don't use CSS-only solution:
```css
/* ❌ Fails on iOS */
body.menu-open {
  overflow: hidden;
}
```

**Warning signs:**
- Works on desktop, fails on iPhone
- Touch scrolling moves background behind menu
- Users report "weird scrolling behavior"

## Code Examples

Verified patterns from official sources and research:

### Focus Indicator (WCAG 2.1 Compliant)
```css
/* Source: W3C WCAG 2.1 SC 1.4.11 and SC 2.4.7 */
:focus-visible {
  outline: 2px solid #535bf2;
  outline-offset: 2px;
}

/* Ensure 3:1 contrast against adjacent colors */
button:focus-visible {
  outline-color: hsl(235, 85%, 60%);
  /* 3:1 against dark blue background */
}

/* WCAG 2.2 enhanced - 2px thick perimeter */
.nav-link:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  :focus-visible {
    transition: none;
  }
}
```

### Intersection Observer Scroll Spy Hook
```typescript
// Source: MDN + multiple dev.to articles
import { useState, useEffect, useRef } from 'react';

export function useScrollSpy(
  sectionIds: string[],
  options?: IntersectionObserverInit
) {
  const [activeId, setActiveId] = useState<string>('');
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Create trigger line 10% from top of viewport
    const observerOptions: IntersectionObserverInit = {
      rootMargin: '-10% 0px -85% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1],
      ...options,
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      // Find the entry with highest intersection ratio
      const intersecting = entries.filter((entry) => entry.isIntersecting);
      if (intersecting.length > 0) {
        // Sort by intersection ratio descending
        intersecting.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        setActiveId(intersecting[0].target.id);
      }
    };

    observer.current = new IntersectionObserver(handleIntersect, observerOptions);

    // Observe all sections
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.current?.observe(element);
      }
    });

    return () => {
      observer.current?.disconnect();
    };
  }, [sectionIds]);

  return activeId;
}
```

### Mobile Menu with Focus Trap
```tsx
// Source: focus-trap-react GitHub + LogRocket
import { useEffect } from 'react';
import FocusTrap from 'focus-trap-react';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import styles from './MobileMenu.module.css';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function MobileMenu({ isOpen, onClose, children }: MobileMenuProps) {
  // Prevent body scroll when menu open
  useEffect(() => {
    const target = document.body;
    if (isOpen) {
      disableBodyScroll(target);
    } else {
      enableBodyScroll(target);
    }
    return () => clearAllBodyScrollLocks();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <FocusTrap
      focusTrapOptions={{
        escapeDeactivates: true,
        clickOutsideDeactivates: true,
        onDeactivate: onClose,
        initialFocus: '#mobile-menu-close',
        returnFocusOnDeactivate: true,
      }}
    >
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true">
        <nav
          className={styles.menu}
          onClick={(e) => e.stopPropagation()}
          aria-label="Mobile navigation"
        >
          <button
            id="mobile-menu-close"
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close menu"
          >
            <span aria-hidden="true">✕</span>
          </button>
          {children}
        </nav>
      </div>
    </FocusTrap>
  );
}
```

### Skip Link Component
```tsx
// Source: W3C WAI + multiple accessibility blogs
import styles from './SkipLink.module.css';

interface SkipLinkProps {
  href: string;
  children?: React.ReactNode;
}

export function SkipLink({ href, children = 'Skip to main content' }: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      // Make target focusable if it's not naturally focusable
      target.setAttribute('tabindex', '-1');
      (target as HTMLElement).focus();
      // Remove tabindex after focus to avoid polluting tab order
      target.removeAttribute('tabindex');
    }
  };

  return (
    <a href={href} onClick={handleClick} className={styles.skipLink}>
      {children}
    </a>
  );
}
```

```css
/* SkipLink.module.css */
.skipLink {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px 16px;
  text-decoration: none;
  z-index: 9999;
  font-size: 14px;
  line-height: 1.5;
}

.skipLink:focus {
  top: 0;
}

/* Ensure sufficient contrast for WCAG 2.1 SC 1.4.3 */
.skipLink:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}
```

### Accessible Navigation with ARIA
```tsx
// Source: React docs + W3C ARIA
<header role="banner">
  <nav aria-label="Main navigation">
    <ul role="list">
      {navItems.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection(item.id);
            }}
            aria-current={activeSection === item.id ? 'page' : undefined}
            className={activeSection === item.id ? styles.active : ''}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  </nav>
</header>
```

### Smooth Scroll with prefers-reduced-motion
```tsx
// Source: MDN + CSS-Tricks
import { useMediaQuery } from 'usehooks-ts';

function useScrollToSection(parallaxRef: React.RefObject<IParallax>) {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const scrollToPage = (page: number) => {
    if (prefersReducedMotion) {
      // Instant scroll for users with motion sensitivity
      const container = parallaxRef.current?.container?.current;
      if (container) {
        container.scrollTo({
          top: page * container.clientHeight,
          behavior: 'auto',
        });
      }
    } else {
      // Smooth animated scroll
      parallaxRef.current?.scrollTo(page);
    }
  };

  return scrollToPage;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Scroll event listeners for scroll spy | Intersection Observer API | 2016+ (97% support) | Massive performance gains, no debouncing needed, declarative |
| Custom Tab key handlers for focus trapping | focus-trap library | 2015+ | Handles all edge cases developers miss (Shift+Tab, dynamic elements, etc) |
| overflow:hidden for scroll lock | body-scroll-lock or similar | 2017+ | Actually works on iOS Safari, handles position:fixed shift |
| :focus for all focus styling | :focus-visible | 2020+ (94% support) | Mouse clicks don't show focus ring, keyboard nav does - better UX |
| role="navigation" on div | &lt;nav&gt; semantic element | HTML5 (2014) | Cleaner markup, native semantics, no ARIA needed |
| Manual ARIA for landmarks | Native HTML5 elements first | WCAG 2.1 (2018) | "First Rule of ARIA" - use native when possible |

**Deprecated/outdated:**
- **jQuery smooth scroll plugins**: Use native `scrollIntoView({behavior:'smooth'})` or react-spring
- **scroll event + offsetTop calculations**: Use Intersection Observer API
- **PropTypes for focus-trap-react**: Removed in v10+, TypeScript types only
- **Adding role="navigation" to `<nav>`**: Redundant, native `<nav>` already has the role
- **:focus for focus indicators**: Use `:focus-visible` to avoid showing on mouse clicks
- **Custom keyboard event handlers for accessibility**: Use semantic HTML (button, not div+onClick)

## Open Questions

Things that couldn't be fully resolved:

1. **Intersection Observer with Parallax Container**
   - What we know: react-spring Parallax creates its own scroll container
   - What's unclear: Whether Intersection Observer needs `root` option set to container, or if it auto-detects
   - Recommendation: Test both approaches - likely need to pass `root: parallaxRef.current?.container?.current` to observer options

2. **Active State Between Sections**
   - What we know: When scrolling between sections, briefly no section is "active"
   - What's unclear: Should we keep previous section active until next triggers, or show no active state?
   - Recommendation: Keep previous active until next section hits trigger line (better UX, prevents flickering)

3. **Mobile Menu Slide Direction**
   - What we know: Slide-in menus can come from left, right, top, or bottom
   - What's unclear: Best practice for accessibility - does direction matter for screen readers?
   - Recommendation: Direction doesn't affect accessibility (handled by ARIA/focus trap), choose based on design preference

4. **Focus Trap and React 18 Strict Mode**
   - What we know: focus-trap-react v9.0.2+ added React 18 Strict Mode support
   - What's unclear: Whether there are any remaining double-mount issues
   - Recommendation: Current version (11.x) should work fine, but test in development strict mode

## Sources

### Primary (HIGH confidence)
- [GitHub: focus-trap/focus-trap-react](https://github.com/focus-trap/focus-trap-react) - Installation, API, TypeScript support
- [W3C: Understanding Success Criterion 1.4.3: Contrast (Minimum)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) - WCAG contrast requirements
- [React Spring: Parallax Component](https://react-spring.dev/docs/components/parallax) - Parallax API and scrollTo method
- [MDN: Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) - Observer options, rootMargin, threshold
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) - Motion sensitivity support (updated Jan 2026)
- [W3C: WAI ARIA landmarks](https://a11y-guidelines.orange.com/en/articles/landmarks/) - Semantic structure best practices
- [MDN: aria-current attribute](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current) - Active navigation states

### Secondary (MEDIUM confidence)
- [React Accessibility Documentation](https://legacy.reactjs.org/docs/accessibility.html) - React-specific ARIA patterns
- [freeCodeCamp: Keyboard Accessibility for Complex React](https://www.freecodecamp.org/news/designing-keyboard-accessibility-for-complex-react-experiences/) - Focus management patterns
- [LogRocket: Build accessible modal with focus-trap-react](https://blog.logrocket.com/build-accessible-modal-focus-trap-react/) - Focus trap implementation
- [body-scroll-lock npm package](https://www.npmjs.com/package/body-scroll-lock) - iOS scroll lock solution
- [WebAIM: Semantic Structure](https://webaim.org/techniques/semanticstructure/) - Heading hierarchy and landmarks
- [W3C WCAG: Headings Tutorial](https://www.w3.org/WAI/tutorials/page-structure/headings/) - Heading best practices
- [TPGi: When Is a Skip Link Needed?](https://www.tpgi.com/when-is-a-skip-link-needed/) - Skip link implementation
- [Maxime Heckel: Scrollspy demystified](https://blog.maximeheckel.com/posts/scrollspy-demystified/) - Intersection Observer scroll spy
- [CSS-Tricks: Downsides of Smooth Scrolling](https://css-tricks.com/downsides-of-smooth-scrolling/) - Smooth scroll considerations
- [W3C: C39: Using prefers-reduced-motion](https://www.w3.org/WAI/WCAG21/Techniques/css/C39) - Motion sensitivity technique

### Tertiary (LOW confidence)
- Multiple blog posts and Stack Overflow discussions about Intersection Observer rootMargin calculations
- Community discussions about focus-trap-react and React 18 Strict Mode compatibility
- Various tutorials on implementing scroll spy with different threshold values

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** - All recommendations based on official docs, native APIs, or industry-standard libraries with 97%+ support
- Architecture: **HIGH** - Patterns verified through W3C WCAG documentation, React official docs, and library maintainer guidance
- Pitfalls: **MEDIUM-HIGH** - Based on common issues found across multiple sources and personal research findings

**Research date:** 2026-02-03
**Valid until:** ~60 days (stable domain - WCAG 2.1 won't change, libraries are mature)

**Key recommendations requiring verification:**
1. Intersection Observer `root` option with react-spring Parallax container - test both with/without explicit root
2. Active state "between sections" behavior - test user experience with both approaches
3. body-scroll-lock compatibility with React 18 - verify no hydration or strict mode issues
