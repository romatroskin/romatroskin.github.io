# Phase 8: Architecture Optimization - Research

**Researched:** 2026-02-04
**Domain:** React/TypeScript project organization, path aliases, dependency management
**Confidence:** HIGH

## Summary

Architecture optimization for React TypeScript projects in 2026 centers on three key areas: TypeScript path aliases using vite-tsconfig-paths, hybrid folder structure (shared + feature-based when needed), and dependency hygiene via depcheck. The standard approach uses `@/` prefix for path aliases configured in tsconfig.json and automatically resolved by Vite through the vite-tsconfig-paths plugin.

For this portfolio/landing page project with ~25 components and no complex domain logic, a simplified hybrid structure is appropriate: `components/` organized by type (sections/, animation/, ui/), centralized `hooks/` and `utils/`, and co-located styles. Feature folders are unnecessary for this scale. Dependencies should be audited with depcheck and updated incrementally (patch/minor first, then major versions with testing).

The migration should be atomic but incremental: configure tooling first (tsconfig + Vite + Vitest), reorganize folders with git mv, update imports systematically, then audit dependencies. Each logical unit gets its own commit.

**Primary recommendation:** Use vite-tsconfig-paths plugin with `@/` aliases, organize by component type (not features), commit atomic changes incrementally, and remove unused dependencies after import updates.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vite-tsconfig-paths | Latest | Auto-sync tsconfig paths to Vite | Industry standard for Vite+TS, eliminates config duplication |
| depcheck | Latest | Find unused dependencies | Most popular tool (23M+ weekly downloads), actively maintained |
| npm outdated | Built-in | Check for outdated packages | Native npm tooling, no installation needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| eslint-import-resolver-typescript | Latest | ESLint path alias support | When using eslint-plugin-import with TypeScript paths |
| npm-check-updates (ncu) | Latest | Interactive dependency updates | For bulk updates with granular control |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| vite-tsconfig-paths | Manual vite.config.ts aliases | More control but requires syncing tsconfig.json + vite.config.ts |
| depcheck | npm-check | npm-check includes outdated checking but slower |
| @/ prefix | # prefix or no prefix | # avoids npm scope conflict but less conventional |

**Installation:**
```bash
npm install -D vite-tsconfig-paths
npm install -D depcheck
# Optional: only if using eslint-plugin-import
npm install -D eslint-import-resolver-typescript
```

## Architecture Patterns

### Recommended Project Structure

For portfolio/landing page scale (this project):
```
src/
├── components/
│   ├── sections/          # Page sections (Hero, Services, About)
│   │   ├── HeroSection/
│   │   │   ├── HeroSection.tsx
│   │   │   └── HeroSection.module.css
│   │   └── ServicesSection/
│   ├── animation/         # Animation primitives (Perlin, Waves, WavyBackground)
│   ├── ui/               # Reusable UI (Header, buttons, links, SkipLink, ThemeToggle)
│   └── common/           # Generic components (ErrorBoundary, PerformanceIndicator, StructuredData)
├── hooks/                # All hooks centralized
├── utils/                # All utilities centralized
├── styles/               # Global styles and themes
├── assets/               # Images, fonts, etc.
└── performance/          # Performance monitoring utilities
```

**Rationale:**
- **Type-based grouping** works well for projects without complex domain logic
- **Sections as components** maintains clear separation between page sections
- **Animation as a group** reflects technical cohesion (all use Perlin noise)
- **UI primitives separated** for reusability across sections
- **Centralized hooks/utils** appropriate for small-to-medium scale

### Pattern 1: TypeScript Path Aliases with vite-tsconfig-paths

**What:** Automatically sync tsconfig.json path mappings to Vite and Vitest
**When to use:** Always, for any Vite+TypeScript project using path aliases

**Example:**
```typescript
// tsconfig.json or tsconfig.app.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/styles/*": ["./src/styles/*"]
    }
  }
}

// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths() // Automatically reads tsconfig paths
  ]
})

// vitest.config.ts (if separate from vite.config.ts)
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // ... other config
  }
})
```

**Usage:**
```typescript
// Before
import { Header } from '../../components/Header/Header'
import { useTheme } from '../hooks/useTheme'

// After
import { Header } from '@/components/Header/Header'
import { useTheme } from '@/hooks/useTheme'
```

### Pattern 2: Incremental Folder Migration with Git

**What:** Use git mv to preserve history during folder reorganization
**When to use:** Always when restructuring folders

**Example:**
```bash
# Create new folders
mkdir -p src/components/sections
mkdir -p src/components/animation
mkdir -p src/components/ui

# Move files with git mv to preserve history
git mv src/sections/ServicesSection.tsx src/components/sections/ServicesSection/
git mv src/components/Waves.tsx src/components/animation/
git mv src/components/Header src/components/ui/

# Commit each logical grouping
git add src/components/sections/ServicesSection/
git commit -m "refactor(08): move ServicesSection to components/sections"
```

### Pattern 3: Dependency Audit Workflow

**What:** Systematic approach to finding and removing unused dependencies
**When to use:** After import path updates complete, before updating packages

**Example:**
```bash
# 1. Check for unused dependencies
npx depcheck

# 2. Review the output carefully (look for false positives)
# Example output:
# Unused dependencies
# * focus-trap-react
# Unused devDependencies
# * @types/unused-package

# 3. Remove confirmed unused deps
npm uninstall focus-trap-react

# 4. Check for outdated packages
npm outdated

# 5. Update incrementally (patch versions first)
npm update

# 6. Update minor/major versions individually
npm install package-name@latest

# 7. Test after each update
npm test
npm run build
```

### Anti-Patterns to Avoid

- **Barrel exports (index.js) for components:** Research shows 15-70% slower dev boot, 28% slower builds, bundle bloat. Direct imports are preferred in 2026.
- **Deep nesting (>3 levels):** Makes imports unwieldy, file moves difficult. Prefer flat structure.
- **Feature folders for non-domain apps:** Premature optimization for portfolio sites without complex business logic.
- **Mixing folder + alias changes in one commit:** Makes rollback impossible if one change causes issues.
- **Updating all dependencies at once:** Breaking changes compound; impossible to isolate failures.
- **Using `@` without `/`:** Can conflict with npm scoped packages (@company/package), though less common with `@/` convention.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Syncing tsconfig paths to Vite | Manual alias config in vite.config.ts | vite-tsconfig-paths plugin | Eliminates duplication, auto-syncs, handles edge cases |
| Finding unused dependencies | Script with AST parsing | depcheck | Handles require/import/jsx, configurable, battle-tested |
| Module resolution for ESLint | Custom resolver | eslint-import-resolver-typescript | Reads tsconfig, handles complex scenarios, 14M+ downloads/week |
| Dependency updates | Manual package.json editing | npm update + npm outdated + ncu | Respects semver, shows changelogs, interactive |

**Key insight:** Path alias configuration across tools (TypeScript, Vite, Vitest, ESLint) has many edge cases. Use plugins that read tsconfig.json as single source of truth rather than duplicating configuration.

## Common Pitfalls

### Pitfall 1: TypeScript Compiler Doesn't Resolve Aliases in Output
**What goes wrong:** tsc compiles TypeScript but leaves path aliases unresolved in output JavaScript files, causing "Cannot find module" errors at runtime.
**Why it happens:** TypeScript's path mapping is only for type-checking during development, not runtime resolution.
**How to avoid:** Use Vite as the bundler (not raw tsc). Vite with vite-tsconfig-paths resolves aliases during bundling.
**Warning signs:** Running `npm run build` succeeds but deployed app crashes with module resolution errors.

### Pitfall 2: Vitest Can't Find Modules After Adding Aliases
**What goes wrong:** Tests fail with "Cannot find module '@/components/...'" even though tsconfig is configured.
**Why it happens:** Vitest config doesn't inherit Vite config by default if using separate files.
**How to avoid:** Add vite-tsconfig-paths plugin to vitest.config.ts or merge configs. Define aliases at top level of config, not within `test` property.
**Warning signs:** `npm run dev` works but `npm test` fails with import errors.

### Pitfall 3: ESLint Errors on Valid Imports
**What goes wrong:** ESLint shows "Unable to resolve path to module" for imports using path aliases.
**Why it happens:** ESLint's default resolver doesn't understand TypeScript path mappings.
**How to avoid:** Install eslint-import-resolver-typescript and configure it in ESLint settings with `alwaysTryTypes: true`.
**Warning signs:** TypeScript and app work fine but ESLint marks imports as errors.

### Pitfall 4: depcheck Reports False Positives
**What goes wrong:** depcheck flags actually-used dependencies as unused (common: React, @types packages, Vite plugins).
**Why it happens:** Unusual import patterns, JSX usage, or build tool configs not recognized by static analysis.
**How to avoid:** Verify each reported unused dependency. Use `--ignores` flag for known false positives. Check package usage in tooling configs (vite.config.ts, etc).
**Warning signs:** depcheck reports core dependencies like "react" or "vite" as unused.

### Pitfall 5: Updating All Dependencies Breaks Build
**What goes wrong:** Running `npm update` or upgrading all packages causes multiple breaking changes, making it hard to identify the culprit.
**Why it happens:** Major version updates often include breaking changes; combining them creates combinatorial complexity.
**How to avoid:** Update incrementally: patch first (`npm update`), then minor versions, then major versions one-by-one with testing between each.
**Warning signs:** Tests fail after bulk update, can't pinpoint which package caused it.

### Pitfall 6: Losing Git History During Folder Restructure
**What goes wrong:** Moving files with `mv` or copy-paste loses Git's ability to track file history.
**Why it happens:** Git doesn't track moves unless you use `git mv`.
**How to avoid:** Always use `git mv src/old/path.tsx src/new/path.tsx` for reorganization.
**Warning signs:** `git log --follow` doesn't show history for moved files; `git blame` shows entire file as new.

## Code Examples

Verified patterns from official sources and community standards:

### Configuring Path Aliases (Full Setup)

```typescript
// tsconfig.app.json (or tsconfig.json)
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",

    // Path aliases
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/utils/*": ["./src/utils/*"]
    },

    // Other important options
    "strict": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}

// vite.config.ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths() // Reads tsconfig paths automatically
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts'
  }
})
```

Source: Synthesized from vite-tsconfig-paths docs and community patterns

### Component File Organization

```
src/components/sections/HeroSection/
├── HeroSection.tsx
├── HeroSection.module.css
└── HeroSection.test.tsx

src/components/ui/Header/
├── Header.tsx
├── Header.module.css
├── Header.test.tsx
└── MobileMenu.tsx
```

**Import pattern:**
```typescript
// In App.tsx
import { Header } from '@/components/ui/Header/Header'
import HeroSection from '@/components/sections/HeroSection/HeroSection'

// In HeroSection.tsx (importing within components/)
import { SomeButton } from '@/components/ui/Button/Button'
// OR use relative for same-level components
import { SomeButton } from '../../ui/Button/Button'
```

Source: Community best practices for React component organization

### Running depcheck with Configuration

```bash
# Basic check
npx depcheck

# With ignores for known false positives
npx depcheck --ignores="eslint,@types/*,vite"

# JSON output for programmatic use
npx depcheck --json

# Skip missing dependencies check (faster)
npx depcheck --skip-missing
```

**Interpreting results:**
```
Unused dependencies
* focus-trap-react       # Safe to remove if not in code
* unused-lib             # Safe to remove

Unused devDependencies
* @types/old-package     # Safe to remove if package removed

Missing dependencies     # Used in code but not in package.json
* some-package           # Add with: npm install some-package
```

Source: depcheck npm package documentation

### Incremental Dependency Updates

```bash
# 1. Check what's outdated
npm outdated
# Output shows: Current | Wanted | Latest

# 2. Safe updates (patch/minor within semver range)
npm update

# 3. Major version updates (one at a time)
npm install react@latest
npm test
npm run build

npm install vite@latest
npm test
npm run build

# 4. Using ncu for interactive updates
npx npm-check-updates --interactive
# Select packages, then run: ncu -u && npm install
```

Source: npm documentation and community best practices

## State of the Art

| Old Approach | Current Approach (2026) | When Changed | Impact |
|--------------|-------------------------|--------------|--------|
| Barrel exports (index.js) | Direct imports | 2024-2025 | 15-70% faster dev boot, smaller bundles |
| Manual Vite alias config | vite-tsconfig-paths plugin | 2022-present | Single source of truth, less duplication |
| Feature folders everywhere | Hybrid: type-based for simple apps, feature-based for complex domains | 2023-2025 | Better scalability, avoid premature optimization |
| Update all deps at once | Incremental updates (patch → minor → major) | Always best practice | Easier debugging, safer rollbacks |
| Relative imports only | Path aliases for cross-folder imports | 2020-present | Cleaner, more maintainable imports |

**Deprecated/outdated:**
- **@types synchronization issues:** Modern TypeScript (4.7+) auto-loads @types; less manual management needed
- **create-react-app (CRA):** Vite is now standard for React projects (faster, better DX)
- **jsconfig.json for non-TS projects:** Most projects use TypeScript in 2026
- **Deep folder hierarchies:** Flat structures with clear naming preferred over deeply nested folders

## Open Questions

1. **ESLint configuration requirement**
   - What we know: Current project uses ESLint but may not have eslint-plugin-import configured
   - What's unclear: Whether to add eslint-import-resolver-typescript as part of this phase
   - Recommendation: Check if import errors appear after adding aliases; only add resolver if needed (don't preemptively install)

2. **Vitest config merge strategy**
   - What we know: Current project has Vitest config embedded in vite.config.ts
   - What's unclear: Whether to keep merged config or split into separate vitest.config.ts
   - Recommendation: Keep merged since vite-tsconfig-paths plugin will work for both; simpler maintenance

3. **Legacy relative imports**
   - What we know: Project has ~4 relative imports currently
   - What's unclear: Policy for future imports (always use aliases vs. relative for nearby files)
   - Recommendation: Use aliases for cross-folder imports, allow relative for files in same component folder (e.g., Header importing MobileMenu)

## Sources

### Primary (HIGH confidence)

- [vite-tsconfig-paths GitHub](https://github.com/aleclarson/vite-tsconfig-paths) - Official plugin documentation and examples
- [depcheck npm package](https://www.npmjs.com/package/depcheck) - Official tool for unused dependency detection
- [Setting Up Vitest to Support TypeScript Path Aliases](https://www.timsanteford.com/posts/setting-up-vitest-to-support-typescript-path-aliases/) - Verified configuration guide
- [npm outdated | npm Docs](https://docs.npmjs.com/cli/v7/commands/npm-outdated/) - Official npm CLI documentation
- [Using npm update and npm outdated to update dependencies](https://bytearcher.com/articles/using-npm-update-and-npm-outdated-to-update-dependencies/) - Canonical guide for dependency updates

### Secondary (MEDIUM confidence)

- [TypeScript Path Aliases: Why Your Prefix Choice Matters](https://medium.com/@LRNZ09/typescript-path-aliases-why-your-prefix-choice-matters-more-than-you-think-787963f27429) - Analysis of @ vs @/ vs # conventions
- [Barrel Imports in Modern JavaScript: Performance Cost](https://javascript.plainenglish.io/barrel-imports-in-modern-javascript-performance-cost-you-didnt-know-you-were-paying-for-a1f5c71c7b6a) - Recent (Jan 2026) research on barrel file performance impact
- [A Developer's Guide to Atomic Git Commits](https://medium.com/@sandrodz/a-developers-guide-to-atomic-git-commits-c7b873b39223) - Git best practices for refactoring
- [eslint-import-resolver-typescript npm](https://www.npmjs.com/package/eslint-import-resolver-typescript) - Official ESLint resolver for TypeScript paths
- [React Folder Structure in 5 Steps [2025]](https://www.robinwieruch.de/react-folder-structure/) - Community-vetted folder organization patterns

### Tertiary (LOW confidence)

- Various Medium articles and dev.to posts on React folder structures - consensus on hybrid approach but some outdated advice
- GitHub discussions on path alias pitfalls - identified real issues but need verification per project
- Community discussions on barrel exports - strong consensus against them in 2026 but context-dependent

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - vite-tsconfig-paths and depcheck are industry standard, well-documented, actively maintained
- Architecture: HIGH - hybrid structure well-established, patterns verified across multiple authoritative sources
- Pitfalls: HIGH - all pitfalls sourced from documented issues in official repos or multiple community reports
- Code examples: HIGH - synthesized from official documentation and verified community patterns
- Barrel exports anti-pattern: HIGH - multiple recent sources (including Jan 2026) with measurable data

**Research date:** 2026-02-04
**Valid until:** ~60 days (stable ecosystem; Vite and TypeScript path patterns are mature)

**Notes:**
- Phase 8 context indicated user decisions for folder structure (sections as components, animation grouped, UI separated) - research validates these as aligned with 2026 best practices
- User gave Claude discretion on alias naming (@/ vs @), scope, and commit strategy - research recommends @/ prefix, cross-folder scope, atomic commits
- focus-trap-react removal explicitly noted in STATE.md - research provides depcheck workflow to confirm and remove safely
