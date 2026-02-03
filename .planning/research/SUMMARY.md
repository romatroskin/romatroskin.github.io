# Research Summary: v1.1 Optimization & Polish

**Project:** Puff Puff Dev Portfolio (romatroskin.github.io)
**Domain:** React SPA optimization (SEO, performance, portfolio expansion)
**Researched:** 2026-02-04
**Confidence:** HIGH

## Executive Summary

The v1.1 milestone targets SEO optimization, Lighthouse 100 (90-95 realistic with animations), portfolio section, contact section, directory reorganization, and design polish for an existing React 18 + Vite portfolio with complex Perlin noise-driven wave animations. Research confirms the current stack is fundamentally sound and does not require replacement—only targeted additions and architectural refinements.

**The recommended approach is incremental enhancement over replacement.** The biggest insight: achieving "perfect" Lighthouse 100 is unrealistic with 30fps canvas animations (Lighthouse heavily weights Total Blocking Time), but 90-95 is excellent and achievable. For SEO on GitHub Pages static hosting, client-side meta tag libraries like react-helmet-async provide limited value—static meta tags in index.html combined with build-time sitemap generation are sufficient for single-page portfolios. The existing code splitting pattern (lazy-loaded sections) should be extended to new portfolio and contact sections, leveraging Vite's automatic tree-shaking and the already-configured rollup-plugin-visualizer for verification.

**Key risks center on integration, not technology choices.** The critical pitfalls involve adding SEO/features without understanding GitHub Pages constraints (static-only hosting breaks many SPA SEO patterns), attempting Lighthouse 100 with heavy animations (creates impossible performance expectations), and circular dependencies silently breaking code splitting (recent 2026 case study shows 800+ circular dependencies reducing Lighthouse from 49 to 72 after refactoring). Prevention requires upfront verification: test SEO with actual crawlers (Facebook Sharing Debugger), set realistic Lighthouse targets (90-95), check for circular dependencies with madge before splitting, and copy existing cleanup patterns (ResizeObserver/requestAnimationFrame) when adding animated components.

## Key Findings

### Recommended Stack

The existing React 18 + Vite 5.4.1 stack is already well-optimized with web-vitals monitoring and rollup-plugin-visualizer for bundle analysis. Research recommends **targeted additions, not replacement**. Consider upgrading Vite to 6.0+ for 70% faster builds with no breaking changes. The only new runtime dependency needed is react-helmet-async (17KB, 2.1M weekly downloads) for dynamic meta tag management—but with the caveat that it provides limited SEO benefit on GitHub Pages static hosting.

**Core additions for v1.1:**
- **react-helmet-async** (^2.0.5): Dynamic meta tags per section — thread-safe, React 18 compatible, industry standard. Better than deprecated react-helmet but limited value on GitHub Pages (static hosting means crawlers see initial HTML only).
- **vite-plugin-sitemap** (^0.8.2): Build-time sitemap.xml and robots.txt generation — zero runtime overhead, actively maintained (June 2025 release), critical for search engine discovery.
- **vite-plugin-compression2**: Pre-compress assets with Brotli + gzip — GitHub Pages serves pre-compressed files if present, critical for Lighthouse Transfer Size audit. Brotli reduces bundles 30-40%.
- **vite-imagetools** (^9.0.2): Responsive images with WebP/AVIF conversion — build-time processing, no runtime cost, generates srcset automatically. Alternative to Sharp-based plugins (which add 20MB to node_modules).
- **schema-dts** (^1.1.2, dev-only): TypeScript definitions for Schema.org JSON-LD — Google-maintained, type-safe structured data. Manual JSON-LD implementation recommended over react-schemaorg (portfolio needs 2-3 schema types max, library is overkill).

**What NOT to add:**
- vite-plugin-pwa (PWA not needed for portfolio, adds complexity without benefit)
- react-schemaorg (manual implementation is 20 lines vs 50KB library)
- SSR/SSG frameworks like Next.js (current stack achieves same performance, migration would delay delivery)
- Sharp-based image plugins (20MB dependency, vite-imagetools provides same output)

**Code splitting expansion:** Add manual chunks in vite.config.ts to separate React ecosystem (~150KB cached), animation libraries (~100KB cached), and app code (~30KB). This leverages browser caching when only app code changes. Expected impact: main bundle stays under 50KB gzipped.

### Expected Features

Research divided features into table stakes (expected in any professional portfolio), differentiators (competitive advantages), and anti-features (common mistakes to avoid). The feature landscape centers on three domains: **SEO optimization** (making the React SPA discoverable), **portfolio showcasing** (demonstrating Flutter expertise), and **contact mechanisms** (converting visitors to clients).

**Must have (table stakes):**
- **Dynamic meta tags per section** — React SPAs need per-route management since navigation doesn't reload page. Use react-helmet-async but understand GitHub Pages limitations.
- **Sitemap.xml and robots.txt** — Search engines need URL discovery, critical for any professional site. Use vite-plugin-sitemap for build-time generation.
- **Structured data (JSON-LD)** — Organization/Person schema for rich search results. Manual implementation with schema-dts types recommended.
- **2-3 portfolio case studies** — Industry standard: juniors 2-3, seniors 4-5. Must include Problem → Solution → Results narrative, project screenshots, technologies used, App Store links for mobile projects.
- **Contact section** — Email (copyable or mailto:), social links (GitHub, LinkedIn), clear CTA placement. Static-friendly solution required for GitHub Pages (no backend form in v1.1, defer to v1.2+).
- **WCAG 2.2 AA compliance** — Keyboard navigation, color contrast >=4.5:1, semantic HTML, alt text, focus indicators. Legal requirement plus SEO benefit.

**Should have (competitive):**
- **Metrics/results data in portfolio** — "Increased engagement 40%" > "Built engagement features". Demonstrates impact, not just implementation.
- **Platform-specific showcasing** — Flutter portfolios should highlight iOS vs Android adaptations, cross-platform efficiency, platform channel expertise. Critical for mobile consultancy positioning.
- **Response time expectation** — "Response within 24hrs" sets expectations, builds trust.
- **Case study rich snippets** — Structured data for creative works enhances search results.

**Defer (v1.2+):**
- **Blog/content section** — Requires CMS strategy, content plan, RSS feeds. High ROI but out of scope for v1.1.
- **Interactive portfolio demos** — Live Flutter web builds require hosting, add complexity. Defer until core portfolio proven.
- **Filterable portfolio** — Overkill for 2-3 projects, adds cognitive load. Wait until 5+ projects justify filtering.
- **Contact form with backend** — Formspree integration deferred to v1.2+ (50 submissions/month free tier sufficient for starting consultancy).

**Anti-features (explicitly avoid):**
- Auto-playing video/audio (accessibility issue, performance hit)
- Generic stock photos (undermines authenticity)
- "Under construction" sections (unprofessional, better to omit)
- Same visual style for all projects (suggests templated work, not custom solutions—healthcare apps should look different from food delivery)
- Live chat widget (creates 24/7 availability expectation inappropriate for consultancy)

### Architecture Approach

Research recommends a **hybrid folder structure**: retain type-based organization (`components/`, `hooks/`, `utils/`) for shared concerns, introduce feature-based organization (`features/`) for portfolio and contact sections. This balances the current 3,304-line codebase (where shared components like Header, WavyBackground, ErrorBoundary serve the entire app) with scalability for domain-specific features (portfolio and contact have their own data models and multiple subcomponents).

**Major architectural changes:**
1. **SEO infrastructure** — Wrap App with `<HelmetProvider>` at main.tsx, create reusable `<SEOHead>` component with seo.config.ts for defaults, add per-section meta tags. Move static meta tags from index.html to be managed by react-helmet-async (with caveat that GitHub Pages static hosting limits SEO benefit).
2. **Feature-based modules** — Create `src/features/portfolio/` and `src/features/contact/` with internal component hierarchies. Portfolio includes PortfolioCard, PortfolioGrid, portfolio.types.ts, portfolio.data.ts. Contact includes ContactInfo, SocialLinks, contact.data.ts. This prevents `components/` from becoming a dumping ground.
3. **Expanded code splitting** — Extend existing React.lazy pattern to new sections: lazy load PortfolioSection and ContactSection just like existing ServicesSection/AboutSection. Verify chunk separation with rollup-plugin-visualizer (already configured). Expected chunk distribution: main.js ~40-50KB, section chunks 5-20KB each.
4. **ParallaxLayer integration** — Increase TOTAL_PAGES from 3 to 5, add offset={3} for portfolio and offset={4} for contact. Incrementing speed values (0.2 → 0.6) creates depth. Update Header nav items and adjust wave color hue multiplier to maintain visual consistency across 5 pages instead of 3.

**Critical integration pattern:** When adding new animated sections, **copy cleanup patterns from existing Waves.tsx**. The codebase already handles ResizeObserver.disconnect() and cancelAnimationFrame() correctly—new components must follow this pattern to avoid memory leaks (Safari is particularly strict about garbage collection). Test memory usage in Chrome DevTools Memory Profiler during development.

**Migration path to minimize risk:** (1) Add SEO infrastructure first (isolated change, unblocks per-section SEO), (2) Build portfolio section second (validates feature-based structure), (3) Build contact section third (simpler, reuses patterns), (4) Hero extraction and directory reorganization last (cleanup tasks, not critical path). Set up TypeScript path aliases BEFORE moving any files to avoid import path explosion.

### Critical Pitfalls

Research identified 12 pitfalls across critical/moderate/minor severity. The top 5 that pose the highest risk to v1.1 success:

1. **React Helmet Theater (SEO Illusion)** — Adding react-helmet-async and believing it solves SEO for GitHub Pages static hosting. **Reality:** Crawlers see initial HTML before JavaScript executes, so client-side meta tag updates are invisible to most crawlers. **Prevention:** Use static meta tags in index.html for single-page portfolios OR prerendering service for multi-route SPAs. Test with Facebook Sharing Debugger and Twitter Card Validator BEFORE coding. **Which phase:** Phase 1 (SEO Foundation)—get this right first.

2. **Lighthouse 100 with Unoptimized Animations (The Impossible Dream)** — Trying to achieve perfect Lighthouse 100 Performance while maintaining 30fps canvas animations running on scroll. **Reality:** Lighthouse heavily weights Total Blocking Time (30% of score); canvas animations + scroll handlers + React re-renders = guaranteed long tasks >50ms. Recent evidence: "An animated HTML canvas featuring a Star Wars-like text crawl received a high CLS score from Lighthouse even though it didn't impact user-interactive components." **Prevention:** Set realistic targets (90-95 with animations is excellent, 100 requires near-zero JavaScript), optimize what matters (requestAnimationFrame cleanup, frame rate throttling, scroll debouncing), measure continuously with rollup-plugin-visualizer. **Which phase:** Phase 2 (Performance)—optimize after measuring, not before.

3. **Silent Code Splitting Failure (Circular Dependency Hell)** — Implementing React.lazy, seeing it work in dev, then discovering production bundles contain duplicate code with NO visible errors. **Reality:** Circular dependencies are silent (no build errors), tree-shaking breaks quietly, bundle size increases mysteriously. 2026 case study: 800+ circular dependencies caused bundle to balloon from ~17MB to <5MB after refactoring, Lighthouse jumped from 49 to 72. **Prevention:** Check for circular dependencies with `npx madge --circular` BEFORE code splitting, visualize dependencies with rollup-plugin-visualizer, follow component import hierarchy (Sections → Components → Hooks → Utils). **Which phase:** Phase 3 (Code Splitting)—check before implementing lazy loading.

4. **Directory Reorganization Import Explosion** — Reorganizing src/ directory structure to follow best practices, then spending hours fixing hundreds of broken import paths. **Reality:** Relative imports couple file location to import statements; moving files cascades to all importers. **Prevention:** Use TypeScript path aliases FIRST (tsconfig.json baseUrl + paths, vite.config.ts resolve.alias), reorganize in stages (add aliases → update imports → move files → verify build), limit nesting depth to 3-4 levels. **Which phase:** Phase 3 (Architecture)—set up aliases before moving files.

5. **ResizeObserver + requestAnimationFrame Memory Leak Cascade** — Adding new animated sections with ResizeObserver for responsive sizing, seeing it work, then noticing memory usage grow during development with HMR. **Reality:** Observers and animation frames persist after unmount unless explicitly cleaned up. Safari has specific bugs with ResizeObserver + useState causing components to never be garbage collected. **Prevention:** Copy cleanup pattern from existing Waves.tsx (observer.disconnect() and cancelAnimationFrame() in useEffect return), test memory usage in Chrome DevTools Memory Profiler, test on Safari. **Which phase:** Phase 2 (Performance) and Phase 4 (New Features)—enforce pattern when adding sections.

**Additional pitfall to watch:** GitHub Pages SPA routing 404 hell—direct navigation to routes returns 404 on static hosting. For this single-page portfolio with scroll-based navigation, **recommendation is to NOT use React Router**. If routing is added later, use hash-based navigation (`/#about`) or the 404.html redirect hack.

## Implications for Roadmap

Based on combined research, the suggested phase structure prioritizes **foundational work (SEO, architecture) before feature expansion (portfolio, contact)** to avoid rework. Critical insight: SEO and architecture changes touch all sections, so getting them right first prevents breaking existing features when adding new ones.

### Phase 1: SEO Foundation & Build Infrastructure

**Rationale:** SEO infrastructure affects all sections and must be established before building portfolio/contact (otherwise requires retrofitting meta tags). Build-time optimizations (sitemap, compression) are zero-risk additions that improve Lighthouse immediately.

**Delivers:**
- react-helmet-async integration with HelmetProvider wrapper
- Reusable SEOHead component with seo.config.ts defaults
- Build-time sitemap.xml and robots.txt generation (vite-plugin-sitemap)
- Brotli + gzip pre-compression (vite-plugin-compression2)
- Manual chunk configuration for vendor code splitting
- Verified baseline Lighthouse score (measure before optimizing)

**Addresses features:**
- Dynamic meta tags per section (FEATURES.md table stakes)
- Sitemap and robots.txt (FEATURES.md table stakes)
- Performance optimization baseline (FEATURES.md table stakes)

**Avoids pitfalls:**
- Pitfall 1 (React Helmet Theater) — Test SEO with actual crawlers FIRST, understand GitHub Pages constraints
- Pitfall 9 (Vite Build Base Path) — Verify GitHub Pages URL structure and vite.config.ts base setting

**Estimated complexity:** Low-Medium | 2-4 hours
**Research needs:** None—standard patterns, well-documented

---

### Phase 2: Portfolio Section Implementation

**Rationale:** Portfolio demonstrates core value proposition (Flutter expertise) and validates feature-based folder structure before building contact section. More complex feature (multiple subcomponents, data models) so tackle first while energy is high.

**Delivers:**
- Feature-based folder structure: `src/features/portfolio/`
- Portfolio data model (portfolio.types.ts, portfolio.data.ts with 2-3 projects)
- PortfolioCard component (project image, title, tech stack tags, description, links)
- PortfolioGrid component (responsive CSS grid layout)
- PortfolioSection lazy-loaded component
- ParallaxLayer integration at offset={3}
- SEO metadata for portfolio section
- Structured data (JSON-LD) for creative works schema

**Addresses features:**
- 2-3 case studies with Problem → Solution → Results (FEATURES.md table stakes)
- Project screenshots and App Store links (FEATURES.md table stakes)
- Technologies used and role/responsibilities (FEATURES.md table stakes)
- Platform-specific showcasing for Flutter projects (FEATURES.md differentiator)

**Avoids pitfalls:**
- Pitfall 4 (Directory Reorganization) — Set up TypeScript path aliases BEFORE creating features/ directory
- Pitfall 11 (Parallax Z-Index) — Document layer structure, test scroll behavior immediately

**Estimated complexity:** Medium | 8-12 hours (mostly content work)
**Research needs:** None—component patterns established, content may need gathering

---

### Phase 3: Contact Section Implementation

**Rationale:** Simpler feature than portfolio (fewer components), reuses patterns established in Phase 2. Conversion mechanism needed before site is truly "launched." Can be built in parallel with portfolio if multiple developers.

**Delivers:**
- Feature-based folder structure: `src/features/contact/`
- Contact data model (contact.data.ts with email, social links)
- ContactInfo component (copyable email with clipboard API)
- SocialLinks component (GitHub, LinkedIn, Twitter with icons)
- ContactSection lazy-loaded component
- ParallaxLayer integration at offset={4}
- SEO metadata for contact section
- WCAG 2.2 AA compliance (labels, keyboard nav, ARIA)

**Addresses features:**
- Contact email and clear CTA (FEATURES.md table stakes)
- Social media links (FEATURES.md differentiator)
- Accessible contact mechanism (FEATURES.md table stakes)
- Response time expectation (FEATURES.md differentiator)

**Avoids pitfalls:**
- Pitfall 7 (GitHub Pages SPA Routing) — Use hash-based navigation or scroll-to-section, NOT React Router

**Estimated complexity:** Low-Medium | 4-6 hours
**Research needs:** None—standard patterns, static-friendly solutions documented

---

### Phase 4: Architecture Optimization & Code Splitting

**Rationale:** After new sections exist, optimize bundle structure and verify Lighthouse score. Measuring after features are built reveals actual optimization opportunities (premature optimization wastes time).

**Delivers:**
- Lazy loading for all sections (portfolio, contact, existing services/about)
- Manual chunks in vite.config.ts for vendor code separation
- Bundle analysis with rollup-plugin-visualizer verification
- Circular dependency check with madge
- Memory leak verification (Chrome DevTools Memory Profiler + Safari testing)
- Lighthouse audit and iteration (target 90-95 Performance)
- Core Web Vitals measurement (LCP < 2.5s, INP < 200ms, CLS < 0.1)

**Uses stack:**
- React.lazy and Suspense (already in use, extend to new sections)
- rollup-plugin-visualizer (already configured)
- Vite automatic tree-shaking and chunk optimization

**Implements architecture:**
- Code splitting boundaries from ARCHITECTURE.md
- Chunk distribution verification (main <50KB gzip, sections <20KB each)

**Avoids pitfalls:**
- Pitfall 2 (Lighthouse 100 Impossible Dream) — Set realistic targets (90-95), measure TBT specifically
- Pitfall 3 (Circular Dependencies) — Check with madge BEFORE optimizing
- Pitfall 10 (Bundle Analyzer Misinterpretation) — Focus on brotli sizes, optimize images/structure not libraries

**Estimated complexity:** Medium | 6-8 hours
**Research needs:** None IF bundle is clean. If circular dependencies found, may need refactoring research.

---

### Phase 5: Design Polish & Accessibility Verification

**Rationale:** Final polish after architecture and features are stable. Accessibility issues easier to fix when component structure is finalized. Visual refinement requires all sections to exist for consistency checking.

**Delivers:**
- WCAG 2.2 AA compliance verification across all sections
- Color contrast verification (all text >=4.5:1)
- Keyboard navigation testing (Tab, Enter, Arrow keys work everywhere)
- Focus indicators on all interactive elements
- Alt text for all images (descriptive, not generic)
- Hover/focus states for all buttons and links
- Loading states for lazy-loaded sections
- Error states for contact form (if added in v1.2)
- Dark/light theme verification for new sections
- Responsive layout verification (mobile, tablet, desktop)
- Reduced motion support (verify new sections respect usePrefersReducedMotion)

**Addresses features:**
- WCAG 2.2 AA compliance (FEATURES.md table stakes)
- Mobile-responsive verification (FEATURES.md table stakes)
- Semantic HTML (FEATURES.md table stakes)

**Avoids pitfalls:**
- Catching accessibility issues late (expensive to fix in components, cheap to fix in CSS)

**Estimated complexity:** Low-Medium | 4-6 hours
**Research needs:** None—WCAG 2.2 AA guidelines documented, existing codebase follows good patterns

---

### Phase Ordering Rationale

**Why this sequence:**
1. **SEO/Build first** because it touches all sections—doing it last means retrofitting every component. Build-time optimizations (sitemap, compression) are low-risk, high-impact wins.
2. **Portfolio before Contact** because it's more complex (validates feature-based structure) and has higher content gathering overhead (need 2-3 case studies ready).
3. **Architecture optimization AFTER features** because premature optimization wastes time—actual bundle structure reveals optimization opportunities.
4. **Design polish last** because consistency checking requires all sections to exist, and accessibility fixes are easier when component structure is stable.

**Dependency chains:**
- SEO infrastructure → All sections (metadata requirements)
- TypeScript path aliases → Directory reorganization (import path stability)
- Feature-based structure (portfolio) → Contact section (reuses patterns)
- All sections built → Code splitting verification (actual chunks to analyze)
- Component structure finalized → Accessibility polish (fewer refactors)

**Parallel work opportunities:**
- Portfolio and Contact sections can be built simultaneously (no dependencies)
- SEO component can be built while sections are in progress (used when they're ready)
- Content gathering (case studies, social links) can happen throughout all phases

**How this avoids pitfalls:**
- Phase 1 addresses Pitfall 1 (SEO Theater) by testing with actual crawlers upfront
- Phase 3 addresses Pitfall 4 (Import Explosion) by setting up aliases before reorganizing
- Phase 4 addresses Pitfall 3 (Circular Dependencies) by checking BEFORE code splitting
- Phase 5 catches accessibility issues before launch (cheaper than post-launch fixes)

### Research Flags

**Phases needing deeper research during planning:**
- **NONE for v1.1** — All phases use established patterns with strong documentation. SEO, React lazy loading, parallax integration, and accessibility verification are well-documented domains with high research confidence.

**Phases with standard patterns (skip /gsd:research-phase):**
- **Phase 1 (SEO Foundation):** react-helmet-async integration, vite plugin configuration, sitemap generation—official documentation sufficient
- **Phase 2 (Portfolio):** React component patterns, lazy loading, CSS Grid layouts—standard React practices
- **Phase 3 (Contact):** Static-friendly contact solutions, copyable email patterns—documented in Features research
- **Phase 4 (Architecture):** Code splitting, bundle analysis, circular dependency checking—Vite and React official docs sufficient
- **Phase 5 (Design Polish):** WCAG 2.2 AA guidelines, accessibility testing—W3C official resources available

**When research IS recommended:**
- IF circular dependencies found in Phase 4 → Research refactoring strategies for specific dependency chains
- IF Lighthouse score stuck below 90 despite optimizations → Research performance profiling and bottleneck identification
- IF v1.2+ adds backend form integration → Research Formspree vs Netlify Forms vs custom backend

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | react-helmet-async, vite plugins verified via npm/GitHub, weekly download metrics confirm adoption. Existing stack (React 18 + Vite 5.4.1) is fundamentally sound. GitHub Pages Brotli support confirmed via official docs. |
| Features | MEDIUM-HIGH | Portfolio and SEO best practices verified across 10+ sources (2025-2026 dates). Flutter-specific portfolio guidance from Medium/dev.to. Contact form options compared across multiple providers. Some feature ROI predictions lack project-specific data. |
| Architecture | HIGH | Hybrid folder structure recommended by multiple 2026 sources (Robin Wieruch, dev.to). Code splitting patterns verified via official Vite and React docs. Parallax integration confirmed via react-spring official docs. Existing codebase analysis shows correct cleanup patterns. |
| Pitfalls | HIGH | Critical pitfalls (SEO Theater, Lighthouse 100, Circular Dependencies) verified via recent 2026 case studies with measurable impact. Memory leak patterns confirmed via Safari bug reports. GitHub Pages SPA routing limitations documented in official GitHub community discussions. |

**Overall confidence:** HIGH

Research synthesized from 50+ sources across official documentation (Vite, React Spring, W3C), recent case studies (2026), and community best practices. All recommended technologies have 2+ years of production use and active maintenance (verified via npm weekly downloads and GitHub activity). Existing codebase analysis confirms cleanup patterns are correct (ResizeObserver, requestAnimationFrame).

### Gaps to Address

**Content readiness:**
- Portfolio section requires 2-3 case studies to be written (Problem → Solution → Results narrative)
- Need to verify App Store links are available or obtain client permission for public linking
- Social media links for contact section (GitHub, LinkedIn, Twitter) need to be provided
- May need metrics/results data from past projects (requires client permission for sharing)

**Decision points during implementation:**
- Whether to self-host logo (currently external GitHub link) — saves 200-300ms DNS lookup but requires asset management
- Whether to upgrade Vite 5.4.1 to 6.0+ — 70% build time reduction but introduces small risk of breaking changes (low likelihood, backward compatible for client-only apps)
- How many portfolio projects to launch with (2-3 recommended, more requires filtering UI deferred to v1.2+)
- Whether to add Calendly integration in contact section (low complexity, depends on business model)

**Testing validation needed:**
- Actual Lighthouse score with animations (research predicts 90-95, need to verify with real build)
- Memory usage during extended dev sessions with HMR (Safari particularly strict about garbage collection)
- Social media preview appearance (must test with Facebook Sharing Debugger and Twitter Card Validator)
- Bundle size after code splitting (visualizer will reveal actual chunk distribution)

**Documentation gaps:**
- Real-world INP (Interaction to Next Paint) requires user testing with real devices—can't be simulated
- GitHub Pages Brotli compression behavior requires production deployment to verify (works in theory per docs, need to confirm in practice)
- Cross-browser ResizeObserver behavior (Safari 13.1 has known leak bug, need to verify if still present in 2026 versions)

**All gaps are addressable during implementation—none block roadmap creation.**

## Sources

### Primary (HIGH confidence)

**Official Documentation:**
- [Vite Features and Build Optimization](https://vite.dev/guide/features) — Tree-shaking, code splitting, build configuration
- [React Spring Parallax Component](https://react-spring.dev/docs/components/parallax) — Offset, speed, scroll event handling
- [React Official lazy() Docs](https://react.dev/reference/react/lazy) — Code splitting patterns
- [W3C WAI Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/) — WCAG 2.2 AA compliance for forms
- [Chrome Lighthouse Performance Scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring) — How Lighthouse calculates scores, TBT weighting

**Verified Package Sources:**
- [react-helmet-async npm](https://www.npmjs.com/package/react-helmet-async) — 2.1M weekly downloads, version 2.0.5 confirmed
- [vite-plugin-sitemap npm](https://www.npmjs.com/package/vite-plugin-sitemap) — 0.8.2, published June 2025
- [vite-plugin-compression2 npm](https://www.npmjs.com/package/vite-plugin-compression2) — Brotli + gzip pre-compression
- [vite-imagetools npm](https://www.npmjs.com/package/vite-imagetools) — 9.0.2, published Dec 2025
- [schema-dts npm](https://www.npmjs.com/package/schema-dts) — Google-maintained TypeScript definitions

### Secondary (MEDIUM-HIGH confidence)

**Recent Case Studies (2026):**
- [Why React Apps Felt Slow - Circular Dependencies Case Study](https://medium.com/@tshrgarg2010/why-my-react-app-felt-slow-even-though-nothing-was-broken-2f1b6c65b975) — 800+ circular dependencies, bundle 17MB → <5MB, Lighthouse 49 → 72
- [How Checkly Achieved 100% Lighthouse Score](https://www.checklyhq.com/blog/how-we-got-a-100-lighthouse-performance-score-for-our-vue-js-app/) — Vue.js but patterns apply to React

**Architecture Best Practices (2025-2026):**
- [React Folder Structure in 5 Steps](https://www.robinwieruch.de/react-folder-structure/) — Hybrid approach for medium apps
- [Feature-Based vs Type-Based Structure](https://asrulkadir.medium.com/3-folder-structures-in-react-ive-used-and-why-feature-based-is-my-favorite-e1af7c8e91ec) — Why feature-based scales
- [React Architecture Patterns 2026](https://www.bacancytechnology.com/blog/react-architecture-patterns-and-best-practices) — Component patterns, compound components

**SEO & Performance:**
- [React SEO Best Practices: SPAs](https://www.dheemanthshenoy.com/blogs/react-seo-best-practices-spa) — 2026 guide
- [SEO for React Applications: SSR, Performance & Rankings](https://www.linkgraph.com/blog/seo-for-react-applications/) — 2026 guide
- [react-helmet-async vs react-helmet Comparison](https://www.thatsoftwaredude.com/content/14126/react-helmet-vs-react-helmet-async) — Thread-safety, React 18 compatibility

**Portfolio Best Practices:**
- [How to Write UX/UI Design Case Studies](https://www.interaction-design.org/literature/article/how-to-write-great-case-studies-for-your-ux-design-portfolio) — Problem → Solution → Results structure
- [Mobile App Developer Portfolio Analysis](https://thisisglance.com/blog/mobile-app-developer-portfolio-analysis-decode-the-warning-signs) — Platform-specific showcasing importance
- [Building a Flutter Portfolio](https://medium.com/@punithsuppar7795/building-a-flutter-portfolio-showcasing-niche-projects-like-plugins-desktop-apps-and-ml-1774447dcd16) — Flutter-specific considerations

### Tertiary (MEDIUM confidence)

**Community Consensus:**
- Multiple dev.to articles on React code splitting (2025-2026) — Consistent recommendations for lazy loading sections
- GeeksforGeeks Vite image optimization — Basic patterns verified
- CSS-Tricks static form provider comparison — Formspree, Netlify Forms, Google Forms pros/cons
- LogRocket React SEO structured data guide — JSON-LD implementation patterns

**GitHub Issues & Discussions:**
- [React issue #19131: Safari ResizeObserver leak bug](https://github.com/facebook/react/issues/19131) — Confirms useState + ResizeObserver memory leak
- [react-spring issue #771: Parallax scroll events](https://github.com/react-spring/react-spring/issues/771) — Parallax container vs window scroll
- [GitHub Pages SPA routing limitations](https://github.com/orgs/community/discussions/64096) — 404.html workaround documented

---

*Research completed: 2026-02-04*
*Ready for roadmap: YES*
