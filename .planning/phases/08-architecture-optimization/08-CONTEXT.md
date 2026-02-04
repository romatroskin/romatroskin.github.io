# Phase 8: Architecture Optimization - Context

**Gathered:** 2026-02-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Reorganize source code into a maintainable structure, configure TypeScript path aliases, and clean up dependencies. This phase restructures existing code — no new features or functionality.

</domain>

<decisions>
## Implementation Decisions

### Folder Structure
- Sections stay as components: `components/sections/Hero/`, `components/sections/Services/`, etc.
- Animation components grouped: `components/animation/` (Perlin, Waves, WavyBackground)
- UI primitives separated: `components/ui/` (Header, buttons, links)
- Styles co-located: each component folder contains its component file + CSS module

### Path Aliases
- Configure tsconfig for IDE auto-imports to prefer aliases
- Hooks centralized: all hooks in `hooks/` folder, even single-use hooks
- Utilities centralized: all utility functions in `utils/` folder

### Dependencies
- Run depcheck and update dependencies as part of this phase
- Remove unused dependencies (e.g., focus-trap-react noted in STATE.md)

### Claude's Discretion
- Path alias naming convention (@/components vs @components)
- Alias scope (everywhere vs cross-folder only)
- Additional aliases beyond standard folders
- Whether features/ folder is appropriate for this codebase
- Feature folder contents structure
- Commit strategy (atomic vs incremental)
- Order of changes (folders first vs aliases first)
- Dependency update strategy (patch/minor vs latest)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for React/TypeScript project organization.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-architecture-optimization*
*Context gathered: 2026-02-04*
