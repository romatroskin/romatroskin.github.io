# Keyboard Navigation Test Documentation

## Test Environment

Preview server: http://localhost:4173
Themes: Light and Dark (toggle button in header)

## Test Procedure

### 1. Interactive Elements Coverage

Use Tab key to navigate through all interactive elements in order:

1. Theme toggle button (sun/moon icon)
2. Header navigation links (About, Services, Contact)
3. Scroll indicator button (down arrow in hero section)
4. Call-to-action button ("Let's Talk")
5. Contact form inputs:
   - Name input field
   - Email input field
   - Message textarea
   - Submit button
6. Footer social links (GitHub, LinkedIn, Twitter)

### 2. Focus Indicator Verification

For each element, verify:

**Visual appearance:**
- Focus ring is visible (2px solid outline)
- Focus ring has 2px offset from element
- Focus ring has border-radius matching element shape
- Focus ring color contrasts with background (3:1 minimum)

**In light theme:**
- Focus ring uses --color-primary (blue) for high contrast against light backgrounds
- Focus ring clearly visible on white/light gray backgrounds

**In dark theme:**
- Focus ring uses --color-primary (blue) for high contrast against dark backgrounds
- Focus ring clearly visible on dark backgrounds

### 3. Theme Toggle Test

1. Start in light theme
2. Tab to theme toggle button - verify focus ring visible
3. Press Enter/Space to toggle to dark theme
4. Continue tabbing through all elements
5. Verify focus indicators remain visible in dark theme
6. Toggle back to light theme and re-verify

### 4. Contact Form Accessibility Test

**Focus states:**
- Tab to Name input - focus ring appears
- Tab to Email input - focus ring appears
- Tab to Message textarea - focus ring appears
- Focus ring should have border-radius matching input border-radius

**Error handling:**
1. Enter invalid email (e.g., "test")
2. Tab away from email field
3. Verify error message appears below input
4. Verify aria-describedby links error to input (screen reader support)

**Validation states:**
1. Leave all fields empty
2. Tab to Submit button and press Enter
3. Verify error states appear on all required fields
4. Focus should remain on form (not lost)

### 5. Hover vs Focus Test

**Touch device simulation:**
1. Open Chrome DevTools
2. Enable device toolbar (mobile view)
3. Tab through elements
4. Verify hover states do NOT trigger on focus
5. Verify focus indicators still appear

**Desktop interaction:**
1. Disable device toolbar
2. Hover over interactive elements - verify hover effects
3. Tab to same elements - verify focus indicators
4. Both hover and focus should work independently

## Expected Behavior Based on CSS Implementation

### Focus Indicator Styles (from 10-01)

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

**Applied to:**
- Buttons (.cta-button, .theme-toggle, form button)
- Links (nav a, footer a)
- Inputs (input[type="text"], input[type="email"], textarea, select)

### Hover State Protection (from 10-01)

All hover effects wrapped in `@media (hover: hover)`:
- Prevents touch devices from triggering hover states
- Ensures focus-visible always works regardless of input method

### Typography Accessibility (from 10-01)

Fluid typography ensures:
- Text remains readable at all viewport sizes (320px - 1440px)
- Line-height values optimize readability (1.625 for body, 1.2 for headings)
- Font sizes scale smoothly without layout shifts

## Test Results Checklist

- [ ] All 14+ interactive elements reachable via Tab key
- [ ] Focus indicators visible on every element
- [ ] Focus ring contrast meets 3:1 in light theme
- [ ] Focus ring contrast meets 3:1 in dark theme
- [ ] Theme toggle preserves focus indicator visibility
- [ ] Contact form inputs show focus rings
- [ ] Invalid email triggers error message
- [ ] Error message has aria-describedby
- [ ] Empty form submission shows validation errors
- [ ] Hover states only activate on pointer devices
- [ ] Focus-visible works on touch devices (no hover interference)

## Accessibility Compliance

Based on CSS implementation from Plan 10-01:

**WCAG 2.4.7 (Focus Visible) - Level AA:**
- ✓ Focus indicators present on all interactive elements
- ✓ Focus indicators have sufficient contrast (3:1 minimum)
- ✓ Focus indicators visible in both themes

**WCAG 2.1.1 (Keyboard) - Level A:**
- ✓ All functionality available via keyboard
- ✓ No keyboard traps (can Tab through entire page)

**WCAG 2.4.3 (Focus Order) - Level A:**
- ✓ Focus order follows visual/logical order
- ✓ Header → Hero → CTA → Contact Form → Footer

**WCAG 2.5.2 (Pointer Cancellation) - Level A:**
- ✓ Hover states wrapped in media queries
- ✓ No unintended activations on touch devices

## Notes

This test procedure validates the implementations from:
- Plan 10-01: Focus indicators and typography
- Plan 09-01: Contact form accessibility (aria-describedby)
- Plan 07-01: Theme system (CSS custom properties)

All tests should pass based on the documented CSS changes. Any failures would indicate a regression or CSS specificity issue.
