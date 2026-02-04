# Phase 9: Contact Section - Context

**Gathered:** 2026-02-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Visitors can contact Puff Puff Dev via a contact form and find social profiles (GitHub, LinkedIn). Email is not directly displayed to prevent spam — all inquiries go through the form. Creating email responses or CRM integration are separate concerns.

</domain>

<decisions>
## Implementation Decisions

### Layout & Structure
- Card-based layout: form in a centered card
- Social links positioned below the form card
- Card styling matches existing site patterns (shadow, border, theme)
- Stacks appropriately on mobile

### Contact Form
- Minimal 3 fields: Name, Email, Message
- Validation triggers on blur (when user leaves field)
- After successful submission: form is replaced with thank-you message (not inline, replaces)
- Backend: Formspree (requires account setup — noted in STATE.md pending todos)

### Social Links
- Platforms featured: GitHub + LinkedIn only
- Display style: Icons only (no text labels)
- Opens in new tab with proper rel attributes

### Email Handling
- No email address displayed (spam protection)
- All contact goes through the form
- Formspree delivers submissions to configured email

### Claude's Discretion
- Section heading text (friendly vs direct)
- Icon arrangement below card (horizontal row, with/without spacing)
- Icon library choice (Lucide, brand icons, or custom SVG)
- Whether to add a copy-to-clipboard button for email (consider if user changes mind)
- Loading state during form submission
- Error message styling

</decisions>

<specifics>
## Specific Ideas

- User explicitly wants to prevent bots/crawlers from harvesting email — form-only approach chosen for this reason
- Should feel cohesive with existing site design (card patterns, theming)
- Keyboard accessibility required (Tab, Enter, Escape work properly)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-contact-section*
*Context gathered: 2026-02-04*
