# Phase 1: Foundation & Cleanup - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish testing infrastructure (Vitest) and fix critical bugs that actively break user experience. This includes removing dead code, fixing TypeScript issues, removing lodash dependency, and stabilizing wave animations. Does NOT include new features, UI changes beyond menu rewrite, or component architecture changes (Phase 2).

</domain>

<decisions>
## Implementation Decisions

### Test Organization
- Co-located tests: `Component.tsx` → `Component.test.tsx` in same directory
- Naming pattern: `*.test.tsx` (standard Vitest/Jest convention)
- Coverage target: 60% overall baseline
- Snapshot testing: Claude's discretion based on component complexity

### Cleanup Scope
- Dead code removal: Thorough — remove all unused exports, commented code blocks, dead imports
- Quotes component: Remove entirely — delete component and all references
- TypeScript: Fix all `@ts-expect-error` comments with proper types
- Console statements: Remove all `console.*` and add ESLint rule (error level)

### PureCSS Fate
- Decision: Remove PureCSS entirely from the project
- Replacement: CSS Modules for header menu (aligns with Phase 4 CSS organization)
- Visual design: Minor polish allowed while preserving structure
- Mobile menu: Claude's discretion based on current mobile behavior (stub or basic toggle)

### Logging Strategy
- Production logging: None — clean production output
- Console removal: Remove ALL `console.*` (log, error, warn) — Error Boundaries in Phase 6
- ESLint enforcement: Error level — build fails if console.* appears in src/
- Library warnings: Claude's discretion for node_modules handling

### Claude's Discretion
- Snapshot testing approach for specific components
- Mobile menu implementation (stub vs basic hamburger)
- Library console warning handling in ESLint config
- Exact PureCSS replacement patterns for menu states

</decisions>

<specifics>
## Specific Ideas

- ESLint no-console rule should be strict (error level) to prevent future additions
- Keep the project clean — "might need later" is not a reason to keep dead code
- CSS Modules choice positions codebase for Phase 4 CSS organization work

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-cleanup*
*Context gathered: 2026-02-03*
