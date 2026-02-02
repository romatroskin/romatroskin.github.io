# Codebase Structure

**Analysis Date:** 2026-02-02

## Directory Layout

```
romatroskin.github.io/
├── .github/                    # GitHub Actions and workflows
├── .planning/                  # GSD planning and analysis documents
│   └── codebase/              # Codebase analysis artifacts
├── dist/                       # Build output (generated, not committed during dev)
├── node_modules/              # Dependencies (not committed)
├── public/                     # Static assets
├── src/                        # Source code
│   ├── assets/                # Image and media assets
│   │   └── react.svg
│   ├── components/            # Reusable React components
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   └── header.css
│   │   ├── Perlin.tsx         # Perlin noise implementation
│   │   ├── Quotes.tsx         # Quotes component (currently unused)
│   │   ├── Waves.tsx          # Wave SVG path generator (class component)
│   │   ├── WavyBackground.tsx # Wrapper for animated waves
│   │   └── waves.module.css   # CSS module for wave styling
│   ├── css/                   # Global stylesheets
│   │   └── main.css
│   ├── App.tsx                # Root app component with parallax layout
│   ├── App.css                # App-level styles
│   ├── index.css              # Global base styles
│   ├── main.tsx               # React DOM entry point
│   └── vite-env.d.ts          # Vite environment type definitions
├── index.html                 # HTML entry point
├── package.json               # Dependencies and scripts
├── package-lock.json          # Locked dependency versions
├── tsconfig.json              # TypeScript root config
├── tsconfig.app.json          # TypeScript app-level config
├── tsconfig.node.json         # TypeScript node/build tools config
├── vite.config.ts             # Vite build configuration
├── eslint.config.js           # ESLint configuration
├── README.md                  # Project documentation
└── CLAUDE.md                  # Claude-specific development notes
```

## Directory Purposes

**src/**
- Purpose: All application source code
- Contains: React components, styles, assets, entry points
- Key files: `App.tsx` (main component), `main.tsx` (entry), `index.css` (global styles)

**src/components/**
- Purpose: Reusable React components
- Contains: Functional and class components with their associated styles
- Key files: `Waves.tsx` (wave generator), `Header.tsx` (navigation), `Perlin.tsx` (noise utility)

**src/components/Header/**
- Purpose: Navigation header component
- Contains: Header component and scoped styles
- Key files: `Header.tsx`, `header.css`

**src/css/**
- Purpose: Global stylesheet organization
- Contains: Framework imports and global style setup
- Key files: `main.css`

**src/assets/**
- Purpose: Static image and media files
- Contains: SVGs and other media
- Key files: `react.svg`

**public/**
- Purpose: Static files served as-is (favicon, etc.)
- Contains: Assets copied to build root
- Key files: `dp_white.svg` (favicon)

**dist/**
- Purpose: Production build output
- Contains: Minified/bundled JavaScript, CSS, HTML
- Generated: Yes (by `npm run build`)
- Committed: No (in .gitignore)

**.planning/codebase/**
- Purpose: GSD analysis documents
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, STACK.md, INTEGRATIONS.md, CONCERNS.md
- Generated: Yes (by GSD mapper)
- Committed: Yes (tracked in git)

## Key File Locations

**Entry Points:**
- `index.html`: HTML page container, script loader, meta tags
- `src/main.tsx`: React DOM root creation, StrictMode wrapper
- `src/App.tsx`: Main React component, parallax setup, wave rendering loop

**Configuration:**
- `package.json`: Dependencies, scripts, project metadata
- `tsconfig.json`: TypeScript compiler root settings
- `tsconfig.app.json`: App-specific TypeScript settings (ES2020, strict mode, JSX)
- `vite.config.ts`: Vite build tool configuration (React plugin)
- `eslint.config.js`: ESLint code quality rules

**Core Logic:**
- `src/App.tsx`: Parallax container, scroll tracking, wave animation orchestration (lines 13-191)
- `src/components/Waves.tsx`: Wave path calculation, frame-based animation, Perlin noise integration (class component, ~228 lines)
- `src/components/Perlin.tsx`: Simplex and Perlin noise algorithms (~347 lines)
- `src/components/WavyBackground.tsx`: Animated SVG wrapper (~91 lines)

**Styling:**
- `src/index.css`: Global styles, dark/light theme variables, base element styling
- `src/App.css`: Logo and card styles
- `src/components/Header/header.css`: Navigation menu styles (PureCSS)
- `src/components/waves.module.css`: Wave animation keyframes and container styling
- `src/css/main.css`: Typography, layout classes, responsive design (currently minimal)

**Testing:**
- Not found (no test files in codebase)

## Naming Conventions

**Files:**
- React components: PascalCase with .tsx extension (`Header.tsx`, `Waves.tsx`)
- Styles: lowercase kebab-case or .module.css for scoped (`header.css`, `waves.module.css`)
- Utilities: PascalCase for classes (`Perlin.tsx`, `Grad` class), descriptive names
- Entry points: lowercase (`main.tsx`, `index.html`)

**Directories:**
- Component folders: PascalCase (`Header/`, `components/`)
- Utility directories: lowercase (`css/`, `assets/`)
- Purpose-based grouping: Functional organization by feature/concern

**Exports:**
- Default exports: Components export as default (e.g., `export default App`, `export default Header`)
- Named exports: Interfaces and types export named (e.g., `export type { WaveProps }`)
- Barrel files: Not used

## Where to Add New Code

**New Feature (page/section):**
- Primary code: Add `.tsx` file in `src/` or new subdirectory in `src/`
- Styles: Add `.css` file alongside component or in `src/css/`
- Integration: Import and use in `src/App.tsx` or create new ParallaxLayer

**New Component/Module:**
- Implementation: Create file in `src/components/` with PascalCase name
- Styles: Create `.css` or `.module.css` in same directory
- Types/Props: Define interface above component definition in same file or separate `.d.ts`
- Export: Use default export if single component, named exports for utilities

**Utilities/Helpers:**
- Location: `src/utils/` (currently doesn't exist; create if needed)
- Pattern: Export utility function/class by default or named, import where needed
- Example: If adding utility function, create `src/utils/myUtil.ts` and import via `import { myUtil } from './utils/myUtil'`

**Global Styles:**
- Shared CSS: Add to `src/index.css` (global scope) or create new file in `src/css/`
- Component-scoped styles: Use `.module.css` and import as module (`import styles from './waves.module.css'`)
- Framework overrides: Modify `src/index.css` for PureCSS/modern-normalize adjustments

## Special Directories

**node_modules/:**
- Purpose: All installed npm dependencies
- Generated: Yes (by npm install from package-lock.json)
- Committed: No (in .gitignore)

**dist/:**
- Purpose: Production-ready bundled output
- Generated: Yes (by `npm run build`)
- Committed: No (in .gitignore)

**.git/:**
- Purpose: Git version control history
- Generated: Yes (by git init)
- Committed: Yes (metadata only)

**.planning/codebase/:**
- Purpose: GSD codebase analysis documents
- Generated: Yes (by `/gsd:map-codebase`)
- Committed: Yes (tracked in git for visibility)

## Module Resolution

**Path Aliases:**
- Not configured (tsconfig paths not customized)
- All imports use relative paths (e.g., `import App from "./App.tsx"`)

**Import Patterns:**
1. React and external packages: `import { useState } from "react"`
2. Internal components: `import App from "./App.tsx"` (relative)
3. Styles: `import "./index.css"` or `import styles from "./waves.module.css"`
4. Types: `import { WavesPropTypes } from "./components/Waves"`

---

*Structure analysis: 2026-02-02*
