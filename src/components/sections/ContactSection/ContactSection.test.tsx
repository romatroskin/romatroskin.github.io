import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import ContactSection from './ContactSection';

// Mock @formspree/react
const mockHandleSubmit = vi.fn((e) => e.preventDefault());
vi.mock('@formspree/react', () => ({
  useForm: vi.fn(() => [
    { submitting: false, succeeded: false, errors: [] },
    mockHandleSubmit,
  ]),
  ValidationError: () => null,
}));

// Mock react-social-icons
vi.mock('react-social-icons', () => ({
  SocialIcon: ({ url, 'aria-label': ariaLabel, ...props }: { url: string; 'aria-label'?: string }) => (
    <a href={url} aria-label={ariaLabel} {...props} data-testid="social-icon">
      Social Icon
    </a>
  ),
}));

// Import the mock so we can control it in tests
import { useForm } from '@formspree/react';
const mockUseForm = vi.mocked(useForm);

describe('ContactSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset useForm mock to default state
    mockUseForm.mockReturnValue([
      { submitting: false, succeeded: false, errors: [] },
      mockHandleSubmit,
    ]);
  });

  describe('Rendering', () => {
    it('renders contact form with all required fields', () => {
      render(<ContactSection />);

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    });

    it('renders section heading', () => {
      render(<ContactSection />);

      expect(screen.getByRole('heading', { name: /get in touch/i })).toBeInTheDocument();
    });

    it('renders social links', () => {
      render(<ContactSection />);

      const socialIcons = screen.getAllByTestId('social-icon');
      expect(socialIcons).toHaveLength(2);

      // Check GitHub link
      expect(screen.getByLabelText(/github/i)).toHaveAttribute('href', expect.stringContaining('github.com'));

      // Check LinkedIn link
      expect(screen.getByLabelText(/linkedin/i)).toHaveAttribute('href', expect.stringContaining('linkedin.com'));
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<ContactSection />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has accessible form labels', () => {
      render(<ContactSection />);

      // All inputs have associated labels
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const messageInput = screen.getByLabelText(/message/i);

      expect(nameInput).toHaveAccessibleName();
      expect(emailInput).toHaveAccessibleName();
      expect(messageInput).toHaveAccessibleName();
    });

    it('marks required fields with aria-required', () => {
      render(<ContactSection />);

      expect(screen.getByLabelText(/name/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/message/i)).toHaveAttribute('aria-required', 'true');
    });

    it('has section with proper landmark', () => {
      render(<ContactSection />);

      const section = screen.getByRole('region', { name: /get in touch/i });
      expect(section).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('shows error on blur when name is empty', async () => {
      const user = userEvent.setup();
      render(<ContactSection />);

      const nameInput = screen.getByLabelText(/name/i);
      await user.click(nameInput);
      await user.tab(); // Blur

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/name is required/i);
      });
    });

    it('shows error on blur when email is empty', async () => {
      const user = userEvent.setup();
      render(<ContactSection />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.click(emailInput);
      await user.tab(); // Blur

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/email is required/i);
      });
    });

    it('shows error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<ContactSection />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Blur

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/valid email/i);
      });
    });

    it('shows error on blur when message is empty', async () => {
      const user = userEvent.setup();
      render(<ContactSection />);

      const messageInput = screen.getByLabelText(/message/i);
      await user.click(messageInput);
      await user.tab(); // Blur

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/message is required/i);
      });
    });

    it('sets aria-invalid when field has error', async () => {
      const user = userEvent.setup();
      render(<ContactSection />);

      const nameInput = screen.getByLabelText(/name/i);
      await user.click(nameInput);
      await user.tab(); // Blur

      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('clears error when valid input provided', async () => {
      const user = userEvent.setup();
      render(<ContactSection />);

      const nameInput = screen.getByLabelText(/name/i);
      await user.click(nameInput);
      await user.tab(); // Blur - triggers error

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });

      // Now type valid input
      await user.type(nameInput, 'John Doe');

      await waitFor(() => {
        expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('shows loading state during submission', () => {
      mockUseForm.mockReturnValue([
        { submitting: true, succeeded: false, errors: [] },
        mockHandleSubmit,
      ]);

      render(<ContactSection />);

      const submitButton = screen.getByRole('button', { name: /sending/i });
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveAttribute('aria-busy', 'true');
    });

    it('shows success message after submission', () => {
      mockUseForm.mockReturnValue([
        { submitting: false, succeeded: true, errors: [] },
        mockHandleSubmit,
      ]);

      render(<ContactSection />);

      expect(screen.getByText(/thank you/i)).toBeInTheDocument();
      expect(screen.queryByRole('form')).not.toBeInTheDocument();
    });

    it('keeps social links visible after success', () => {
      mockUseForm.mockReturnValue([
        { submitting: false, succeeded: true, errors: [] },
        mockHandleSubmit,
      ]);

      render(<ContactSection />);

      const socialIcons = screen.getAllByTestId('social-icon');
      expect(socialIcons).toHaveLength(2);
    });
  });

  describe('Keyboard Navigation', () => {
    it('allows tab navigation through form fields', async () => {
      const user = userEvent.setup();
      render(<ContactSection />);

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const messageInput = screen.getByLabelText(/message/i);
      const submitButton = screen.getByRole('button', { name: /send message/i });

      // Focus first field
      await user.click(nameInput);
      expect(nameInput).toHaveFocus();

      // Tab to email
      await user.tab();
      expect(emailInput).toHaveFocus();

      // Tab to message
      await user.tab();
      expect(messageInput).toHaveFocus();

      // Tab to submit
      await user.tab();
      expect(submitButton).toHaveFocus();
    });
  });
});
