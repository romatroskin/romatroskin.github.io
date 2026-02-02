# Technology Stack

**Analysis Date:** 2026-02-02

## Languages

**Primary:**
- TypeScript 5.5.3 - Full application codebase (React components, utilities)

**Secondary:**
- JavaScript (Implicit) - Configuration files (vite.config.ts, eslint.config.js)
- CSS3 - Styling with CSS modules and global stylesheets

## Runtime

**Environment:**
- Node.js (version not explicitly pinned in .nvmrc, inferred from package.json type: "module")

**Package Manager:**
- npm (7.x or higher based on package-lock.json format)
- Lockfile: Present (`package-lock.json`)

## Frameworks

**Core:**
- React 18.3.1 - UI framework for component-based architecture
- react-dom 18.3.1 - DOM rendering layer for React

**Animation & Visual Effects:**
- react-spring 9.7.4 - Spring-based animation library
- @react-spring/web 9.7.4 - Web-specific spring animations
- @react-spring/parallax 9.7.4 - Parallax scrolling effects

**Utilities:**
- usehooks-ts 3.1.0 - TypeScript utility hooks (used for `useWindowSize`)
- lodash 4.17.21 - Utility library (used for `random` function)

**CSS & Styling:**
- modern-normalize 3.0.0 - CSS normalization (linked in index.html)
- purecss 3.0.0 - Lightweight CSS framework (Pure.css menu components)

## Build & Development

**Build Tool:**
- Vite 5.4.1 - Fast build tool and dev server
- @vitejs/plugin-react 4.3.1 - React plugin for Vite with Fast Refresh

**TypeScript:**
- TypeScript 5.5.3 - Type checking and transpilation

**Linting & Code Quality:**
- ESLint 9.9.0 - JavaScript/TypeScript linter
- @eslint/js 9.9.0 - ESLint JavaScript configuration
- typescript-eslint 8.0.1 - TypeScript support for ESLint
- eslint-plugin-react-hooks 5.1.0-rc.0 - Linting rules for React hooks
- eslint-plugin-react-refresh 0.4.9 - Linting rules for React Fast Refresh

**Development Dependencies:**
- globals 15.9.0 - Global scope definitions for ESLint
- @types/react 18.3.3 - Type definitions for React
- @types/react-dom 18.3.0 - Type definitions for react-dom
- @types/lodash 4.17.7 - Type definitions for lodash

## Deployment

**Static Hosting:**
- gh-pages 6.1.1 - Deploy to GitHub Pages
- Deploy command: `npm run deploy` (builds then pushes to gh-pages branch)
- Predeploy: Automatically runs `npm run build` before deploy

## Configuration

**Build Configuration:**
- `vite.config.ts` - Vite configuration with React plugin enabled
- `tsconfig.json` - Root TypeScript configuration referencing app and node configs
- `tsconfig.app.json` - Application-specific TypeScript configuration (ES2020 target, DOM lib, strict mode)
- `tsconfig.node.json` - Node-specific TypeScript configuration for config files
- `eslint.config.js` - ESLint configuration with React hooks and refresh plugins

**TypeScript Settings (tsconfig.app.json):**
- Target: ES2020
- Module Resolution: bundler
- JSX: react-jsx (automatic runtime)
- Strict Mode: Enabled
- Unused variable detection: Enabled
- No fallthrough case switches: Enabled

**Entry Point:**
- `index.html` - HTML entry point
- `src/main.tsx` - React app bootstrap
- `src/App.tsx` - Root React component

## Build Commands

```bash
npm run dev        # Start Vite dev server with HMR
npm run build      # TypeScript check + Vite production build
npm run lint       # Run ESLint
npm run preview    # Preview production build locally
npm run deploy     # Build and deploy to GitHub Pages
```

## Platform Requirements

**Development:**
- Node.js 16.0+ (implied by ES2020 target and ESM module type)
- npm or compatible package manager

**Production:**
- GitHub Pages static hosting
- Modern browser with ES2020+ support (no polyfills needed)
- No backend server required (static SPA)

**Deployment:**
- GitHub repository with gh-pages branch access
- Git configured for deployment

---

*Stack analysis: 2026-02-02*
