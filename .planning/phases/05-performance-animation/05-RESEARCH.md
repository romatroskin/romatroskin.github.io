# Phase 5: Performance & Animation - Research

**Researched:** 2026-02-03
**Domain:** Web Performance Optimization, Core Web Vitals, Animation Performance
**Confidence:** MEDIUM

## Summary

This phase focuses on achieving Core Web Vitals compliance (Lighthouse 90+, LCP <2.5s, INP <200ms, CLS <0.1) while maintaining smooth 60fps wave animations across devices. The research identifies that wave animations already use requestAnimationFrame with 30fps throttling, react-spring for scroll animations, and Perlin noise calculations that may benefit from optimization.

Key findings indicate that Core Web Vitals monitoring should use the `web-vitals` npm library (v5.x), INP monitoring benefits from the new Long Animation Frames API (shipped Chrome 123), and `prefers-reduced-motion` should use subtle slow animations (5-10x slower) rather than complete removal per user decisions. Performance adaptation should use PerformanceObserver to detect frame rate issues and progressively simplify animations.

**Primary recommendation:** Implement web-vitals monitoring first to establish baseline metrics, then optimize based on actual measurements rather than assumptions. The existing animation architecture is solid - focus on measurement, memoization, and adaptive degradation.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| web-vitals | 5.x | Monitor LCP, INP, CLS in field | Official Google library, 2KB, field measurement |
| @react-spring/web | 9.7.4 | Animation library (already installed) | GPU-accelerated, spring physics, widely adopted |
| vite | 5.4.1+ | Build tool (already installed) | Built-in code splitting, tree shaking, fast builds |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| stats.js | Latest | Visual FPS monitor during development | Debugging animation performance issues |
| rollup-plugin-visualizer | 6.0.5+ (installed) | Bundle size analysis | Already configured, use for code splitting insights |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| web-vitals | Manual PerformanceObserver | web-vitals handles edge cases, buffering, browser differences |
| stats.js | Custom FPS counter | stats.js proven, simple, visual - custom adds maintenance |
| Long Animation Frames API | Long Tasks API | LoAF shipped Chrome 123, more detailed, better for INP |

**Installation:**
```bash
npm install web-vitals
npm install --save-dev stats.js  # Optional, for development
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── performance/
│   ├── vitals.ts           # Web Vitals monitoring setup
│   ├── adaptivePerf.ts     # Frame rate detection & adaptation
│   └── reducedMotion.ts    # Reduced motion hook
├── hooks/
│   ├── useAnimationFrame.ts (exists)
│   ├── usePerlinNoise.ts   (exists)
│   └── usePrefersReducedMotion.ts (new)
└── components/
    └── PerformanceIndicator.tsx (new, for low-power mode)
```

### Pattern 1: Web Vitals Monitoring
**What:** Field measurement of Core Web Vitals (LCP, INP, CLS)
**When to use:** Production and development for baseline metrics
**Example:**
```typescript
// Source: https://github.com/GoogleChrome/web-vitals
import { onLCP, onINP, onCLS } from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify(metric);
  // Use sendBeacon if available, falling back to fetch
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/analytics', body);
  } else {
    fetch('/analytics', { body, method: 'POST', keepalive: true });
  }
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
```

### Pattern 2: Prefers Reduced Motion (React Hook)
**What:** Detect and respond to user's motion preference with SSR safety
**When to use:** All animation components
**Example:**
```typescript
// Source: https://www.joshwcomeau.com/react/prefers-reduced-motion/
function usePrefersReducedMotion() {
  const QUERY = '(prefers-reduced-motion: no-preference)';
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(true);

  React.useEffect(() => {
    const mediaQueryList = window.matchMedia(QUERY);
    setPrefersReducedMotion(!mediaQueryList.matches);

    const listener = (event) => {
      setPrefersReducedMotion(!event.matches);
    };

    mediaQueryList.addEventListener('change', listener);
    return () => mediaQueryList.removeEventListener('change', listener);
  }, []);

  return prefersReducedMotion;
}

// Integration with react-spring
const prefersReducedMotion = usePrefersReducedMotion();
const styles = useSpring({
  transform: isBig ? 'scale(2)' : 'scale(1)',
  immediate: prefersReducedMotion,  // Skip animation completely
});
```

### Pattern 3: Long Animation Frames Monitoring (INP)
**What:** Monitor frame-level responsiveness issues for INP optimization
**When to use:** Development and field monitoring to diagnose INP problems
**Example:**
```typescript
// Source: https://developer.chrome.com/docs/web-platform/long-animation-frames
if (PerformanceObserver.supportedEntryTypes.includes('long-animation-frame')) {
  const observer = new PerformanceObserver(list => {
    for (const entry of list.getEntries()) {
      // Report frames with interactions and high blocking (>100ms)
      if (entry.blockingDuration > 100 && entry.firstUIEventTimestamp > 0) {
        console.warn('Long animation frame with interaction:', {
          duration: entry.duration,
          blockingDuration: entry.blockingDuration,
          scripts: entry.scripts.map(s => ({
            invoker: s.invoker,
            sourceURL: s.sourceURL,
            sourceFunctionName: s.sourceFunctionName
          }))
        });
      }
    }
  });
  observer.observe({ type: 'long-animation-frame', buffered: true });
}
```

### Pattern 4: Adaptive Performance (Frame Rate Detection)
**What:** Detect frame rate drops and progressively simplify animations
**When to use:** Wave animation components to ensure 60fps on all devices
**Example:**
```typescript
// Source: Research synthesis from multiple sources
function useAdaptiveFrameRate(targetFPS = 60) {
  const [qualityLevel, setQualityLevel] = useState<'high' | 'medium' | 'low'>('high');
  const frameTimesRef = useRef<number[]>([]);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const checkFrameRate = (currentTime: number) => {
      const delta = currentTime - lastTime;
      frameTimesRef.current.push(delta);

      // Keep last 60 frames
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }

      // Check every 60 frames
      if (frameTimesRef.current.length === 60) {
        const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b) / 60;
        const currentFPS = 1000 / avgFrameTime;

        // Progressive degradation thresholds
        if (currentFPS < 30 && qualityLevel !== 'low') {
          setQualityLevel('low');
        } else if (currentFPS < 45 && qualityLevel === 'high') {
          setQualityLevel('medium');
        } else if (currentFPS > 55 && qualityLevel === 'low') {
          setQualityLevel('medium');
        }
      }

      lastTime = currentTime;
      animationFrameId = requestAnimationFrame(checkFrameRate);
    };

    animationFrameId = requestAnimationFrame(checkFrameRate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [qualityLevel]);

  return qualityLevel;
}
```

### Pattern 5: Perlin Noise Memoization
**What:** Cache Perlin noise calculations to reduce CPU load
**When to use:** Wave component point calculation
**Example:**
```typescript
// Memoize noise calculations with a cache
const noiseCache = new Map<string, number>();

function getCachedNoise(noise: Perlin, x: number, y: number): number {
  const key = `${x.toFixed(2)},${y.toFixed(2)}`;
  if (noiseCache.has(key)) {
    return noiseCache.get(key)!;
  }
  const value = noise.perlin2(x, y);
  noiseCache.set(key, value);
  // Limit cache size
  if (noiseCache.size > 1000) {
    const firstKey = noiseCache.keys().next().value;
    noiseCache.delete(firstKey);
  }
  return value;
}
```

### Pattern 6: Lazy Loading Below-Fold Content
**What:** Use native lazy loading for images, React.lazy for components
**When to use:** Content not visible in initial viewport
**Example:**
```typescript
// Source: https://transloadit.com/devtips/cdn-fotos/
// Native image lazy loading
<img
  src="large-image.jpg"
  loading="lazy"  // Native browser lazy loading
  alt="Description"
/>

// React component lazy loading (for below-fold sections)
const AboutSection = React.lazy(() => import('./AboutSection'));

// In App.tsx
<React.Suspense fallback={<div>Loading...</div>}>
  <AboutSection />
</React.Suspense>
```

### Anti-Patterns to Avoid
- **Don't use prefers-reduced-motion to completely disable animations** - Per user decision, use 5-10x slower animations (subtle drift) instead
- **Don't apply will-change to many elements** - Creates excessive compositor layers, consumes memory, harms performance
- **Don't use setTimeout/setInterval for animations** - Use requestAnimationFrame for frame-synchronized updates
- **Don't read then write DOM in loops** - Causes layout thrashing, batch reads then batch writes
- **Don't lazy-load above-the-fold images** - Increases LCP, only lazy-load below-fold content

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Core Web Vitals measurement | Custom performance.mark/measure | web-vitals library | Handles buffering, edge cases, browser differences, field measurement nuances |
| FPS monitoring | Manual requestAnimationFrame counter | stats.js (dev) or PerformanceObserver | Proven, visual, simple integration |
| Reduced motion detection | Custom media query listener | usePrefersReducedMotion hook | SSR-safe, handles listener cleanup, event updates |
| Long task detection | setTimeout-based monitoring | Long Animation Frames API | Frame-level detail, script attribution, INP-specific metrics |
| Image lazy loading | Custom Intersection Observer | Native loading="lazy" + react-intersection-observer | Browser-optimized, simpler, widely supported |
| Bundle analysis | Manual webpack stats parsing | rollup-plugin-visualizer (installed) | Visual treemap, gzip/brotli sizes, already configured |

**Key insight:** Performance monitoring APIs have evolved significantly. Long Animation Frames API (Chrome 123+) supersedes Long Tasks API with better INP diagnostics. Native lazy loading is widely supported and simpler than custom observers for images.

## Common Pitfalls

### Pitfall 1: Measuring Performance Without Real User Conditions
**What goes wrong:** Lighthouse scores on high-end dev machines don't reflect mobile users on 3G
**Why it happens:** Development typically on fast hardware, good networks, not representative
**How to avoid:**
- Use Lighthouse with throttling (4x CPU slowdown, 4G network simulation)
- Test on real mid-tier mobile devices
- Monitor field data with web-vitals library in production
**Warning signs:** High Lighthouse scores but user complaints about slowness

### Pitfall 2: Over-Memoization Hurting Performance
**What goes wrong:** Memoizing everything creates memory overhead and comparison costs
**Why it happens:** "Optimization" feels productive, but not all memoization helps
**How to avoid:**
- Profile first, optimize based on measurements
- Memoize expensive calculations (Perlin noise per frame)
- Don't memoize cheap operations (simple math, component props)
**Warning signs:** Increased memory usage, no FPS improvement

### Pitfall 3: Applying will-change Too Broadly
**What goes wrong:** Too many compositor layers increase memory, slow down rendering
**Why it happens:** "GPU acceleration" sounds good, applied to everything
**How to avoid:**
- Use will-change sparingly, only on animating elements
- Remove will-change after animation completes
- Prefer transform/opacity (inherently GPU-accelerated) without will-change
**Warning signs:** Memory bloat, scrolling jank, mobile crashes

### Pitfall 4: Disabling Animations Entirely for Reduced Motion
**What goes wrong:** Users get jarring static experience, lose visual feedback
**Why it happens:** Misunderstanding of accessibility requirement
**How to avoid:**
- Per user decision: use 5-10x slower animations (subtle drift)
- Keep functional animations (button press feedback, focus indicators)
- Replace motion-heavy effects with fades/opacity changes
**Warning signs:** Accessibility complaints, static feel, loss of brand identity

### Pitfall 5: Code Splitting Too Aggressively
**What goes wrong:** Too many small chunks increase HTTP requests, delay initial render
**Why it happens:** "More chunks = better performance" misconception
**How to avoid:**
- Split at route/page boundaries, not component level
- Target chunks >30KB for meaningful savings
- Use Vite's automatic splitting, avoid excessive manual chunks
**Warning signs:** Waterfall of many small JS files, increased total load time

### Pitfall 6: Not Monitoring INP Early
**What goes wrong:** Interaction delays discovered late, hard to diagnose root cause
**Why it happens:** Focus on LCP/CLS, overlook interaction responsiveness
**How to avoid:**
- Set up Long Animation Frames API monitoring early
- Track blockingDuration and script attribution
- Test interactions on throttled devices
**Warning signs:** Users report "laggy" interactions, clicks don't respond quickly

## Code Examples

Verified patterns from official sources:

### Reduced Motion with React Spring
```typescript
// Source: https://www.joshwcomeau.com/react/prefers-reduced-motion/
const prefersReducedMotion = usePrefersReducedMotion();

// For decorative animations: skip entirely
const waveSpring = useSpring({
  progress: scrollProgress,
  immediate: prefersReducedMotion,
  config: { tension: 120, friction: 26 }
});

// For essential animations: slow down instead
const waveSpring = useSpring({
  progress: scrollProgress,
  config: prefersReducedMotion
    ? { tension: 10, friction: 40 }  // 10x slower
    : { tension: 120, friction: 26 }
});
```

### Web Vitals Monitoring Setup
```typescript
// Source: https://github.com/GoogleChrome/web-vitals
// src/performance/vitals.ts
import { onLCP, onINP, onCLS, onFCP, onTTFB } from 'web-vitals';

export function initWebVitals() {
  function sendToAnalytics({ name, value, rating, delta, id }: Metric) {
    // Log in development, send to analytics in production
    if (import.meta.env.DEV) {
      console.log(`[Web Vitals] ${name}:`, {
        value: `${Math.round(value)}ms`,
        rating,
        delta: `${Math.round(delta)}ms`,
        id
      });
    } else {
      const body = JSON.stringify({ name, value, rating, delta, id });
      navigator.sendBeacon?.('/analytics', body) ||
        fetch('/analytics', { body, method: 'POST', keepalive: true });
    }
  }

  onLCP(sendToAnalytics);  // Target: <2500ms
  onINP(sendToAnalytics);  // Target: <200ms
  onCLS(sendToAnalytics);  // Target: <0.1
  onFCP(sendToAnalytics);  // Informational
  onTTFB(sendToAnalytics); // Informational
}

// In main.tsx
import { initWebVitals } from './performance/vitals';
initWebVitals();
```

### Long Animation Frames Monitoring
```typescript
// Source: https://developer.chrome.com/docs/web-platform/long-animation-frames
// src/performance/loaf-monitor.ts
export function monitorLongAnimationFrames() {
  if (!PerformanceObserver.supportedEntryTypes?.includes('long-animation-frame')) {
    console.warn('Long Animation Frames API not supported');
    return;
  }

  const observer = new PerformanceObserver(list => {
    for (const entry of list.getEntries()) {
      // Focus on frames with user interactions and significant blocking
      if (entry.blockingDuration > 100 && entry.firstUIEventTimestamp > 0) {
        console.warn('Long animation frame detected:', {
          duration: `${Math.round(entry.duration)}ms`,
          blockingDuration: `${Math.round(entry.blockingDuration)}ms`,
          renderStart: entry.renderStart,
          scripts: entry.scripts?.map(s => ({
            invoker: s.invoker,
            sourceURL: s.sourceURL?.split('/').pop(),
            functionName: s.sourceFunctionName,
            duration: s.duration
          }))
        });
      }
    }
  });

  observer.observe({ type: 'long-animation-frame', buffered: true });
}
```

### Adaptive Wave Simplification
```typescript
// Integrate with Wave component for progressive degradation
const qualityLevel = useAdaptiveFrameRate(60);

// Adjust wave parameters based on detected performance
const waveParams = useMemo(() => {
  switch (qualityLevel) {
    case 'low':
      return {
        points: 3,        // Fewer points
        fps: 15,          // Lower frame rate
        numWaves: 3       // Fewer waves
      };
    case 'medium':
      return {
        points: 5,
        fps: 30,
        numWaves: 4
      };
    case 'high':
    default:
      return {
        points: 7,
        fps: 30,
        numWaves: 5
      };
  }
}, [qualityLevel]);
```

### Lazy Loading with Suspense
```typescript
// Source: https://react.dev/reference/react/lazy
import { lazy, Suspense } from 'react';

// Code-split heavy components (only if below fold or conditionally rendered)
const AboutSection = lazy(() => import('./sections/AboutSection'));
const ContactForm = lazy(() => import('./sections/ContactForm'));

function App() {
  return (
    <Suspense fallback={<LoadingWave />}>
      <AboutSection />
      <ContactForm />
    </Suspense>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Long Tasks API | Long Animation Frames API | Chrome 123 (2024) | Better INP diagnostics, script attribution, frame-level detail |
| First Input Delay (FID) | Interaction to Next Paint (INP) | March 2024 | Measures all interactions, not just first; 200ms threshold |
| Manual Intersection Observer | Native loading="lazy" | 2020 (baseline) | Simpler API, browser-optimized, widely supported |
| transform: translateZ(0) hack | CSS transform/opacity (inherently GPU) | Ongoing | No hacks needed, transforms automatically use compositor |
| prefers-reduced-motion: remove all | Slow down 5-10x or use fades | 2025+ guidance | Better UX, maintains brand, respects accessibility |

**Deprecated/outdated:**
- **Long Tasks API**: Use Long Animation Frames API for INP monitoring (better detail, script attribution)
- **First Input Delay (FID)**: Replaced by INP in Core Web Vitals (March 2024)
- **window.performance.timing**: Use PerformanceObserver and Navigation Timing Level 2
- **@media (prefers-reduced-motion: reduce) { animation: none; }**: Use slower animations or fades instead of complete removal

## Open Questions

Things that couldn't be fully resolved:

1. **Web Worker for Perlin noise calculation**
   - What we know: Web Workers can offload computation, but message passing has overhead
   - What's unclear: Whether wave calculation is CPU-bound enough to benefit (need profiling)
   - Recommendation: Profile first with Chrome DevTools Performance tab. If Perlin calculation shows >5ms in flame graph, consider Web Worker. Otherwise, memoization likely sufficient.

2. **Optimal Perlin noise cache size**
   - What we know: Caching reduces recalculation, but consumes memory
   - What's unclear: Sweet spot for cache size (1000 entries? 5000? Dynamic based on device memory?)
   - Recommendation: Start with 1000 entries, monitor with performance.memory API, adjust if memory issues on mobile

3. **Loading indicator timeout threshold**
   - What we know: Need fallback message if loading takes too long
   - What's unclear: Appropriate timeout (2s? 5s? Network-aware?)
   - Recommendation: Use 3s timeout as baseline (matches LCP target), show message if initial JS not parsed/executed

4. **Parallax behavior under reduced motion**
   - What we know: Parallax scrolling can trigger vestibular issues
   - What's unclear: Best alternative (scroll normally? Reduce parallax multiplier? Static positioning?)
   - Recommendation: Reduce parallax multiplier to 0.1x (subtle depth) rather than eliminate - maintains layout, minimal motion

## Sources

### Primary (HIGH confidence)
- MDN Web Docs - PerformanceObserver API: https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver
- Chrome Developers - Long Animation Frames API: https://developer.chrome.com/docs/web-platform/long-animation-frames
- MDN Web Docs - prefers-reduced-motion: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- web.dev - prefers-reduced-motion best practices: https://web.dev/articles/prefers-reduced-motion

### Secondary (MEDIUM confidence)
- GitHub GoogleChrome/web-vitals: https://github.com/GoogleChrome/web-vitals
- Josh W. Comeau - Accessible Animations in React: https://www.joshwcomeau.com/react/prefers-reduced-motion/
- Vite Documentation - Features (code splitting): https://vite.dev/guide/features
- React Documentation - lazy: https://react.dev/reference/react/lazy
- Transloadit - Lazy loading images in React: https://transloadit.com/devtips/cdn-fotos/
- Medium - Boost React Performance with Vite: https://benmukebo.medium.com/boost-your-react-apps-performance-with-vite-lazy-loading-and-code-splitting-2fd093128682
- DEV Community - IntersectionObserver lazy loading: https://dev.to/kansoldev/how-i-used-the-intersectionobserver-api-to-lazyload-images-51c8
- RoastWeb - Core Web Vitals 2026: https://roastweb.com/blog/core-web-vitals-explained-2026

### Tertiary (LOW confidence - WebSearch only)
- GitHub mrdoob/stats.js: https://github.com/mrdoob/stats.js (FPS monitoring library)
- Growing with the Web - FPS Counter: https://www.growingwiththeweb.com/2017/12/fast-simple-js-fps-counter.html (implementation pattern)
- Medium - Web Workers performance: https://medium.com/@sohail_saifi/an-advanced-guide-to-web-workers-in-javascript-for-performance-heavy-tasks-67d27b5c2448

**Note on WebSearch limitations:** Web search service was intermittently unavailable during research. Some queries succeeded, others failed. Core Web Vitals and Lighthouse optimization queries failed, requiring fallback to known best practices and documentation sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - web-vitals is official Google library, react-spring already in use
- Architecture: MEDIUM - Patterns verified from official docs, but project-specific integration not tested
- Pitfalls: MEDIUM - Based on common performance anti-patterns and official guidance
- Code examples: HIGH - All examples from official documentation or verified sources
- Web Worker recommendation: LOW - Requires profiling to determine if beneficial for this specific use case

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days - performance APIs stable, best practices evolve slowly)

**Research constraints from CONTEXT.md:**
- Reduced motion: Slow animations (5-10x) instead of static (locked decision)
- Mobile fallbacks: Dynamic adaptation, not hard cutoffs (locked decision)
- Loading experience: Animated loader with wave expansion (locked decision)
- Performance budget: <400KB JS, animation smoothness #1 priority (locked decision)
- Claude's discretion: Web Worker usage, lazy loading strategy, performance indicator placement

**Key takeaway for planning:**
The existing animation architecture (requestAnimationFrame via useAnimationFrame, react-spring, Perlin class) is solid. Planning should focus on:
1. Adding measurement infrastructure (web-vitals, LoAF monitoring)
2. Implementing adaptive performance (frame rate detection, progressive simplification)
3. Adding reduced motion support (usePrefersReducedMotion hook, slower animations)
4. Optimizing with memoization (Perlin cache) before considering Web Workers
5. Ensuring lazy loading only for below-fold content (don't harm LCP)
