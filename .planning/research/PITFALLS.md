# Pitfalls Research: v1.1 SEO, Performance & Architecture Optimization

**Project:** Puff Puff Dev Portfolio
**Domain:** React SPA optimization (SEO, performance, architecture)
**Researched:** 2026-02-04
**Overall confidence:** HIGH

## Executive Summary

Adding SEO, achieving Lighthouse 100, and reorganizing architecture in an existing React SPA with complex animations creates unique integration challenges. The biggest risks are:

1. **SEO Theater** - Adding react-helmet without understanding it doesn't help crawlers on GitHub Pages
2. **Animation Performance Death** - Lighthouse 100 becomes impossible with unoptimized canvas/requestAnimationFrame
3. **Silent Code Splitting Failure** - Circular dependencies breaking lazy loading without visible errors
4. **Import Path Chaos** - Directory reorganization breaking existing imports
5. **Memory Leak Cascade** - ResizeObserver and requestAnimationFrame cleanup failures compounding

Unlike greenfield projects, these pitfalls involve integrating new features into existing animation systems without regressing performance.

---

## Critical Pitfalls

Mistakes that cause rewrites, major performance degradation, or complete SEO failure.

### Pitfall 1: React Helmet Theater (SEO Illusion)

**What goes wrong:** Adding react-helmet to manage meta tags and believing it solves SEO for GitHub Pages.

**Why it happens:**
- Client-side meta tag updates work in browsers (you can see them in DevTools)
- Developers test with browser navigation and assume it works
- WebSearch results recommend react-helmet for SEO without the GitHub Pages caveat

**Root cause:** Static hosting (GitHub Pages) means crawlers see the initial HTML before JavaScript executes. react-helmet updates happen client-side AFTER page load, so crawlers never see them.

**Consequences:**
- Social media shares show wrong/missing OG images and descriptions
- Search engine crawlers index generic title/description from index.html
- Wasted effort implementing helmet across all sections
- False confidence that SEO is "done"

**Prevention:**
1. **Know your hosting constraints first** - GitHub Pages = static only, no SSR possible
2. **Test with actual crawlers** - Use Facebook's Sharing Debugger or Twitter Card Validator BEFORE coding
3. **Choose the right tool:**
   - Static OG tags in index.html (works for single-page portfolios)
   - Prerendering service (prerender.io, Rendertron) for multi-route SPAs
   - react-snap for build-time static generation (LIMITED maintenance, compatibility issues with React 18)
4. **DON'T use react-helmet-async** - It's for SSR thread-safety, irrelevant on GitHub Pages

**Detection:**
- Social media preview tools show wrong/missing content
- View page source (Ctrl+U) shows no dynamic meta tags
- Google Search Console shows generic titles/descriptions

**Which phase:** Phase 1 (SEO Foundation) - Get this right FIRST before building other features

**Sources:**
- [React SPA SEO common mistakes](https://dev.to/patarapolw/does-anyone-know-how-to-make-spa-work-with-seo-meta-tags-3ocj)
- [SEO Best Practices for SPAs](https://seojuice.io/blog/seo-best-practices-single-page-applications-spa/)

---

### Pitfall 2: Lighthouse 100 with Unoptimized Animations (The Impossible Dream)

**What goes wrong:** Trying to achieve Lighthouse 100 Performance score while maintaining 30fps canvas animations running on every scroll event.

**Why it happens:**
- Lighthouse documentation shows "100 is achievable"
- Existing animations work fine visually
- Total Blocking Time (TBT) impact not understood until measurement

**Root cause:** Lighthouse heavily weights Total Blocking Time (30% of score). Long tasks (>50ms on main thread) destroy TBT. Canvas animations + scroll handlers + React re-renders = guaranteed long tasks.

**Consequences:**
- Lighthouse scores stuck at 85-95 despite all other optimizations
- Attempts to optimize animations break visual quality
- Frustration leads to removing animations entirely (defeating portfolio purpose)
- Trade-off between performance score and visual identity

**Real-world evidence:** "An animated HTML canvas featuring a Star Wars-like text crawl received a high Cumulative Layout Shift score from Lighthouse, even though it didn't impact user-interactive components."

**Prevention:**

1. **Set realistic targets:**
   - 90+ with complex animations is excellent
   - 95+ requires animation trade-offs
   - 100 requires near-zero JavaScript/animations (unrealistic for your portfolio)

2. **Optimize what matters:**
   - **requestAnimationFrame cleanup** - Your useAnimationFrame hook DOES this correctly (cancelAnimationFrame on unmount)
   - **Frame rate throttling** - Your 30fps throttle is optimal (60fps would double TBT)
   - **Scroll debouncing** - Add 16ms debounce to scroll-reactive transforms
   - **will-change CSS** - Add `will-change: transform` to animated elements for GPU acceleration

3. **Use React.memo strategically:**
   - Memoize non-animated sections (AboutSection, ServicesSection)
   - Prevent re-renders when only scroll position changes
   - DON'T memoize the wave components (they need to re-render)

4. **Code splitting for sections:**
   - Lazy load AboutSection, ServicesSection
   - Keep wave animations in main bundle (needed immediately)
   - Use React.lazy with Suspense

5. **Measure continuously:**
   - Use rollup-plugin-visualizer (ALREADY in your vite.config.ts)
   - Monitor bundle size per chunk
   - Check TBT in Lighthouse, not just overall score

**Detection:**
- Lighthouse TBT >200ms (yellow/red)
- Chrome DevTools Performance tab shows long tasks during scroll
- Frame rate drops below 30fps on mid-range devices

**Which phase:** Phase 2 (Performance Optimization) - Optimize after measuring, not before

**Sources:**
- [Lighthouse scoring deep dive](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring)
- [Achieving Lighthouse 100](https://www.justjeb.com/post/how-to-score-100-on-lighthouse)
- [Google Lighthouse 2026 guide](https://wpdeveloper.com/google-lighthouse-how-to-achieve-highest-score/)

---

### Pitfall 3: Silent Code Splitting Failure (Circular Dependency Hell)

**What goes wrong:** Implementing React.lazy code splitting, seeing it work in development, then discovering production bundles contain duplicate code with NO visible errors.

**Why it happens:**
- Circular dependencies are SILENT (no build errors)
- Tree-shaking and code-splitting break quietly
- Bundle size increases but nothing "breaks" visibly
- Lighthouse scores mysteriously don't improve

**Root cause:** When two modules lazily loaded independently depend on each other, loading one module also pulls the other into the same chunk, undermining lazy loading completely.

**Real-world evidence:** "A recent case had over 800 circular dependencies with some chains extending 15-16 levels deep, causing bundle size to balloon from ~17 MB to <5 MB after refactoring. Lighthouse Performance jumped from 49 to 72."

**Consequences:**
- Lazy-loaded routes contain code from other routes
- Bundle size remains large despite code splitting
- Core Web Vitals don't improve
- Wasted time debugging "working" code
- Performance regression hidden until production measurement

**Prevention:**

1. **Visualize dependencies BEFORE splitting:**
   ```bash
   npm run build
   # Check dist/stats.html (rollup-plugin-visualizer already configured)
   ```

2. **Check for circular dependencies:**
   ```bash
   # Use madge or similar tool
   npx madge --circular --extensions ts,tsx src/
   ```

3. **Follow component import hierarchy:**
   ```
   ✅ GOOD:
   Sections → Components → Hooks → Utils

   ❌ BAD:
   Component A → Component B → Component A
   Hooks → Components (hooks should not import components)
   ```

4. **Code splitting boundaries for your project:**
   - **Main bundle:** Wave animations, WavyBackground, Perlin, hooks
   - **Lazy chunk 1:** AboutSection + dependencies
   - **Lazy chunk 2:** ServicesSection + dependencies
   - **Lazy chunk 3:** Header + MobileMenu (only load when menu opened)

5. **Error Boundaries for lazy imports:**
   - Already have ErrorBoundary - wrap lazy imports
   - Handle network failures during chunk loading
   - Show fallback UI instead of blank screen

6. **Verify chunk separation:**
   ```bash
   npm run build
   # Check dist/ for separate chunk files
   # Verify chunk sizes in stats.html
   ```

**Detection:**
- Bundle visualizer shows unexpected overlap between chunks
- Same component appears in multiple chunks
- Lazy loading doesn't reduce initial bundle size
- madge reports circular dependencies

**Which phase:** Phase 3 (Code Splitting & Architecture) - Check BEFORE implementing lazy loading

**Sources:**
- [React code splitting mistakes](https://medium.com/@tshrgarg2010/why-my-react-app-felt-slow-even-though-nothing-was-broken-2f1b6c65b975)
- [Code splitting best practices](https://www.greatfrontend.com/blog/code-splitting-and-lazy-loading-in-react)
- [Circular dependency pitfalls](https://medium.com/@tshrgarg2010/why-my-react-app-felt-slow-even-though-nothing-was-broken-2f1b6c65b975)

---

### Pitfall 4: Directory Reorganization Import Explosion

**What goes wrong:** Reorganizing src/ directory structure to follow best practices, then spending hours fixing hundreds of broken import paths.

**Why it happens:**
- Moving files breaks relative imports (`../../components/Wave`)
- Search/replace misses edge cases
- TypeScript doesn't catch all import errors until build
- Create React App restrictions on imports outside src/

**Root cause:** Relative imports couple file location to import statements. Moving files cascades to all importers.

**Consequences:**
- Build errors: "Module not found"
- Runtime errors: "Cannot read property of undefined"
- TypeScript errors after reorganization
- Time wasted manually fixing imports
- Risk of breaking working features

**Prevention:**

1. **Use TypeScript path aliases FIRST:**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@components/*": ["src/components/*"],
         "@sections/*": ["src/sections/*"],
         "@hooks/*": ["src/hooks/*"],
         "@utils/*": ["src/utils/*"]
       }
     }
   }
   ```

2. **Update vite.config.ts for Vite:**
   ```typescript
   export default defineConfig({
     resolve: {
       alias: {
         '@components': '/src/components',
         '@sections': '/src/sections',
         '@hooks': '/src/hooks',
         '@utils': '/src/utils'
       }
     }
   })
   ```

3. **Reorganize in stages:**
   - Stage 1: Add path aliases, update imports gradually
   - Stage 2: Move files after all imports use aliases
   - Stage 3: Verify build succeeds

4. **Limit nesting depth:**
   - Max 3-4 levels deep (src/components/Header/MobileMenu - OK)
   - Avoid src/features/auth/components/forms/inputs/TextInput - TOO DEEP

5. **Recommended structure for your project:**
   ```
   src/
   ├── components/       # Reusable UI (Wave, WavyBackground, Header, etc.)
   ├── sections/         # Page sections (AboutSection, ServicesSection)
   ├── hooks/            # Custom hooks (useAnimationFrame, usePerlinNoise)
   ├── utils/            # Pure utilities (if any)
   ├── styles/           # Global styles, CSS modules
   ├── App.tsx
   └── main.tsx
   ```

6. **All files MUST be in src/:**
   - CRA/Vite restriction: imports outside src/ cause errors
   - DON'T create ../common or ../shared directories
   - Everything goes inside src/

**Detection:**
- TypeScript errors on imports
- Build fails with "Module not found"
- Runtime errors after reorganization
- ESLint warnings about missing modules

**Which phase:** Phase 3 (Architecture Reorganization) - Set up aliases BEFORE moving files

**Sources:**
- [React import path errors](https://bobbyhadz.com/blog/react-you-attempted-to-import-which-falls-outside-project)
- [React folder structure best practices](https://www.robinwieruch.de/react-folder-structure/)
- [CRA file structure](https://www.pluralsight.com/guides/file-structure-react-applications-created-create-react-app)

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or degraded performance but are recoverable.

### Pitfall 5: ResizeObserver + requestAnimationFrame Memory Leak Cascade

**What goes wrong:** Adding new animated sections with ResizeObserver for responsive sizing, seeing it work, then noticing memory usage grow over time during development with HMR.

**Why it happens:**
- Your Waves.tsx component DOES clean up ResizeObserver correctly (observer.disconnect())
- BUT adding new components might not follow the same pattern
- Multiple observers + multiple animation frames compound
- HMR reloads components without full page refresh, exposing leaks
- Safari has specific bugs with ResizeObserver + useState

**Root cause:** Observers and animation frames persist after component unmount unless explicitly cleaned up. Each mount/unmount cycle leaks memory.

**Real-world evidence:** "useState with ResizeObserver leaks React components on Safari 13.1 - the component never gets garbage collected because the observer still observes the detached component."

**Consequences:**
- Memory usage grows during development
- Performance degrades after navigation/HMR reloads
- Mobile Safari crashes after extended use
- Hard to debug (memory leaks not visible in console)

**Prevention:**

1. **Your existing Waves.tsx pattern is CORRECT:**
   ```typescript
   useEffect(() => {
     const observer = new ResizeObserver((entries) => { /* ... */ });
     observer.observe(containerRef.current);

     return () => observer.disconnect(); // ✅ CRITICAL
   }, []);
   ```

2. **Your existing useAnimationFrame hook is CORRECT:**
   ```typescript
   useEffect(() => {
     frameIdRef.current = requestAnimationFrame(animate);

     return () => {
       if (frameIdRef.current !== undefined) {
         cancelAnimationFrame(frameIdRef.current); // ✅ CRITICAL
       }
     };
   }, []);
   ```

3. **When adding new animated sections:**
   - Copy the cleanup pattern from Waves.tsx
   - ALWAYS return cleanup function from useEffect
   - Test memory usage in Chrome DevTools Memory profiler
   - Test on Safari (stricter garbage collection)

4. **ESLint rule enforcement:**
   ```bash
   npm install --save-dev eslint-plugin-react-hooks
   ```

   The rule `react-hooks/exhaustive-deps` will catch missing cleanup

5. **Add debouncing to ResizeObserver:**
   ```typescript
   const debouncedResize = useMemo(
     () => debounce((entries) => { /* resize logic */ }, 150),
     []
   );

   const observer = new ResizeObserver(debouncedResize);
   ```

**Detection:**
- Chrome DevTools Memory Profiler shows increasing detached DOM nodes
- Performance degrades after navigation without page refresh
- Mobile Safari crashes during testing
- HMR reloads cause memory spikes

**Which phase:** Phase 2 (Performance) and Phase 4 (New Features) - Enforce pattern when adding sections

**Sources:**
- [ResizeObserver memory leaks in React](https://medium.com/@ignatovich.dm/understanding-memory-leaks-in-react-how-to-find-and-fix-them-fc782cf182be)
- [Safari ResizeObserver leak bug](https://github.com/facebook/react/issues/19131)
- [ESLint rule for ResizeObserver cleanup](https://eslint-react.xyz/docs/rules/web-api-no-leaked-resize-observer)

---

### Pitfall 6: react-spring/parallax Scroll Event Misconception

**What goes wrong:** Adding scroll-based animations using `window.addEventListener('scroll')` and wondering why they don't fire when using `@react-spring/parallax`.

**Why it happens:**
- Natural assumption: scroll = window scroll
- Most tutorials show window scroll listeners
- Parallax creates its own scrollable container

**Root cause:** `@react-spring/parallax` renders a scrollable div container, NOT using window scroll. Scroll events fire from the container, not window.

**Consequences:**
- Scroll listeners don't trigger
- Custom animations don't sync with parallax
- Debugging time wasted on "broken" event listeners
- Workarounds that bypass Parallax benefits

**Prevention:**

1. **Use Parallax's ref to access container:**
   ```typescript
   const parallaxRef = useRef<IParallax>(null);

   useEffect(() => {
     const container = parallaxRef.current?.container.current;
     if (!container) return;

     const handleScroll = () => { /* ... */ };
     container.addEventListener('scroll', handleScroll);

     return () => container.removeEventListener('scroll', handleScroll);
   }, []);
   ```

2. **Use react-spring's useScroll instead:**
   ```typescript
   const { scrollYProgress } = useScroll({
     container: parallaxRef.current?.container
   });
   ```

3. **Understand offset vs speed:**
   - `offset` = where layer ENDS (not starts)
   - `speed` = affects START position, not end
   - Common confusion leads to unexpected positions

4. **All direct children must be ParallaxLayer:**
   - Wrapping in div breaks layout
   - Use fragments for grouping

**Detection:**
- Scroll event listeners never fire
- `scrollY` always shows 0
- Custom animations don't respond to scroll

**Which phase:** Phase 4 (New Features) - When adding new scroll-reactive animations

**Sources:**
- [react-spring Parallax issues](https://github.com/react-spring/react-spring/issues/771)
- [Parallax performance optimization](https://ironeko.com/posts/parallax-effect-with-react-spring-how-to)
- [Adaptive Parallax with react-spring](https://medium.com/@other.world.html/adaptive-parallax-with-react-spring-e301c5740e6f)

---

### Pitfall 7: GitHub Pages SPA Routing 404 Hell

**What goes wrong:** After deployment, direct navigation to routes (e.g., `example.com/about`) returns 404, but client-side navigation works fine.

**Why it happens:**
- GitHub Pages is static hosting - looks for about.html when you visit /about
- No server to handle SPA fallback to index.html
- Works in dev because Vite dev server handles routing

**Root cause:** GitHub Pages doesn't support SPA routing natively. Each path needs a corresponding HTML file.

**Consequences:**
- Shared links to specific sections return 404
- Page refreshes on non-root routes fail
- Users can't bookmark deep links
- SEO for multi-page SPAs broken

**Prevention:**

**For your single-page portfolio (recommended):**
- DON'T use React Router - you have a single scrolling page
- Use hash-based navigation for sections:
  ```
  example.com/#about
  example.com/#services
  ```
- Implement scroll-to-section on hash change

**If you add routing later:**

1. **Option A: 404.html redirect hack:**
   ```html
   <!-- public/404.html -->
   <!DOCTYPE html>
   <html>
     <head>
       <script>
         sessionStorage.redirect = location.href;
       </script>
       <meta http-equiv="refresh" content="0;URL='/'" />
     </head>
   </html>
   ```

   Then in index.html:
   ```html
   <script>
     const redirect = sessionStorage.redirect;
     delete sessionStorage.redirect;
     if (redirect && redirect !== location.href) {
       history.replaceState(null, null, redirect);
     }
   </script>
   ```

2. **Option B: HashRouter instead of BrowserRouter:**
   ```typescript
   import { HashRouter } from 'react-router-dom';

   // URLs become example.com/#/about
   ```

3. **Option C: Move to Cloudflare Pages:**
   - Native SPA support
   - Better than GitHub Pages for SPAs
   - Free tier available

**Detection:**
- Direct navigation to routes returns 404
- Page refresh on non-root route fails
- Shared links don't work

**Which phase:** Phase 1 (Infrastructure) - Decide routing strategy early

**Sources:**
- [GitHub Pages SPA 404 fix](https://dev.to/lico/handling-404-error-in-spa-deployed-on-github-pages-246p)
- [React Router on GitHub Pages](https://gmfuster.medium.com/deploying-a-react-app-to-github-pages-24c3e5485589)
- [GitHub Pages SPA limitations](https://github.com/orgs/community/discussions/64096)

---

### Pitfall 8: React 18 Concurrent Rendering Animation Jank

**What goes wrong:** After upgrading to React 18 (or when using concurrent features), animations stutter or skip frames unpredictably.

**Why it happens:**
- React 18 can interrupt renders (time-slicing)
- Animations relying on "renders happen immediately" break
- Transitions and Suspense change render timing
- setState during animation loop conflicts with concurrent rendering

**Root cause:** Concurrent rendering schedules renders instead of executing immediately. Animation code assuming synchronous updates gets out of sync.

**Real-world evidence:** "Code that relies on renders being performed immediately is a typical source of concurrent mode bugs, as in concurrent mode, renders are merely scheduled rather than immediately performed."

**Consequences:**
- Frame drops during animations
- Visual jank when scrolling
- Animations feel sluggish or choppy
- Unpredictable behavior across devices

**Prevention:**

1. **Your current pattern is SAFE:**
   - Direct DOM manipulation via SVG path `d` attribute
   - NOT relying on React state for 30fps updates
   - setState only updates path string, doesn't block

2. **If adding new animations:**
   - Use refs for DOM manipulation (bypass React)
   - Use CSS transforms over React state changes
   - Use `useTransition` for non-urgent updates

3. **Avoid during animations:**
   - Calling setState at 30fps+
   - Suspense boundaries around animated components
   - Heavy computations in render functions

4. **Test on slower devices:**
   - Concurrent rendering more noticeable on lower-end hardware
   - Use Chrome DevTools CPU throttling

**Detection:**
- Profiler shows interrupted renders
- Frame rate drops below target fps
- Animations stutter on slower devices

**Which phase:** Phase 2 (Performance) - Test after any animation changes

**Sources:**
- [React 18 concurrent rendering performance](https://www.curiosum.com/blog/performance-optimization-with-react-18-concurrent-rendering)
- [React 18 concurrent pitfalls](https://make.wordpress.org/core/2023/03/07/upgrading-to-react-18-and-common-pitfalls-of-concurrent-mode/)
- [React 18 animation performance](https://dawchihliou.github.io/articles/stress-testing-concurrent-features-in-react-18)

---

## Minor Pitfalls

Mistakes that cause annoyance but are easily fixable.

### Pitfall 9: Vite Build Base Path Misconfiguration

**What goes wrong:** Build succeeds but deployed site shows blank page or assets fail to load with 404s.

**Why it happens:**
- GitHub Pages for user/org sites uses root path
- GitHub Pages for project sites uses /repo-name/ path
- Vite defaults to root (/)
- Commented-out base config in vite.config.ts

**Root cause:** Asset paths generated during build don't match deployment path structure.

**Consequences:**
- Blank page after deployment
- CSS/JS 404s
- Images broken
- Works locally, fails in production

**Prevention:**

1. **Check your GitHub Pages URL structure:**
   - User/org site: `username.github.io` → base: `/`
   - Project site: `username.github.io/repo-name` → base: `/repo-name/`

2. **Your current vite.config.ts has commented base:**
   ```typescript
   // base: '/romatroskin.github.io',  // ❌ COMMENTED
   ```

   Since your repo is `romatroskin.github.io` (user site), you DON'T need base config.
   But if you were using a project site, you'd need to uncomment this.

3. **Verify in package.json:**
   ```json
   {
     "homepage": "https://romatroskin.github.io"
   }
   ```

4. **Test build locally:**
   ```bash
   npm run build
   npm run preview
   # Check that assets load correctly
   ```

**Detection:**
- Blank page in production but works locally
- Console shows 404 for assets
- DevTools Network tab shows failed requests

**Which phase:** Phase 1 (Infrastructure) - Verify during deployment setup

**Sources:**
- [Vite build options](https://vite.dev/config/build-options)

---

### Pitfall 10: Bundle Analyzer Visualization Misinterpretation

**What goes wrong:** Running bundle analyzer, seeing large chunk sizes, and optimizing the wrong things.

**Why it happens:**
- Visualizer shows uncompressed sizes
- React and react-spring appear "huge"
- Focus on reducing library size instead of code structure
- Brotli compression makes 100KB look like 20KB

**Root cause:** Bundle visualizer shows raw sizes, not what users actually download. Production uses compression.

**Consequences:**
- Time wasted trying to reduce library sizes
- Premature optimization of small modules
- Ignoring actual bottlenecks (large images, fonts)
- Analysis paralysis from data overload

**Prevention:**

1. **Your rollup-plugin-visualizer config is GOOD:**
   ```typescript
   visualizer({
     filename: './dist/stats.html',
     gzipSize: true,     // ✅ Shows gzipped size
     brotliSize: true    // ✅ Shows brotli size (most relevant)
   })
   ```

2. **Focus on brotli sizes:**
   - That's what GitHub Pages serves
   - 100KB raw → ~25KB brotli is normal for React + react-spring

3. **What to optimize:**
   - Chunks over 50KB brotli (split further)
   - Duplicate code across chunks (circular dependencies)
   - Large images/assets (compress/lazy load)
   - Unused dependencies (remove from package.json)

4. **What NOT to optimize:**
   - React library size (you need it)
   - react-spring library size (core to your design)
   - Small utility libraries (<5KB brotli)

5. **Budget targets:**
   - Initial bundle: <100KB brotli
   - Lazy chunks: <50KB brotli each
   - Total JS: <200KB brotli

**Detection:**
- Focusing on library sizes in visualizer
- Trying to replace React with Preact
- Considering removing react-spring

**Which phase:** Phase 3 (Code Splitting) - Analyze AFTER splitting, not before

**Sources:**
- [Vite bundle analyzer](https://www.restack.io/p/vite-bundle-analyzer-answer)
- [Bundle optimization guide](https://medium.com/@jajibhee/the-complete-guide-to-javascript-bundle-optimization-code-splitting-and-tree-shaking-7ddbdcbd7957)

---

## Integration Pitfalls

Mistakes specific to adding new features to existing parallax/animation system.

### Pitfall 11: Parallax Layer Z-Index Stack Confusion

**What goes wrong:** Adding new ParallaxLayer sections with wrong z-index/offset, causing content to overlap incorrectly or not appear at all.

**Why it happens:**
- Parallax layers stack based on order in JSX AND offset
- Z-index behavior differs from normal CSS
- Speed affects layer positioning non-linearly

**Root cause:** Parallax offset is destination (not start), and layer stacking is complex with speed + offset + z-index interaction.

**Consequences:**
- New sections hidden behind waves
- Text unreadable due to overlap
- Scroll positions feel wrong
- Visual hierarchy broken

**Prevention:**

1. **Document current layer structure:**
   ```
   Layer 0: Background waves (lowest z-index)
   Layer 1: Content sections (middle z-index)
   Layer 2: Header/Navigation (highest z-index)
   ```

2. **When adding new sections:**
   - Start with offset in 0.5 increments (0, 0.5, 1.0, 1.5)
   - Use sticky prop for elements that should remain visible
   - Test scroll behavior immediately

3. **Use consistent z-index ranges:**
   - Waves: z-index 0-10
   - Content: z-index 10-20
   - UI (header, nav): z-index 20-30

**Detection:**
- New sections don't appear after adding
- Content obscured by waves
- Scroll feels "wrong"

**Which phase:** Phase 4 (New Features) - When adding sections

---

### Pitfall 12: Wave Animation React.memo Over-Optimization

**What goes wrong:** Wrapping WavyBackground in React.memo to "optimize" performance, then discovering animations stop updating or become choppy.

**Why it happens:**
- Intuition says "memoize everything for performance"
- Wave props include Interpolation objects that change constantly
- Memo comparison fails to detect Interpolation changes

**Root cause:** react-spring Interpolation objects are stable references but their VALUES change. React.memo compares references, not values.

**Consequences:**
- Waves freeze or update inconsistently
- Performance doesn't improve (or gets worse)
- Time wasted debugging memoization

**Prevention:**

1. **DON'T memoize:**
   - WavyBackground
   - Wave components
   - Any component receiving Interpolation props

2. **DO memoize:**
   - Static sections (AboutSection, ServicesSection)
   - Components that don't depend on scroll/animation state

3. **If you must memoize animated components:**
   ```typescript
   const arePropsEqual = (prev, next) => {
     // Custom comparison for Interpolation props
     return prev.speed.get() === next.speed.get() &&
            prev.amplitude.get() === next.amplitude.get();
   };

   export default React.memo(WavyBackground, arePropsEqual);
   ```

   But usually NOT worth the complexity.

**Detection:**
- Animations stop updating after memoization
- Profiler shows components not re-rendering when they should

**Which phase:** Phase 2 (Performance) - Understand memoization trade-offs

---

## Prevention Checklist by Phase

### Phase 1: SEO & Infrastructure Setup
- [ ] Choose SEO strategy (static meta tags vs prerendering) BEFORE coding
- [ ] Test with actual crawlers (Facebook Debugger, Twitter Card Validator)
- [ ] Verify GitHub Pages base path configuration
- [ ] Decide routing strategy (hash-based vs no-routing for single-page)
- [ ] Set up TypeScript path aliases for future reorganization

### Phase 2: Performance Optimization
- [ ] Set realistic Lighthouse targets (90-95 with animations, not 100)
- [ ] Measure BEFORE optimizing (use Chrome DevTools Performance)
- [ ] Check ResizeObserver cleanup in all components
- [ ] Verify requestAnimationFrame cleanup in all components
- [ ] Add scroll debouncing (16ms) to scroll handlers
- [ ] Use React.memo on static sections ONLY
- [ ] Test memory usage with Chrome DevTools Memory Profiler
- [ ] Test on Safari for memory leak edge cases

### Phase 3: Code Splitting & Architecture
- [ ] Check for circular dependencies BEFORE code splitting (madge)
- [ ] Visualize bundle with rollup-plugin-visualizer BEFORE splitting
- [ ] Set up path aliases BEFORE reorganizing directories
- [ ] Split code at logical boundaries (sections, not components)
- [ ] Verify chunks in visualizer AFTER splitting
- [ ] Keep all files inside src/ directory
- [ ] Limit directory nesting to 3-4 levels max
- [ ] Test that build succeeds after reorganization

### Phase 4: New Feature Integration
- [ ] Copy cleanup patterns from existing components (Waves.tsx)
- [ ] Use Parallax container ref for scroll events (not window)
- [ ] Document layer z-index/offset for new sections
- [ ] Test scroll behavior immediately after adding sections
- [ ] DON'T memoize components with Interpolation props
- [ ] Test animations on slower devices (CPU throttling)
- [ ] Verify no memory leaks with new animated components

### Continuous Quality Gates
- [ ] Run bundle analyzer after each major change
- [ ] Monitor brotli sizes (not raw sizes)
- [ ] Test on mobile Safari regularly (stricter GC)
- [ ] Check Lighthouse TBT score (not just overall)
- [ ] Verify social media previews work (Facebook Debugger)
- [ ] Test direct navigation to all routes (if routing added)
- [ ] Profile memory usage during extended dev sessions

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| SEO Pitfalls | HIGH | GitHub Pages limitations well-documented, multiple sources confirm static meta tag reality |
| Performance Pitfalls | HIGH | Lighthouse scoring mechanics official, animation optimization patterns verified |
| Code Splitting | HIGH | Recent 2026 case study confirms circular dependency risks, established best practices |
| Architecture | MEDIUM | Path alias setup standard, but project-specific reorganization needs testing |
| Integration | HIGH | Existing codebase analysis shows correct patterns, react-spring docs confirm Parallax behavior |
| Memory Leaks | HIGH | Safari bug documented, ResizeObserver cleanup pattern verified, existing code correct |

---

## Research Sources

### SEO & GitHub Pages
- [React SPA SEO meta tags issues](https://dev.to/patarapolw/does-anyone-know-how-to-make-spa-work-with-seo-meta-tags-3ocj)
- [SEO Best Practices for SPAs](https://seojuice.io/blog/seo-best-practices-single-page-applications-spa/)
- [React Helmet vs react-helmet-async](https://www.thatsoftwaredude.com/content/14126/react-helmet-vs-react-helmet-async)
- [GitHub Pages SPA 404 fix](https://dev.to/lico/handling-404-error-in-spa-deployed-on-github-pages-246p)

### Performance & Lighthouse
- [Lighthouse performance scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring)
- [Achieving Lighthouse 100](https://www.justjeb.com/post/how-to-score-100-on-lighthouse)
- [Google Lighthouse 2026 guide](https://wpdeveloper.com/google-lighthouse-how-to-achieve-highest-score/)
- [React 18 concurrent rendering](https://www.curiosum.com/blog/performance-optimization-with-react-18-concurrent-rendering)

### Code Splitting & Circular Dependencies
- [Why React apps felt slow - 2026 case study](https://medium.com/@tshrgarg2010/why-my-react-app-felt-slow-even-though-nothing-was-broken-2f1b6c65b975)
- [Code splitting best practices](https://www.greatfrontend.com/blog/code-splitting-and-lazy-loading-in-react)
- [Vite tree shaking issues](https://github.com/vitejs/vite/issues/8339)

### Memory Leaks & Cleanup
- [Understanding memory leaks in React](https://medium.com/@ignatovich.dm/understanding-memory-leaks-in-react-how-to-find-and-fix-them-fc782cf182be)
- [Safari ResizeObserver leak bug](https://github.com/facebook/react/issues/19131)
- [Canvas animations requestAnimationFrame cleanup](https://blog.openreplay.com/use-requestanimationframe-in-react-for-smoothest-animations/)
- [ESLint ResizeObserver rule](https://eslint-react.xyz/docs/rules/web-api-no-leaked-resize-observer)

### react-spring & Parallax
- [react-spring Parallax issues](https://github.com/react-spring/react-spring/issues/771)
- [Parallax performance optimization](https://ironeko.com/posts/parallax-effect-with-react-spring-how-to)
- [Adaptive Parallax patterns](https://medium.com/@other.world.html/adaptive-parallax-with-react-spring-e301c5740e6f)

### Project Structure
- [React import path errors](https://bobbyhadz.com/blog/react-you-attempted-to-import-which-falls-outside-project)
- [React folder structure 2025](https://www.robinwieruch.de/react-folder-structure/)

### Prerendering
- [react-snap alternatives](https://github.com/stereobooster/react-snap/blob/master/doc/alternatives.md)
- [Prerender.io alternatives 2026](https://lovablehtml.com/blog/prerender-io-alternatives)
- [Pre-rendering React apps](https://web.dev/prerender-with-react-snap/)
