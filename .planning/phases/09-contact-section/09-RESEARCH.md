# Phase 9: Contact Section - Research

**Researched:** 2026-02-04
**Domain:** React contact forms, form validation, accessibility, Formspree integration
**Confidence:** HIGH

## Summary

The contact section requires implementing a card-based contact form with Formspree backend integration, accessible form validation, social media links, and code splitting for optimal performance. The research confirms that the established patterns in this codebase (CSS Modules, Vitest + axe, React.lazy, controlled components with useState) align perfectly with current 2026 best practices for building accessible, performant contact forms.

The standard approach for 2026 is Formspree's `@formspree/react` library with its `useForm` hook for seamless integration, controlled components with `useState` for form state management, blur-based validation with ARIA attributes for accessibility, and CSS Modules for scoped styling. The form should replace itself with a success message after submission (not redirect) and include Formspree's built-in spam protection features.

**Primary recommendation:** Use `@formspree/react`'s `useForm` hook with controlled components, implement validation on blur with proper ARIA attributes, apply CSS Modules matching the existing `.content-card` pattern, lazy load the ContactSection component with React.lazy/Suspense (matching ServicesSection/AboutSection pattern), and use simple SVG icons or react-social-icons for GitHub/LinkedIn links.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @formspree/react | ^3.0.0 | Form backend integration | Official Formspree React library with hooks, handles submission state/errors/success, includes built-in spam protection |
| React (existing) | ^18.3.1 | UI framework | Already in use, controlled components are the 2026 standard for forms |
| TypeScript (existing) | ^5.5.3 | Type safety | Already in use, ensures type-safe form handling |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-social-icons | latest | Social media icons | Optional - provides ready-made GitHub/LinkedIn SVG icons with proper branding, tree-shaking support |
| lucide-react (existing) | latest | General icons (if needed) | Already in dependencies - but brand icons deprecated, use for non-brand icons only |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @formspree/react | React Hook Form + Formspree API | More control but requires manual state management, form serialization, error handling - overkill for 3-field form |
| @formspree/react | Formik + Formspree | More features but heavier bundle, unnecessary for simple contact form |
| Controlled components | Uncontrolled with refs | Less code but loses real-time validation, harder to manage, conflicts with blur validation requirement |
| react-social-icons | Custom SVG imports | More control but requires manual icon creation, maintenance burden |

**Installation:**
```bash
npm install @formspree/react react-social-icons
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── sections/
│       └── ContactSection/
│           ├── ContactSection.tsx       # Main section component
│           ├── ContactSection.module.css # Scoped styles
│           ├── ContactSection.test.tsx  # Vitest + axe tests
│           └── ContactForm.tsx          # Extracted form logic (optional)
```

### Pattern 1: Formspree useForm Hook Integration
**What:** The `useForm` hook manages form submission, state, and validation for Formspree
**When to use:** All Formspree integrations - it's the official React pattern
**Example:**
```typescript
// Source: Formspree official docs + WebSearch verified
import { useForm } from '@formspree/react';

function ContactForm() {
  const [state, handleSubmit, reset] = useForm('YOUR_FORM_ID');

  // state contains: submitting, succeeded, errors
  // handleSubmit is passed to form's onSubmit
  // reset clears state after submission

  if (state.succeeded) {
    return <ThankYouMessage />;
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Pattern 2: Controlled Components with Blur Validation
**What:** Form inputs managed by React state, validation triggered on blur event
**When to use:** Standard for React forms requiring validation before submission
**Example:**
```typescript
// Source: React best practices 2026 + WCAG compliance research
const [formData, setFormData] = useState({ name: '', email: '', message: '' });
const [errors, setErrors] = useState({ name: '', email: '', message: '' });
const [touched, setTouched] = useState({ name: false, email: false, message: false });

const handleBlur = (field: keyof typeof formData) => {
  setTouched(prev => ({ ...prev, [field]: true }));
  validateField(field, formData[field]);
};

const validateField = (field: string, value: string) => {
  // Validation logic runs on blur
  // Sets error messages for ARIA announcement
};
```

### Pattern 3: Accessible Error Messages
**What:** Associate error messages with inputs using `aria-describedby` and `aria-invalid`
**When to use:** All form validation - WCAG 3.3.1 requirement
**Example:**
```typescript
// Source: W3C WAI tutorials + WCAG 2026 research
<div>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    value={formData.email}
    onChange={handleChange}
    onBlur={() => handleBlur('email')}
    aria-invalid={touched.email && !!errors.email}
    aria-describedby={errors.email ? 'email-error' : undefined}
    aria-required="true"
  />
  {touched.email && errors.email && (
    <span id="email-error" className="error-message" role="alert">
      {errors.email}
    </span>
  )}
</div>
```

### Pattern 4: Form Replacement on Success
**What:** Replace entire form with thank-you message after successful submission
**When to use:** Per phase requirements - better UX for simple contact forms
**Example:**
```typescript
// Source: UX research 2026 + phase context
if (state.succeeded) {
  return (
    <div className="success-message" role="status">
      <h3>Thank you for reaching out!</h3>
      <p>We've received your message and will get back to you soon.</p>
    </div>
  );
}
```

### Pattern 5: Code Splitting with React.lazy
**What:** Lazy load ContactSection component to reduce initial bundle size
**When to use:** Below-fold sections - matches existing ServicesSection/AboutSection pattern
**Example:**
```typescript
// Source: React.lazy best practices 2026 + existing codebase pattern
// In App.tsx
const ContactSection = lazy(() => import('@/components/sections/ContactSection/ContactSection'));

// Usage in ParallaxLayer
<Suspense fallback={<SectionLoader />}>
  <ContactSection />
</Suspense>
```

### Pattern 6: CSS Modules for Scoped Styling
**What:** Component-scoped styles using .module.css files
**When to use:** All new components - established codebase pattern
**Example:**
```typescript
// Source: Existing codebase pattern + CSS Modules 2026 research
// ContactSection.module.css
.contactCard {
  composes: content-card from global;
  /* Additional contact-specific styles */
}

// ContactSection.tsx
import styles from './ContactSection.module.css';

<div className={styles.contactCard}>...</div>
```

### Anti-Patterns to Avoid
- **Validation only on submit:** WCAG requires real-time validation feedback, blur validation balances UX with accessibility
- **Disabled button during loading:** Use `aria-disabled` or `aria-busy` instead to maintain keyboard focus and announce state to screen readers
- **Color-only error indication:** WCAG 1.4.1 requires text messages, not just red borders
- **Missing aria-describedby:** Screen readers can't associate error messages with inputs without proper ARIA attributes
- **Global CSS for form components:** Breaks the established CSS Modules pattern, risks style conflicts
- **Redirecting to thank-you page:** Phase context explicitly requires form replacement, not redirect

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form backend/email delivery | Custom API endpoint | Formspree service | Handles email delivery, spam filtering (honeypot + reCAPTCHA), form state, CORS, rate limiting - significant infrastructure |
| Email validation regex | Custom regex | HTML5 `type="email"` + basic regex | Browser validation handles 95% of cases, accessible by default, no need to maintain complex regex |
| Form submission state | Manual fetch + useState | @formspree/react `useForm` hook | Handles loading, success, errors, retry logic, network failures automatically |
| Spam protection | Custom CAPTCHA integration | Formspree built-in (honeypot + reCAPTCHA v3) | reCAPTCHA v3 is invisible, honeypot requires zero user interaction, both included free |
| Social media icons | Manual SVG creation | react-social-icons or SVG imports | Professional branding compliance, maintained by community, proper accessibility |
| Loading spinner | Custom CSS animation | Simple CSS or existing patterns | Not worth the complexity for a contact form - CSS-only solution sufficient |

**Key insight:** Contact forms appear simple but involve significant complexity: email delivery infrastructure, spam prevention, state management, error handling, accessibility requirements, and browser compatibility. Formspree abstracts all backend complexity, allowing focus on UX and accessibility.

## Common Pitfalls

### Pitfall 1: Validation Triggers Too Early/Late
**What goes wrong:** Validating on every keystroke (onChange) annoys users; validating only on submit frustrates users who fix errors blindly
**Why it happens:** Unclear UX guidance on when validation should appear
**How to avoid:** Validate on blur (when user leaves field) - balances real-time feedback with non-intrusive UX. After blur, can switch to onChange for immediate feedback on fixes.
**Warning signs:** User complaints about "annoying" errors while typing, or confusion about what's wrong after submit

### Pitfall 2: Missing ARIA Attributes for Errors
**What goes wrong:** Screen readers don't announce form errors, failing WCAG 3.3.1
**Why it happens:** Visual error styling (red border) appears to work, but is invisible to assistive tech
**How to avoid:** Always pair visual errors with `aria-invalid`, `aria-describedby`, and `role="alert"` on error messages
**Warning signs:** Failing axe accessibility tests, screen reader users unable to complete form

### Pitfall 3: Form Doesn't Handle Network Failures
**What goes wrong:** Submit button gets stuck in loading state on network failure, form becomes unusable
**Why it happens:** Assuming `useForm` hook handles all errors automatically (it does server errors, not network failures)
**How to avoid:** Wrap form submission in try/catch, provide retry mechanism, clear loading state on timeout
**Warning signs:** User reports of "form won't work" after spotty network, button stuck as disabled

### Pitfall 4: Forgetting Formspree Setup Steps
**What goes wrong:** Form submits but returns 404 or 403 errors
**Why it happens:** Formspree requires account creation, form creation in dashboard, getting form ID, setting authorized domains
**How to avoid:** Follow complete setup: 1) Create Formspree account 2) Create form in dashboard 3) Copy form ID 4) Add production URL to authorized domains 5) Test with actual Formspree endpoint
**Warning signs:** Console errors with 404/403 status, submissions not appearing in Formspree dashboard

### Pitfall 5: Not Testing Lazy-Loaded Components
**What goes wrong:** ContactSection renders fine in isolation but breaks when lazy loaded due to export/import mismatch
**Why it happens:** Default exports vs named exports confusion with React.lazy
**How to avoid:** React.lazy requires default exports. If using named exports, re-export as default: `export default function ContactSection() {}` not `export const ContactSection = () => {}`
**Warning signs:** Runtime error "Element type is invalid", component not rendering in production build

### Pitfall 6: Keyboard Trap in Form
**What goes wrong:** Users can tab into form but can't tab out, trapped in form fields
**Why it happens:** Custom focus management or modal behavior without escape mechanism
**How to avoid:** Test keyboard navigation thoroughly - Tab should move forward through all inputs and submit button, then continue to next page element. Shift+Tab should reverse. No JavaScript focus trapping needed for standard forms.
**Warning signs:** Keyboard users unable to navigate past form, failing WCAG 2.1.2 No Keyboard Trap

### Pitfall 7: Social Links Missing rel="noopener noreferrer"
**What goes wrong:** Security vulnerability when opening external links in new tab, potential performance issue
**Why it happens:** Forgetting `rel` attribute when using `target="_blank"`
**How to avoid:** Always pair `target="_blank"` with `rel="noopener noreferrer"` to prevent window.opener access and tabnabbing attacks
**Warning signs:** Security audits flag links, Lighthouse performance warnings

## Code Examples

Verified patterns from official sources:

### Basic Formspree Integration
```typescript
// Source: @formspree/react docs + codebase patterns
import { useForm } from '@formspree/react';
import { useState } from 'react';

interface ContactSectionProps {
  // If needed - currently none per phase context
}

export default function ContactSection() {
  const [state, handleSubmit] = useForm('YOUR_FORM_ID'); // Get ID from Formspree dashboard

  if (state.succeeded) {
    return (
      <div className="success-message" role="status" aria-live="polite">
        <h3>Thank you for reaching out!</h3>
        <p>We've received your message and will get back to you soon.</p>
      </div>
    );
  }

  return (
    <section id="contact-section" aria-labelledby="contact-heading">
      <div className="content-card">
        <h2 id="contact-heading" className="section-title">Get In Touch</h2>
        <form onSubmit={handleSubmit}>
          {/* Form fields */}
        </form>
      </div>
    </section>
  );
}
```

### Complete Accessible Form Field
```typescript
// Source: W3C WAI + WCAG 2026 research
import { useState } from 'react';

// Inside component
const [formData, setFormData] = useState({ name: '', email: '', message: '' });
const [errors, setErrors] = useState<Record<string, string>>({});
const [touched, setTouched] = useState<Record<string, boolean>>({});

const validateEmail = (email: string): string => {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Please enter a valid email address (e.g., example@domain.com)';
  }
  return '';
};

const handleBlur = (field: string) => {
  setTouched(prev => ({ ...prev, [field]: true }));

  let error = '';
  if (field === 'email') error = validateEmail(formData.email);
  // ... other field validations

  setErrors(prev => ({ ...prev, [field]: error }));
};

// Render
<div className="form-field">
  <label htmlFor="email" className="form-label">
    Email <span aria-label="required">*</span>
  </label>
  <input
    id="email"
    name="email"
    type="email"
    value={formData.email}
    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
    onBlur={() => handleBlur('email')}
    aria-invalid={touched.email && !!errors.email}
    aria-describedby={errors.email ? 'email-error' : undefined}
    aria-required="true"
    className="form-input"
  />
  {touched.email && errors.email && (
    <span id="email-error" className="error-message" role="alert">
      {errors.email}
    </span>
  )}
</div>
```

### Social Links with Accessibility
```typescript
// Source: Phase context + WCAG research
// Option 1: react-social-icons
import { SocialIcon } from 'react-social-icons';

<div className="social-links" aria-label="Social media profiles">
  <SocialIcon
    url="https://github.com/puffpuffdev"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="GitHub profile (opens in new tab)"
    style={{ height: 44, width: 44 }}
  />
  <SocialIcon
    url="https://linkedin.com/company/puffpuffdev"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="LinkedIn profile (opens in new tab)"
    style={{ height: 44, width: 44 }}
  />
</div>

// Option 2: Custom SVG (if avoiding dependency)
<a
  href="https://github.com/puffpuffdev"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="GitHub profile (opens in new tab)"
  className="social-link"
>
  <svg width="44" height="44" viewBox="0 0 24 24" aria-hidden="true">
    {/* GitHub SVG path */}
  </svg>
</a>
```

### Submit Button with Loading State
```typescript
// Source: Accessible loading button research 2026
<button
  type="submit"
  disabled={state.submitting}
  aria-busy={state.submitting}
  aria-live="polite"
  className="cta-primary"
>
  {state.submitting ? 'Sending...' : 'Send Message'}
</button>
```

### CSS Module Styling
```css
/* ContactSection.module.css */
/* Source: Existing codebase patterns */

.contactCard {
  /* Inherit global content-card styles */
  composes: content-card from global;
  max-width: 600px;
  text-align: left;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
}

.formField {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.formLabel {
  font-weight: 500;
  color: var(--color-text-primary);
}

.formInput,
.formTextarea {
  padding: 0.75rem;
  min-height: 44px; /* WCAG touch target */
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 1rem;
  transition: border-color var(--transition-fast);
}

.formInput:focus,
.formTextarea:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-color: var(--color-accent);
}

.formInput[aria-invalid="true"],
.formTextarea[aria-invalid="true"] {
  border-color: #ef4444; /* Red for errors */
}

.errorMessage {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.socialLinks {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.socialLink {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  transition: transform var(--transition-fast);
}

.socialLink:hover {
  transform: scale(1.1);
}
```

### Vitest + Axe Testing Pattern
```typescript
// Source: Existing test patterns in codebase
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import ContactSection from './ContactSection';

// Mock @formspree/react
vi.mock('@formspree/react', () => ({
  useForm: vi.fn(() => [
    { submitting: false, succeeded: false, errors: [] },
    vi.fn(),
  ]),
}));

describe('ContactSection', () => {
  it('renders contact form', () => {
    render(<ContactSection />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ContactSection />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('shows validation errors on blur', async () => {
    const user = userEvent.setup();
    render(<ContactSection />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.click(emailInput);
    await user.tab(); // Blur

    expect(await screen.findByRole('alert')).toHaveTextContent(/email/i);
  });

  it('displays success message after submission', () => {
    vi.mocked(useForm).mockReturnValue([
      { submitting: false, succeeded: true, errors: [] },
      vi.fn(),
    ]);

    render(<ContactSection />);
    expect(screen.getByText(/thank you/i)).toBeInTheDocument();
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual fetch() to backend | @formspree/react useForm hook | 2020+ | Eliminates boilerplate, handles loading/errors automatically |
| Validation on submit only | Blur-based progressive validation | 2022+ (WCAG 2.2) | Better UX, earlier error detection, accessibility requirement |
| Global CSS | CSS Modules | 2023+ | Scoped styles, no conflicts, better maintainability |
| Class components | Functional + hooks | 2019+ (React 16.8) | Simpler code, better composability, smaller bundles |
| reCAPTCHA v2 (checkbox) | reCAPTCHA v3 (invisible) | 2021+ | No user interaction needed, better UX, same spam protection |
| Separate thank-you page | Inline success message | 2025+ | Simpler, no page reload, better for SPAs, maintains context |
| disabled button | aria-disabled or aria-busy | 2024+ (WCAG 2.2) | Maintains keyboard focus, announces state to screen readers |

**Deprecated/outdated:**
- **Uncontrolled forms with refs:** Still valid for simple use cases but controlled components are standard for forms requiring validation
- **Brand icons in Lucide:** Lucide deprecated brand icons (GitHub, LinkedIn, etc.) - use react-social-icons or custom SVG instead
- **Formik for simple forms:** Still maintained but overkill for 3-field contact forms - @formspree/react is lighter and specialized
- **Server-side form handling only:** Modern forms need client-side validation for UX, server-side for security

## Open Questions

Things that couldn't be fully resolved:

1. **Formspree Account Setup**
   - What we know: Requires account creation at formspree.io, form creation in dashboard to get form ID
   - What's unclear: Whether user has existing account, what email should receive submissions
   - Recommendation: Add to PLAN.md as prerequisite step - "Create Formspree account and form, add form ID to environment variable or config"

2. **Social Media URLs**
   - What we know: GitHub and LinkedIn only, icons without labels
   - What's unclear: Exact GitHub username/org and LinkedIn company page URLs
   - Recommendation: Add placeholder URLs in implementation, document where to update actual URLs

3. **Copy-to-Clipboard Email Feature**
   - What we know: Marked as "Claude's discretion" in phase context
   - What's unclear: Whether this adds value given email is spam-protected and not displayed
   - Recommendation: Skip initially - conflicts with "no email address displayed" decision. If user wants it later, can add as enhancement.

4. **Error Message Tone**
   - What we know: Should be user-friendly and helpful, not just "Invalid"
   - What's unclear: Preferred tone (friendly vs. professional, casual vs. formal)
   - Recommendation: Use helpful, professional tone: "Please enter a valid email address (e.g., example@domain.com)" rather than "Invalid email"

5. **Loading Spinner Design**
   - What we know: Should indicate loading during submission
   - What's unclear: Whether to use CSS-only, icon library, or custom design
   - Recommendation: Use text-only loading state ("Sending..." vs "Send Message") - simplest, most accessible, matches codebase minimalism

## Sources

### Primary (HIGH confidence)
- **@formspree/react npm package** - https://www.npmjs.com/package/@formspree/react - Installation, version, basic usage
- **W3C WAI Form Validation Tutorial** - https://www.w3.org/WAI/tutorials/forms/validation/ - WCAG-compliant validation patterns
- **MDN ARIA Attributes** - https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-disabled - aria-disabled vs disabled guidance
- **React Official Docs - Code Splitting** - https://legacy.reactjs.org/docs/code-splitting.html - React.lazy and Suspense patterns
- **Existing codebase** - App.tsx, ServicesSection, ThemeToggle.test.tsx, App.css - Established patterns and conventions

### Secondary (MEDIUM confidence)
- **Formspree Help - React Library** - https://help.formspree.io/hc/en-us/articles/360055613373-The-Formspree-React-library - useForm hook API
- **Formspree Help - Spam Protection** - https://help.formspree.io/hc/en-us/articles/360013580813-Honeypot-spam-filtering - Built-in spam features
- **AllAccessible - React WCAG Guide** - https://www.allaccessible.org/blog/react-accessibility-best-practices-guide - React accessibility patterns 2026
- **Medium - Building Accessible Forms** - https://medium.com/@amitonline/building-accessible-forms-in-react-a-comprehensive-guide - ARIA form patterns
- **Bekk Christmas - Accessible Loading Button** - https://www.bekk.christmas/post/2023/24/accessible-loading-button - aria-disabled vs disabled for loading states
- **React Hook Form Docs** - https://www.react-hook-form.com/advanced-usage/ - Alternative approaches (for context)
- **Pencil & Paper - Success Message UX** - https://www.pencilandpaper.io/articles/success-ux - Form success patterns
- **GetSiteControl - Thank You Messages** - https://getsitecontrol.com/usecase/thank-you-for-contacting-us-form-success-message/ - Success message best practices

### Tertiary (LOW confidence)
- **WebSearch - react-social-icons** - https://www.npmjs.com/package/react-social-icons - Social icon library option
- **WebSearch - Lucide brand icons deprecation** - https://github.com/lucide-icons/lucide/issues/670 - Why Lucide doesn't accept brand icons
- **Medium - CSS Modules 2026** - https://medium.com/@imranmsa93/react-css-in-2026-best-styling-approaches-compared-d5e99a771753 - CSS Modules still recommended
- **LogRocket - Code Splitting** - https://blog.logrocket.com/code-splitting-in-react-an-overview/ - Code splitting patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - @formspree/react is official library, well-documented, matches requirements perfectly
- Architecture: HIGH - All patterns verified against existing codebase (App.tsx, tests) and 2026 best practices
- Pitfalls: MEDIUM - Based on WebSearch + docs, but real-world pitfalls require implementation experience

**Research date:** 2026-02-04
**Valid until:** 30 days (stable ecosystem - React, Formspree API unlikely to change rapidly)

**Key decisions validated:**
- ✅ Formspree backend - official React library exists, handles all requirements
- ✅ 3-field form - minimal complexity, no need for form library beyond Formspree
- ✅ Blur validation - WCAG compliant, balances UX with accessibility
- ✅ Form replacement on success - modern SPA pattern, maintains context
- ✅ CSS Modules - matches codebase, scoped styling standard for 2026
- ✅ Code splitting - React.lazy pattern already used for ServicesSection/AboutSection
- ✅ Social icons - react-social-icons provides ready solution with accessibility
- ✅ No email display - Formspree handles backend, spam protection built-in

**Codebase alignment:**
- React 18 + TypeScript - ✅ Already in use
- CSS Modules - ✅ Already in use (waves.module.css, Header.module.css, etc.)
- Vitest + axe - ✅ Already in use (ThemeToggle.test.tsx pattern)
- React.lazy/Suspense - ✅ Already in use (ServicesSection, AboutSection)
- Controlled components + useState - ✅ Already in use (Header.tsx)
- WCAG 2.2 compliance - ✅ Already prioritized (min 44px targets, focus indicators, skip links)
