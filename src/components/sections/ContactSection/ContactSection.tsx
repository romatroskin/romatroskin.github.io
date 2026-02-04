import { useState, useCallback } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { SocialIcon } from 'react-social-icons';

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name: string;
  email: string;
  message: string;
}

interface TouchedFields {
  name: boolean;
  email: boolean;
  message: boolean;
}

// Placeholder - replace with actual Formspree form ID
const FORMSPREE_FORM_ID = 'YOUR_FORM_ID';

export default function ContactSection() {
  const [state, handleSubmit] = useForm(FORMSPREE_FORM_ID);
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({ name: '', email: '', message: '' });
  const [touched, setTouched] = useState<TouchedFields>({ name: false, email: false, message: false });

  const validateField = useCallback((field: keyof FormData, value: string): string => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        return '';
      case 'message':
        if (!value.trim()) return 'Message is required';
        if (value.trim().length < 10) return 'Message must be at least 10 characters';
        return '';
      default:
        return '';
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // If field was touched, validate on change for immediate feedback
    if (touched[name as keyof TouchedFields]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name as keyof FormData, value) }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((field: keyof FormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, formData[field]) }));
  }, [formData, validateField]);

  const isFormValid = useCallback(() => {
    const nameError = validateField('name', formData.name);
    const emailError = validateField('email', formData.email);
    const messageError = validateField('message', formData.message);
    return !nameError && !emailError && !messageError;
  }, [formData, validateField]);

  const onSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    // Touch all fields to show any errors
    setTouched({ name: true, email: true, message: true });

    // Validate all fields
    const newErrors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      message: validateField('message', formData.message),
    };
    setErrors(newErrors);

    // Only submit if valid
    if (isFormValid()) {
      handleSubmit(e);
    } else {
      e.preventDefault();
    }
  }, [formData, validateField, isFormValid, handleSubmit]);

  // Show success message after form submission
  if (state.succeeded) {
    return (
      <section id="contact-section" aria-labelledby="contact-heading">
        <div className="contact-container content-card">
          <div className="success-message" role="status" aria-live="polite">
            <h3>Thank you for reaching out!</h3>
            <p>We have received your message and will get back to you soon.</p>
          </div>
          <SocialLinks />
        </div>
      </section>
    );
  }

  return (
    <section id="contact-section" aria-labelledby="contact-heading">
      <div className="contact-container content-card">
        <h2 id="contact-heading" className="section-title">Get In Touch</h2>

        <form onSubmit={onSubmit} className="contact-form" noValidate>
          {/* Name field */}
          <div className="form-field">
            <label htmlFor="contact-name" className="form-label">
              Name <span aria-label="required">*</span>
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              onBlur={() => handleBlur('name')}
              aria-invalid={touched.name && !!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              aria-required="true"
              className="form-input"
              autoComplete="name"
            />
            {touched.name && errors.name && (
              <span id="name-error" className="form-error" role="alert">
                {errors.name}
              </span>
            )}
            <ValidationError prefix="Name" field="name" errors={state.errors} />
          </div>

          {/* Email field */}
          <div className="form-field">
            <label htmlFor="contact-email" className="form-label">
              Email <span aria-label="required">*</span>
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              aria-invalid={touched.email && !!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              aria-required="true"
              className="form-input"
              autoComplete="email"
            />
            {touched.email && errors.email && (
              <span id="email-error" className="form-error" role="alert">
                {errors.email}
              </span>
            )}
            <ValidationError prefix="Email" field="email" errors={state.errors} />
          </div>

          {/* Message field */}
          <div className="form-field">
            <label htmlFor="contact-message" className="form-label">
              Message <span aria-label="required">*</span>
            </label>
            <textarea
              id="contact-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              onBlur={() => handleBlur('message')}
              aria-invalid={touched.message && !!errors.message}
              aria-describedby={errors.message ? 'message-error' : undefined}
              aria-required="true"
              className="form-textarea"
              rows={5}
            />
            {touched.message && errors.message && (
              <span id="message-error" className="form-error" role="alert">
                {errors.message}
              </span>
            )}
            <ValidationError prefix="Message" field="message" errors={state.errors} />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={state.submitting}
            aria-busy={state.submitting}
            className="cta-primary"
            style={{ alignSelf: 'flex-start' }}
          >
            {state.submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        <SocialLinks />
      </div>
    </section>
  );
}

// Social links component
function SocialLinks() {
  return (
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
  );
}
