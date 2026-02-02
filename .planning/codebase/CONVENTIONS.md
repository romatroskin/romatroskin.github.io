# Coding Conventions

**Analysis Date:** 2026-02-02

## Naming Patterns

**Files:**
- React components: PascalCase (e.g., `Header.tsx`, `WavyBackground.tsx`, `Waves.tsx`, `Perlin.tsx`)
- CSS modules: kebab-case (e.g., `waves.module.css`, `header.css`)
- Utility/helper files: camelCase or PascalCase by type (e.g., `Quotes.tsx`)
- CSS files: kebab-case with `.module.css` for scoped styles

**Functions:**
- Component functions: PascalCase for React components (e.g., `function App()`, `function Header()`)
- Regular functions: camelCase (e.g., `getQuote()`, `_calculateWavePoints()`, `_buildPath()`)
- Private/internal functions: camelCase with leading underscore convention in class methods (e.g., `_update()`, `_draw()`, `_redraw()`)

**Variables:**
- Constants: camelCase for regular variables (e.g., `numWaves`, `frameInterval`, `targetFrameRate`)
- Component props: camelCase (e.g., `scrollY`, `parallaxRef`, `containerWidth`)
- State variables: camelCase (e.g., `path`, `quote`, `author`)
- Class properties: camelCase with underscore prefix for private/internal (e.g., `_elapsed`, `_step`, `_noise`, `_frameId`)

**Types:**
- Interfaces: PascalCase with suffix `PropTypes` for component prop interfaces (e.g., `WavesPropTypes`, `WavyBackgroundPropTypes`)
- Generic interfaces: PascalCase (e.g., `IParallax`)
- Type aliases: PascalCase (e.g., `WaveProps`)

## Code Style

**Formatting:**
- Indentation: 4 spaces (observed in source files)
- String quotes: Double quotes (`"`) for JSX and most strings
- Line length: No strict limit observed, some lines extend to ~150+ characters

**Linting:**
- Tool: ESLint with TypeScript support (`eslint.config.js`)
- Base configs: `@eslint/js`, `typescript-eslint/configs.recommended`
- Plugins: `react-hooks`, `react-refresh`
- React Hooks rule: `react-hooks/rules-of-hooks` enforced
- React Refresh: `react-refresh/only-export-components` set to `warn` level

**Linting Rules:**
```
- ecmaVersion: 2020
- Browser globals enabled
- React Hooks rules enforced (recommended)
- React Refresh warnings for component exports
```

## Import Organization

**Order:**
1. React and external dependencies (e.g., `import { useRef } from "react"`)
2. Third-party libraries (e.g., `@react-spring/web`, `@react-spring/parallax`, `lodash`, `usehooks-ts`)
3. Local component imports (e.g., `import WavyBackground from "./components/WavyBackground"`)
4. CSS/style imports (e.g., `import "./App.css"`, `import styles from "./waves.module.css"`)

**Path Aliases:**
- Not detected in current configuration

## Error Handling

**Patterns:**
- Promise chains with `.then().then()` pattern (seen in `Quotes.tsx`)
- No explicit error handling in fetch calls (potential concern)
- Type assertion using `!` non-null operator (e.g., `document.getElementById("root")!`)
- TypeScript `@ts-expect-error` comments for intentional type mismatches (e.g., in `WavyBackground.tsx` line 79)

**Console Usage:**
- `console.log()` used for debugging (seen in `Quotes.tsx` line 16, `Waves.tsx` line 49)
- No structured logging framework detected

## Logging

**Framework:** Native `console` methods

**Patterns:**
- Debug logging: `console.log("message", { data })`
- Usage in development/debugging (should be removed or conditionally enabled in production)
- Observed in: `src/components/Quotes.tsx`, `src/components/Waves.tsx`

## Comments

**When to Comment:**
- Commented-out code blocks are preserved in source files (e.g., `WavyBackground.tsx`, `Waves.tsx`, `Header.tsx`, `App.tsx`)
- Inline comments explain complex logic (e.g., in `Perlin.tsx` Simplex noise calculations)
- JSDoc/TSDoc not consistently used

**JSDoc/TSDoc:**
- Not consistently used across the codebase
- No @param, @return, or @deprecated annotations observed
- Simple function signatures without extended documentation

## Function Design

**Size:**
- Functions range from small utility methods (~5-10 lines) to larger component methods (~50-100 lines)
- `Perlin.tsx` contains algorithmic functions with extensive inline comments explaining mathematical operations
- Wave component render method (~50 lines including prop destructuring)

**Parameters:**
- Destructuring used in function parameters (e.g., `({ options, style, ...props }, ref)` in WavyBackground)
- Props passed as single objects/interfaces rather than multiple parameters
- React components receive props object typed with interfaces

**Return Values:**
- Explicit return values in utility functions
- JSX components return React elements
- Class component methods return void or specific types (number, string, path data)

## Module Design

**Exports:**
- Default exports for React components (e.g., `export default App`, `export default Header`)
- Named type exports (e.g., `export type { WaveProps, WavesPropTypes }` in `Waves.tsx`)
- Mix of default and named exports

**Barrel Files:**
- Not observed in current structure

## TypeScript Compiler Options

**Strict Mode:** Enabled
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`

**Module Resolution:**
- `moduleResolution: "bundler"`
- `moduleDetection: "force"`
- `isolatedModules: true`

## Class vs Functional Components

**Observed Patterns:**
- Functional components preferred for most new code (e.g., `App`, `Header`, `Quotes`)
- Class components used for complex state management (e.g., `Wave` extends `React.Component`)
- Wave component uses class-based approach for lifecycle methods and animation frame management

## Type Safety

**Type Assertions:**
- `as` keyword used for type casting (e.g., `scrollY.to<string>(...)`, `scrollY.to<number>(...)`)
- Non-null assertions with `!` operator (e.g., `document.getElementById("root")!`)
- `// @ts-expect-error` comments for intentional type violations

---

*Convention analysis: 2026-02-02*
