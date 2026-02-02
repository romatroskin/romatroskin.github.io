# Architecture

**Analysis Date:** 2026-02-02

## Pattern Overview

**Overall:** Component-based single-page application (SPA) with React hooks and animation-driven UI

**Key Characteristics:**
- React 18 with functional components and hooks
- React Spring for advanced animations and parallax effects
- TypeScript for type safety
- Vite as build and dev server
- Emphasis on visual effects and scroll-driven animations
- Static content marketing site architecture

## Layers

**Presentation Layer:**
- Purpose: Render UI components and manage visual effects
- Location: `src/components/` and `src/App.tsx`
- Contains: React functional and class components, styled elements, animation wrappers
- Depends on: React, React Spring, React DOM, Lodash utilities
- Used by: Main App component and entry point

**Animation & Effects Layer:**
- Purpose: Handle wave generation, Perlin noise, and scroll-driven animations
- Location: `src/components/Waves.tsx`, `src/components/WavyBackground.tsx`, `src/components/Perlin.tsx`
- Contains: Wave path calculation engine, Perlin noise implementation, SVG rendering
- Depends on: React, React Spring Interpolation types, Lodash random
- Used by: App.tsx for background wave effects

**Styling Layer:**
- Purpose: Define visual appearance and responsive design
- Location: `src/index.css`, `src/App.css`, `src/css/main.css`, `src/components/*/[filename].css`, `src/components/waves.module.css`
- Contains: CSS modules, global styles, responsive media queries, component-scoped styles
- Depends on: PureCSS framework, modern-normalize
- Used by: All components for styling

**Root/Entry Layer:**
- Purpose: Initialize React application and mount DOM
- Location: `src/main.tsx`, `index.html`
- Contains: React root creation, StrictMode wrapper
- Depends on: React, React DOM
- Used by: Browser runtime

## Data Flow

**Page Render Flow:**

1. Browser loads `index.html`
2. `src/main.tsx` creates React root and mounts `<App />`
3. `App.tsx` initializes Parallax container and wave animation state
4. `useWindowSize()` hook provides viewport dimensions
5. `useScroll()` hook tracks scroll position from Parallax ref
6. `useTrail()` creates animation configs for 5 wave layers
7. For each wave: `WavyBackground` renders animated SVG path
8. Wave path coordinates computed from Perlin noise in `requestAnimationFrame`
9. SVG path updated each frame via React Spring interpolation
10. User scrolls → scroll position updates animation values → waves transform and color shift

**State Management:**
- React hooks (useState, useRef, useCallback implied through class components)
- Local component state in Wave class component
- React Spring provides animated values that trigger re-renders on change
- No global state management (Redux, Zustand, etc.)
- Parallax scroll container ref passed as dependency

## Key Abstractions

**Wave Rendering System:**
- Purpose: Generate and animate realistic wave SVG paths
- Examples: `src/components/Waves.tsx` (Wave class), `src/components/WavyBackground.tsx` (wrapper)
- Pattern: Class component (Wave) wraps Perlin noise calculation with requestAnimationFrame loop for smooth animation

**Perlin Noise Generator:**
- Purpose: Generate smooth pseudo-random values for wave shape variation
- Examples: `src/components/Perlin.tsx`
- Pattern: JavaScript class with simplex2/simplex3 and perlin2/perlin3 methods; seeded random initialization

**Parallax Container:**
- Purpose: Create multi-layer depth effect with scroll synchronization
- Examples: Used in `src/App.tsx` via @react-spring/parallax
- Pattern: Parallax component wraps ParallaxLayer elements; useScroll syncs external scroll container

**Animated SVG Path:**
- Purpose: Render dynamic wave shape with synchronized color and scale
- Examples: `src/components/WavyBackground.tsx` with AnimatedWave
- Pattern: React.forwardRef wrapping animated() HOC from React Spring

## Entry Points

**Browser Entry Point:**
- Location: `index.html` (root of project)
- Triggers: Page load
- Responsibilities: HTML structure, meta tags, script src pointing to /src/main.tsx, CSS links

**React Entry Point:**
- Location: `src/main.tsx`
- Triggers: Module script execution from HTML
- Responsibilities: Create React root at #root element, render App in StrictMode

**App Component:**
- Location: `src/App.tsx`
- Triggers: React root render
- Responsibilities: Set up Parallax container, manage scroll state, render Header and multiple WavyBackground instances, render content sections (splash, about)

**Header Component:**
- Location: `src/components/Header/Header.tsx`
- Triggers: Rendered from App.tsx
- Responsibilities: Render navigation menu with PureCSS styling, fixed positioning

## Error Handling

**Strategy:** Minimal explicit error handling; relies on React error boundaries (implicitly through StrictMode)

**Patterns:**
- Console.log used for debugging (Waves.tsx line 49)
- No try-catch blocks in async operations (Quotes.tsx fetch is unguarded)
- Type checking via TypeScript at compile time
- React's built-in prop validation through TypeScript interfaces

## Cross-Cutting Concerns

**Logging:** console.log statements in Waves.tsx constructor for debugging (not removed)

**Validation:** TypeScript interfaces enforce component prop types (WavesPropTypes, WavyBackgroundPropTypes, etc.)

**Authentication:** Not applicable; static site with no backend

**Styling:** CSS modules (waves.module.css) for scoped styles; global CSS for framework (PureCSS) and general styling

**Responsive Design:** Media queries at breakpoints: 375px, 600px, 768px, 1024px, 1280px, 48em (768px), 78em (1248px)

---

*Architecture analysis: 2026-02-02*
