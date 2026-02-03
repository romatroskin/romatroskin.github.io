# Phase 2: Component Architecture - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Migrate Wave class component to functional component with custom hooks (usePerlinNoise, useAnimationFrame) for better testability and react-spring integration. Both Wave and WavyBackground can be modified. This is a refactoring phase — no new user-facing features.

</domain>

<decisions>
## Implementation Decisions

### Hook API design
- Claude's discretion on noise API exposure (function vs pre-computed)
- Claude's discretion on animation timing (internal vs external control)
- Claude's discretion on reusability vs Wave-specific optimization
- Claude's discretion on hook file location (src/hooks/ vs co-located)

### Visual parity verification
- Manual review by developer to verify visual equivalence
- Accept improvements — if new version looks better/smoother, that's acceptable (no regressions)
- Claude's discretion on keeping old code temporarily during migration

### Component API preservation
- Both Wave and WavyBackground can change if it improves the codebase
- Claude's discretion on prop interface changes
- Claude's discretion on exposing new functionality via props
- Claude's discretion on TypeScript type improvements

### Test coverage approach
- Both unit tests for hooks AND integration tests through component
- Verify animation runs at 30fps target rate
- Add smoke tests for App, Header, WavyBackground in this phase
- Claude's discretion on snapshot tests for SVG output

### Claude's Discretion
- Hook API design choices (function vs pre-computed, timing control, reusability, location)
- Whether to keep old class component during migration
- Prop interface simplification opportunities
- New functionality exposure if hooks enable it naturally
- TypeScript type improvements
- Snapshot testing decisions

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for class-to-functional migration.

Key constraint: Manual visual review is the verification method, not automated visual regression.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-component-architecture*
*Context gathered: 2026-02-03*
