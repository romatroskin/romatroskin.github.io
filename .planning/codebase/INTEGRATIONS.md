# External Integrations

**Analysis Date:** 2026-02-02

## APIs & External Services

**GitHub Content Delivery:**
- GitHub Raw Content API - Asset delivery
  - Used for: Logo image (`https://raw.githubusercontent.com/PuffPuffDev/puff_puff_brand/main/logos/logo_white.svg`)
  - Implementation: Direct `<img>` src URL in `src/App.tsx` line 109

**Quote Data Service:**
- GitHub Gist API - Quote data fetching
  - Used for: Random quote generation
  - Endpoint: `https://gist.githubusercontent.com/romatroskin/6d32e7ec0ca0cd44670f0de771072a5a/raw/dcb7753294b228a344ad784e11cc12e18a07178d/quotes.json`
  - Implementation: Fetch API in `src/components/Quotes.tsx` lines 11-22
  - Method: GET JSON fetch (no authentication required)
  - Status: Currently commented out in UI (not active on page)

## Data Storage

**Database:**
- Not applicable - Static site with no backend

**File Storage:**
- GitHub Pages static assets
  - Location: `/public` directory (built into dist)
  - Files: `dp_white.svg` (favicon), any other static assets

**Caching:**
- Browser cache (HTTP headers managed by GitHub Pages)
- No application-level caching layer

## Authentication & Identity

**Auth Provider:**
- None - Public static website
- No user authentication implemented
- All external data sources are public (GitHub raw content, Gist)

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Browser console only (`console.log` in `src/components/Waves.tsx` line 49, `src/components/Quotes.tsx` line 16)
- No server-side logging infrastructure

## CI/CD & Deployment

**Hosting:**
- GitHub Pages (deployed via gh-pages npm package)
- Repository: `romatroskin/romatroskin.github.io`
- Branch: `gh-pages` (auto-created by gh-pages package)

**CI Pipeline:**
- Manual: `npm run deploy` locally (no GitHub Actions workflows detected)
- Deployment: `gh-pages` package handles branch push

**Build Pipeline:**
```
npm run build  (TypeScript check + Vite bundling)
  ↓
dist/ folder created
  ↓
gh-pages pushes dist/ to gh-pages branch
  ↓
GitHub Pages serves from gh-pages branch
```

## Environment Configuration

**Required Environment Variables:**
- None - Application is fully static with hardcoded URLs

**Secrets Location:**
- No secrets or credentials required
- All external URLs are public

**Configuration Approach:**
- Hardcoded URLs in component source code
- No .env file usage
- URLs in source:
  - Logo: `src/App.tsx` line 109
  - Quote API: `src/components/Quotes.tsx` line 11

## Webhooks & Callbacks

**Incoming:**
- None - Static site receives no inbound webhooks

**Outgoing:**
- None - No outbound callbacks or webhooks configured

## Network Dependencies

**Required External Resources:**
1. GitHub Raw Content (Logo Image)
   - Domain: `raw.githubusercontent.com`
   - Reliability: High (GitHub infrastructure)
   - Fallback: None (image will fail to load if unavailable)

2. GitHub Gist (Quote Data)
   - Domain: `gist.githubusercontent.com`
   - Reliability: High (GitHub infrastructure)
   - Fallback: None (quotes will not load if unavailable)

**Browser APIs Used:**
- Fetch API (modern browser standard, no external dependency)
- requestAnimationFrame (browser native)
- DOM APIs (browser native)

## Data Flow

**Page Load Sequence:**
1. Browser loads `index.html` from GitHub Pages
2. HTML loads CSS from node_modules (modern-normalize, purecss)
3. React app initializes from `src/main.tsx`
4. App renders with parallax layers and wave animations
5. Logo image loads from GitHub raw content (async)
6. Quotes component (currently disabled) would fetch from GitHub Gist on mount

**No persistent data:**
- All data is ephemeral
- Quote data cached only in React component state
- No database or persistent storage

## Cross-Origin Considerations

**CORS:**
- GitHub raw content (images) - No CORS headers needed for simple GET
- GitHub Gist (JSON) - CORS allowed for GET requests
- All requests are from public GitHub Pages, likely whitelisted

**Security:**
- No credentials transmitted
- All URLs are public
- SPA runs entirely in browser (no backend to secure)

---

*Integration audit: 2026-02-02*
