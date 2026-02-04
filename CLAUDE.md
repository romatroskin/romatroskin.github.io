# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev       # Start development server with HMR
npm run build     # TypeScript compile + Vite production build
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
npm run deploy    # Build and deploy to GitHub Pages via gh-pages
```

## Architecture

This is a portfolio/landing page for "Puff Puff Dev" built with React 18, TypeScript, and Vite.

### Animation System

The site features animated wave backgrounds driven by **Perlin noise** and **react-spring**:

- [Perlin.tsx](src/components/Perlin.tsx) - Perlin/Simplex noise implementation for organic wave movement
- [Waves.tsx](src/components/Waves.tsx) - Class component that generates animated SVG wave paths using noise-based point calculation at 30fps
- [WavyBackground.tsx](src/components/WavyBackground.tsx) - Wraps Wave with react-spring's `animated()` for scroll-reactive transforms

### Scroll-Reactive Animations

The main [App.tsx](src/App.tsx) uses `useScroll` from react-spring to bind scroll position to wave properties (height, amplitude, speed, scale). Waves are stacked with randomized noise offsets for visual depth.

### Parallax Layout

Content sections use `@react-spring/parallax` for scroll-based layered movement across multiple "pages".

### Styling

Uses PureCSS for the header menu system and modern-normalize for CSS reset.
