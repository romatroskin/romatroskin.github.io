# Phase 12: Final Cleanup & Publish Prep - Context

**Gathered:** 2026-02-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Prepare the codebase for public launch — clean up unused code, extract Home section from App.tsx, resolve all lint errors/warnings, and ensure build/test/deploy pipeline passes. This is cleanup and polish, not new features.

</domain>

<decisions>
## Implementation Decisions

### Contact button styling
- Size, position, visual style: Claude's discretion based on design consistency
- Loading state feedback: Claude verifies current behavior and improves if needed
- Mobile behavior: Claude picks mobile-friendly approach based on touch targets

### Cleanup thoroughness
- Commented-out code: Claude removes obvious dead code, keeps anything with useful context
- Coverage files (coverage/ folder): Claude follows standard practice for generated files
- Unused test utilities: Claude removes clearly orphaned files, keeps reusable utilities
- Console logs: Claude removes debug logs, keeps intentional user-facing messages

### Refactoring boundaries
- Component naming: Claude picks based on what the component actually contains
- App.tsx scope: Claude extracts what improves maintainability
- File location: Claude follows established project patterns (likely src/components/sections/)
- Test files: Claude maintains test coverage in most appropriate way

### Lint resolution approach
- **Fix all 17 errors directly** — no eslint-disable suppressions
- **Fix all 2 warnings** — zero errors, zero warnings target
- Complex fixes: Claude assesses impact and makes pragmatic choice
- ESLint config: Claude assesses if current rules are appropriate

### Claude's Discretion
- Contact button visual details (size, color, loading states, mobile breakpoints)
- Dead code removal judgment calls
- Coverage and generated file handling
- Component extraction naming and placement
- Test organization after refactoring
- ESLint config adjustments if beneficial

</decisions>

<specifics>
## Specific Ideas

- User wants a clean slate: zero lint errors, zero warnings
- Direct fixes preferred over suppressions
- Follow established patterns for component organization

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 12-final-cleanup*
*Context gathered: 2026-02-04*
