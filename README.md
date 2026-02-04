# Puff Puff Dev Portfolio

![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=FFD62E)
![Build Status](https://github.com/romatroskin/romatroskin.github.io/actions/workflows/deploy.yml/badge.svg)
![Coverage](https://img.shields.io/badge/Coverage-97%25-brightgreen?style=flat-square)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)

**[View Live Site →](https://puffpuff.dev)**

## Overview

A production-ready portfolio and landing page for Puff Puff Dev, a Flutter mobile development consultancy. The site showcases technical craft through animated wave backgrounds driven by Perlin noise and parallax scrolling, with comprehensive accessibility support, dark/light theming, and optimized performance across all devices.

## Features

### Technical Achievements
- **Organic Wave Animations** - Custom Perlin noise implementation with memoization (1000-entry cache) drives smooth, natural wave motion
- **Scroll-Reactive Parallax** - react-spring integration binds scroll position to wave properties (height, amplitude, speed) for immersive depth
- **Adaptive Performance** - Frame rate adjusts dynamically (15/24/30 fps) based on device capability, ensuring smooth animations on all hardware
- **Comprehensive Testing** - 116 unit and accessibility tests with Vitest, including Perlin noise algorithm verification and react-axe integration
- **Build-Time Optimization** - Image compression (78% size reduction), code splitting, and lazy loading for below-fold content

### User Experience
- **Dark/Light Mode** - System preference detection with manual toggle, FOUC prevention via inline blocking script
- **Full Accessibility** - WCAG 2.1 AA compliant with semantic HTML, ARIA labels, keyboard navigation, focus indicators, and reduced motion support
- **Mobile-First Design** - Responsive typography, touch-friendly tap targets (44x44px minimum), hamburger menu with slide-out drawer
- **Core Web Vitals** - LCP < 2.5s, INP < 200ms, CLS < 0.1, Lighthouse scores of 100/100/96/100

## Tech Stack

| Category | Technologies |
|----------|-------------|
| Frontend | React 18, TypeScript |
| Build Tool | Vite 5 |
| Animation | @react-spring (parallax, web), Perlin noise algorithm |
| Styling | CSS Modules, modern-normalize |
| Testing | Vitest, @testing-library/react, vitest-axe |
| Quality | ESLint, TypeScript strict mode, web-vitals monitoring |
| Deployment | GitHub Pages, GitHub Actions CI/CD |

## Quick Start

```bash
# Clone repository
git clone https://github.com/romatroskin/romatroskin.github.io.git

# Navigate to directory
cd romatroskin.github.io

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR at localhost:5173 |
| `npm run build` | TypeScript compile + Vite production build to dist/ |
| `npm run lint` | Run ESLint across all source files |
| `npm run preview` | Preview production build locally before deploy |
| `npm run test` | Run Vitest test suite in watch mode |
| `npm run test:coverage` | Generate test coverage report in coverage/ |
| `npm run deploy` | Build and deploy to GitHub Pages (main branch only) |

## Project Structure

```
src/
├── components/
│   ├── animation/     # Perlin, Waves, WavyBackground
│   ├── sections/      # ContactSection
│   ├── ui/            # Header, ThemeToggle, SkipToContent
│   └── common/        # ErrorBoundary
├── hooks/             # useAnimationFrame, usePerlinNoise, useScrollSpy
├── utils/             # localStorage, formatDate
└── App.tsx            # Main parallax layout

public/               # Static assets (logo, icons, og-image)
.github/workflows/    # CI/CD deployment pipeline
```

## Architecture Highlights

- **Functional Components with Hooks** - Wave rendering uses useAnimationFrame and usePerlinNoise for deterministic animation
- **Error Boundaries** - Layered error handling with gradient fallback for animation failures
- **Memoization Strategy** - Perlin noise cache prevents redundant calculations, reducing CPU load
- **Web Vitals Monitoring** - Real-time tracking of LCP, INP, CLS, FCP, TTFB via web-vitals library
- **Path Aliases** - `@/` prefix maps to `src/` via vite-tsconfig-paths plugin for clean imports

## Performance

The site achieves top-tier Core Web Vitals through strategic optimizations:

- **LCP (Largest Contentful Paint):** < 2.5s - Hero section loads immediately, below-fold content lazy-loaded
- **INP (Interaction to Next Paint):** < 200ms - Adaptive frame rate prevents jank, Long Animation Frames API monitoring enabled
- **CLS (Cumulative Layout Shift):** < 0.1 - Explicit width/height attributes on all images
- **Bundle Size:** 78% image compression via vite-plugin-image-optimizer, code splitting for non-critical paths

## Accessibility

WCAG 2.1 AA compliance verified with 116 automated tests:

- Semantic HTML5 landmarks (nav, main, section)
- ARIA labels on all interactive elements
- Keyboard navigation (Tab order, Enter/Space activation)
- Skip-to-content link for screen reader users
- Focus indicators meeting 4.5:1 contrast ratio (15:1+ achieved)
- Touch-safe hover states (media query gated)
- Reduced motion support (@media prefers-reduced-motion)
- Alt text for all images and icons

## Browser Support

Modern browsers with ES2020+ support:

- Chrome/Edge 88+ (2021+)
- Firefox 85+ (2021+)
- Safari 14.1+ (2021+)
- Mobile browsers (iOS Safari 14.1+, Chrome Android 88+)

No polyfills required. Static site compatible with GitHub Pages hosting.

## Development

### Running Tests

```bash
# Watch mode (default)
npm test

# Single run with coverage
npm run test:coverage

# Open coverage report
open coverage/index.html
```

### Deployment

GitHub Actions automatically deploys to GitHub Pages on push to main:

1. Runs test suite
2. Builds production bundle
3. Deploys to gh-pages branch
4. Live at [https://puffpuff.dev](https://puffpuff.dev)

Manual deployment (main branch only):

```bash
npm run deploy
```

### Code Quality

```bash
# Lint check
npm run lint

# Type check
npx tsc --noEmit
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

Copyright (c) 2026 Puff Puff Dev

---

Built with React, TypeScript, and Vite. Animated with react-spring and Perlin noise. Deployed via GitHub Pages.

**[Contact](https://puffpuff.dev#contact)** | **[GitHub](https://github.com/puffpuffdev)** | **[LinkedIn](https://www.linkedin.com/company/puffpuffdev)**
