# Phase 7: SEO Foundation & Build Infrastructure - Context

**Gathered:** 2026-02-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Search engines can discover and properly preview the site. Social media platforms display rich previews. Build optimizations reduce load times through Brotli compression. Favicon appears across all devices.

</domain>

<decisions>
## Implementation Decisions

### Social preview content
- Title: "Puff Puff Dev | Software Development"
- Description: "Turning your ideas into polished software that users love."
- Twitter card: Large image (summary_large_image)
- No Twitter handle attribution in meta tags

### Organization identity
- Organization name: "Puff Puff Dev"
- Social profiles in schema: GitHub only
- Logo: Self-hosted PNG file in the repo
- Schema entity type: Claude's discretion (Organization or Person)

### OG image design
- Visual style: Match site theme with wave aesthetic
- Color mode: Claude's discretion
- Content: Logo + tagline ("Software Development")
- Format: Static PNG, 1200x630px

### Favicon approach
- Icon: Puff Puff Dev logo
- Theme support: Theme-adaptive (separate light and dark versions)
- Apple touch icon: Yes (180x180px for iOS home screen)
- Web manifest: Yes, include for "Add to Home Screen" capability

### Claude's Discretion
- Schema entity type choice (Organization vs Person)
- OG image color mode (dark vs light)
- Exact favicon color variations for theme adaptation
- Brotli compression implementation details
- Sitemap and robots.txt technical structure

</decisions>

<specifics>
## Specific Ideas

- OG image should incorporate the wave animation aesthetic from the site
- Favicon should work well at small sizes (16x16, 32x32) while being recognizable

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-seo-foundation*
*Context gathered: 2026-02-04*
