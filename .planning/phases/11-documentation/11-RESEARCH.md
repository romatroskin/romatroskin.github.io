# Phase 11: Documentation - Research

**Researched:** 2026-02-04
**Domain:** Portfolio project documentation, GitHub README best practices
**Confidence:** HIGH

## Summary

README.md documentation for portfolio projects in 2026 follows well-established patterns that prioritize immediate visual impact, quick-start accessibility, and professional presentation for both technical and non-technical audiences (recruiters and developers). The standard approach emphasizes concise, scannable content with strategic use of badges, visuals, and structured sections.

The research confirms that portfolio READMEs differ from open-source library documentation - they serve as marketing materials and case studies, not just technical references. Modern standards emphasize the live demo link in hero position, technology badges for quick stack identification, and features that balance technical achievements with user experience highlights.

**Primary recommendation:** Structure the README with a clear hierarchy: title/badges/live demo (hero section), brief description (2-3 sentences), features, tech stack, quick start, build commands, and license. Keep total length scannable (200-300 lines maximum). Use shields.io badges with consistent styling, and prioritize copy-paste-ready instructions that enable a new developer to clone and run locally in under 5 minutes.

## Standard Stack

The established tools for README documentation in 2026:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| shields.io | Current | Badge generation | Industry standard, serves 1.6B+ images/month, consistent SVG format |
| GitHub Markdown | GFM | Rendering | Native GitHub rendering, supports all standard markdown features |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| GitHub Actions Badge | Native | Build/deploy status | When CI/CD workflow exists |
| Lighthouse Badge | API | Performance metrics | For performance-focused projects |
| Coverage Badge | Generated | Test coverage display | When test suite exists with coverage reporting |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shields.io | Custom badge images | shields.io provides consistency, updates, and authority vs custom images requiring manual maintenance |
| Static screenshots | Animated GIFs | GIFs show interaction/animation (ideal for portfolios) but have 10MB limit and require optimization |
| Full documentation site | Single README | README is standard for quick reference; full sites (GitBook, Docusaurus) overkill for portfolio projects |

**Installation:**
No installation required - README.md is plain markdown with shields.io badges loaded via URL.

## Architecture Patterns

### Recommended README Structure
```markdown
# Project Title
[Badges row]
[Live Demo link - prominent]

## Overview
[2-3 sentence description]

## Features
- [Technical achievements]
- [UX highlights]

## Tech Stack
[Technology table or badges]

## Quick Start
[Copy-paste commands]

## Build Commands
[npm scripts with explanations]

## License
[License info + link to LICENSE file]
```

### Pattern 1: Hero Section with Badges
**What:** Title, badges, and live demo link grouped at the top
**When to use:** Always for portfolio projects
**Example:**
```markdown
# Puff Puff Dev Portfolio

![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=FFD62E)
![Build](https://github.com/username/repo/actions/workflows/deploy.yml/badge.svg)

**[View Live Demo →](https://puffpuff.dev)**
```
**Source:** [Readme Badges GitHub: Best Practices](https://daily.dev/blog/readme-badges-github-best-practices)

### Pattern 2: Technology Stack Table
**What:** Organized table showing tech by category
**When to use:** When project uses 5+ technologies
**Example:**
```markdown
## Tech Stack

| Category | Technologies |
|----------|-------------|
| Frontend | React 18, TypeScript |
| Build | Vite 5 |
| Animation | react-spring, Perlin noise |
| Testing | Vitest, Testing Library |
| Deploy | GitHub Pages |
```
**Source:** [README section order best practices](https://medium.com/@fulton_shaun/readme-rules-structure-style-and-pro-tips-faea5eb5d252)

### Pattern 3: Copy-Paste Quick Start
**What:** Commands that work verbatim without modification
**When to use:** Always - enables "clone and run in <5 minutes" goal
**Example:**
```markdown
## Quick Start

\`\`\`bash
git clone https://github.com/username/repo.git
cd repo
npm install
npm run dev
\`\`\`

Open http://localhost:5173
```
**Source:** [GitHub official README documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)

### Pattern 4: Badge Style Consistency
**What:** All badges use the same shields.io style parameter
**When to use:** Always - visual consistency signals professionalism
**Available styles:**
- `flat` (default) - Modern, clean
- `flat-square` - Rectangular, minimal
- `for-the-badge` - Bold, prominent
- `plastic` - Original style (deprecated feel)
- `social` - For social metrics

**Example:**
```markdown
<!-- Consistent flat-square style -->
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
```
**Source:** [shields.io official badge documentation](https://shields.io/badges)

### Anti-Patterns to Avoid
- **Wall of text descriptions:** Break up with headers, bullets, whitespace. Walls of text lose readers immediately.
- **Outdated information:** Referencing non-existent scripts, old commands, or deprecated features destroys credibility instantly.
- **Too many badges:** Stick to 4-6 key badges maximum. Badge overload looks amateur and clutters the page.
- **Missing visuals:** No screenshot/GIF means users can't preview the project, reducing engagement dramatically.
- **Apologetic language:** Never apologize for missing features or write "sorry no live demo" - simply omit sections that don't apply.

**Source:** [Common README mistakes](https://www.makeareadme.com/)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Badge generation | Custom SVG images | shields.io | Automatic updates, consistent styling, authority/trust, 1.6B+ served monthly |
| Build status display | Manual status updates | GitHub Actions badge | Automatic status sync, links to workflow runs, official GitHub integration |
| Test coverage badge | Static percentage text | Coverage badge generator | Auto-updates from coverage reports, visual color coding, shields.io integration |
| Lighthouse scores | Manual performance claims | Lighthouse badge API | Verifiable metrics, automatic updates, industry-standard measurement |
| License display | Plain text license | shields.io license badge | Links to license file, standard format, immediate visual recognition |

**Key insight:** Badge generation and status displays have mature, authoritative solutions. Custom implementations lack the trust signals and automatic updates that make shields.io and GitHub's native badges valuable. Portfolio projects benefit from using recognized, authoritative badge services that visitors trust.

## Common Pitfalls

### Pitfall 1: No Live Demo Link
**What goes wrong:** Visitors (especially recruiters) cannot see the project in action, drastically reducing engagement and interest.
**Why it happens:** Developer focuses on code quality over presentation, assumes people will clone and run locally.
**How to avoid:** Place live demo link prominently after title. For GitHub Pages projects, this is straightforward since deployment is automated.
**Warning signs:** README has no clickable demo link in first 100 lines.
**Source:** [Portfolio project best practices](https://www.nucamp.co/blog/top-10-full-stack-portfolio-projects-for-2026-that-actually-get-you-hired)

### Pitfall 2: Badge Style Inconsistency
**What goes wrong:** Mixing badge styles (flat, flat-square, for-the-badge) creates visual chaos and appears unprofessional.
**Why it happens:** Copying badge URLs from different sources without checking style parameters.
**How to avoid:** Choose one style (recommend flat-square for modern look) and add `?style=flat-square` to all badge URLs.
**Warning signs:** Badges at top of README have different heights/visual treatments.
**Source:** [shields.io badge best practices](https://daily.dev/blog/readme-badges-github-best-practices)

### Pitfall 3: Missing Quick Start Section
**What goes wrong:** New developers cannot easily clone and run the project, failing the "5 minute" success criterion.
**Why it happens:** Developer assumes setup is obvious or writes installation instructions that are too detailed/scattered.
**How to avoid:** Create a dedicated "Quick Start" section with 3-4 commands that work verbatim: clone, cd, install, run.
**Warning signs:** README lacks a section titled "Quick Start" or similar with copy-paste commands.
**Source:** [GitHub README best practices](https://bulldogjob.com/readme/how-to-write-a-good-readme-for-your-github-project)

### Pitfall 4: Giant GIF Files
**What goes wrong:** README loads slowly, GIF fails to display due to GitHub's 10MB limit.
**Why it happens:** Recording demo at full resolution/framerate without optimization.
**How to avoid:** Optimize GIFs: reduce to 10fps, limit to 1-2 seconds of animation, reduce color palette, stay well under 10MB limit.
**Warning signs:** GIF file size exceeds 5MB, README preview loads slowly.
**Source:** [GIF optimization for README](https://medium.com/@alenanikulina0/make-your-readme-better-with-images-and-gifs-b141bd54bff3)

### Pitfall 5: Over-Documentation
**What goes wrong:** README becomes multi-page manual, losing the "quick reference" purpose.
**Why it happens:** Treating README like full documentation site, adding every detail about implementation.
**How to avoid:** Keep README scannable (~200-300 lines). Move detailed docs to /docs/ directory or wiki.
**Warning signs:** README exceeds 500 lines, contains detailed API documentation.
**Source:** [README length best practices](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)

### Pitfall 6: No Test Coverage Badge
**What goes wrong:** Visitors cannot assess code quality at a glance, missing an opportunity to showcase testing rigor.
**Why it happens:** Test coverage exists but isn't visually displayed, developer doesn't know how to create coverage badge.
**How to avoid:** Configure Vitest to generate json-summary coverage report, use coverage badge generator or GitHub Action to create/update badge.
**Warning signs:** Project has tests (visible in package.json) but no coverage badge in README.
**Source:** [Vitest coverage badges](https://github.com/vitest-dev/vitest/issues/2288)

## Code Examples

Verified patterns from official sources:

### GitHub Actions Workflow Badge
```markdown
![Build Status](https://github.com/username/repo/actions/workflows/deploy.yml/badge.svg)
```
**Purpose:** Shows current build/deploy status
**Customization:** Replace `username/repo` with actual values, use exact workflow filename
**Source:** [GitHub Actions badge documentation](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/monitoring-workflows/adding-a-workflow-status-badge)

### Technology Badges (shields.io)
```markdown
<!-- React -->
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)

<!-- TypeScript -->
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)

<!-- Vite -->
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=FFD62E)
```
**Purpose:** Quick visual identification of tech stack
**Customization:** Change style parameter (flat-square, flat, for-the-badge), adjust colors
**Source:** [shields.io badge catalog](https://github.com/inttter/md-badges)

### License Badge
```markdown
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)
```
**Purpose:** Shows project license at a glance, links to license info
**Customization:** Replace MIT with actual license (Apache-2.0, GPL-3.0, etc.)
**Source:** [License badges](https://gist.github.com/lukas-h/2a5d00690736b4c3a7ba)

### Live Demo Link (Prominent Style)
```markdown
## Live Demo

**[View Live Site →](https://puffpuff.dev)**

*Hosted on GitHub Pages*
```
**Purpose:** Makes live demo highly visible and clickable
**Customization:** Replace URL with actual deployment URL
**Source:** [Portfolio README template](https://gist.github.com/manavm1990/6b4c3f51a1cc7ec2fa6c3309205be0f7)

### Quick Start Commands
```markdown
## Quick Start

```bash
# Clone repository
git clone https://github.com/username/repo.git

# Navigate to directory
cd repo

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
```
**Purpose:** Copy-paste commands for immediate local setup
**Customization:** Adjust port number if different, add any required environment setup
**Source:** [Quick start best practices](https://medium.com/@fulton_shaun/readme-rules-structure-style-and-pro-tips-faea5eb5d252)

### Build Commands Section
```markdown
## Build Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | TypeScript compile + Vite production build |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run test suite |
| `npm run deploy` | Build and deploy to GitHub Pages |
```
**Purpose:** Clear reference for all available npm scripts
**Customization:** Mirror actual scripts from package.json
**Source:** Project package.json standard practice

### Screenshot/GIF Placement
```markdown
## Features

![Demo Animation](./docs/demo.gif)

- Animated wave backgrounds using Perlin noise
- Smooth scroll-reactive parallax effects
- Responsive design for all screen sizes
- Dark mode optimized color palette
```
**Purpose:** Visual preview of key features
**Optimization:** Keep GIF under 5MB, 10fps, 1-2 seconds loop
**Source:** [GIF best practices](https://medium.com/@alenanikulina0/make-your-readme-better-with-images-and-gifs-b141bd54bff3)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Plain text badges | shields.io SVG badges | ~2013-2014 | Standardized badge appearance, automatic updates |
| Static screenshots only | Animated GIFs encouraged | ~2020-2021 | Better demonstration of interactive features |
| Full documentation in README | Scannable README + /docs/ | ~2018-2019 | Improved first-impression UX, better organization |
| Generic "Installation" section | "Quick Start" prioritized | ~2022-2023 | Faster time-to-local-setup for experienced developers |
| Apologetic language | Confident, direct tone | ~2024-2025 | More professional presentation for portfolio projects |

**Deprecated/outdated:**
- **Plastic badge style:** Original shields.io style from 2013, now considered dated. Use flat or flat-square instead.
- **Multi-page READMEs:** Splitting README into multiple files was tried briefly but abandoned. Keep single README, move extended docs to /docs/.
- **Manual build badges:** Manually updating "build: passing" text. Always use automated GitHub Actions badges.
- **No license info:** Omitting license was common in early 2010s, now considered unprofessional and legally ambiguous.

## Open Questions

Things that couldn't be fully resolved:

1. **Coverage Badge Implementation**
   - What we know: Vitest generates coverage reports, multiple tools exist (monorepo-coverage-badges, GitHub Actions), badges can show lines/statements/functions/branches
   - What's unclear: Optimal approach for this specific project (GitHub Action vs local badge generation), whether to use dynamic badges or static generated files
   - Recommendation: Document both approaches in PLAN.md, allow planner to choose based on simplicity vs dynamic updates tradeoff

2. **Lighthouse Badge Strategy**
   - What we know: Multiple tools exist (lighthouse-badge, lighthouse-badges, Lighthouse-Badger GitHub Action), can show scores for Performance/Accessibility/Best Practices/SEO/PWA
   - What's unclear: Whether to include Lighthouse badges (adds value but increases badge count), which specific metrics to display
   - Recommendation: Mark as optional quality enhancement, not required for DOCS-03 which specifies only test coverage badge

3. **Screenshot vs Animated GIF**
   - What we know: GIFs show interaction/animation (ideal for wave animations), but have 10MB GitHub limit and require optimization. Screenshots are simpler but less engaging.
   - What's unclear: Whether the wave animations can be captured effectively in a small GIF, whether static screenshot with description is sufficient
   - Recommendation: Mark as Claude's discretion per CONTEXT.md, suggest trying GIF first but falling back to screenshot if optimization is problematic

## Sources

### Primary (HIGH confidence)
- [GitHub Official README Documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes) - GitHub's authoritative guidance
- [GitHub Actions Badge Documentation](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/monitoring-workflows/adding-a-workflow-status-badge) - Official workflow badge implementation
- [shields.io Official Site](https://shields.io/) - Authoritative badge service documentation
- [shields.io Badge Styles](https://shields.io/badges) - Official style options and parameters

### Secondary (MEDIUM confidence)
- [Readme Badges GitHub: Best Practices (2026)](https://daily.dev/blog/readme-badges-github-best-practices) - Current best practices, verified with official sources
- [README Rules: Structure, Style, and Pro Tips](https://medium.com/@fulton_shaun/readme-rules-structure-style-and-pro-tips-faea5eb5d252) - Section ordering recommendations
- [How to write a good README for your GitHub project?](https://bulldogjob.com/readme/how-to-write-a-good-readme-for-your-github-project) - Comprehensive best practices guide
- [Make Your Readme Better with Images and GIFs](https://medium.com/@alenanikulina0/make-your-readme-better-with-images-and-gifs-b141bd54bff3) - GIF optimization guidance
- [Portfolio Projects for 2026 That Actually Get You Hired](https://www.nucamp.co/blog/top-10-full-stack-portfolio-projects-for-2026-that-actually-get-you-hired) - Portfolio-specific best practices

### Tertiary (LOW confidence)
- [Markdown License Badges](https://gist.github.com/lukas-h/2a5d00690736b4c3a7ba) - Community-maintained badge examples
- [Portfolio README Template](https://gist.github.com/manavm1990/6b4c3f51a1cc7ec2fa6c3309205be0f7) - Community template, useful structure example
- [md-badges Repository](https://github.com/inttter/md-badges) - Extensive badge collection, useful for reference

### Technical Details (Project-Specific)
- Repository: https://github.com/romatroskin/romatroskin.github.io.git
- Live site: https://puffpuff.dev (from vite.config.ts)
- Workflow file: .github/workflows/deploy.yml
- Package name: romatroskin.github.io (from package.json)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - shields.io and GitHub Markdown are industry standard, usage is universal
- Architecture: HIGH - README patterns are well-established and verified across multiple authoritative sources
- Pitfalls: HIGH - Common mistakes are well-documented and consistent across sources
- Badge implementations: MEDIUM - Multiple valid approaches exist, some project-specific decisions needed
- GIF optimization: MEDIUM - Technical limits are clear (10MB), but optimal strategy depends on content

**Research date:** 2026-02-04
**Valid until:** 2026-04-04 (60 days - stable domain, documentation standards change slowly)

**Key constraints from CONTEXT.md:**
- Structure: Portfolio-focused (Overview, Features, Tech stack, Quick start, Build commands, License)
- Live demo: Hero position, large and prominent
- Length: Scannable (~200-300 lines)
- Target audience: Both developers and recruiters equally
- Tone: Professional, clean, direct
- Badges: Core stack + quality indicators + deployment
- Build instructions: Copy-paste ready
- No Contributing section: Personal portfolio

**Claude's discretion areas:**
- Screenshot vs animated GIF
- Badge style (flat, flat-square, or for-the-badge)
- Whether tech choices need brief rationale
- Exact section ordering within structure
