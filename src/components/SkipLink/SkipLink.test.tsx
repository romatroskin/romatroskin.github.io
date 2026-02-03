import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { SkipLink } from './SkipLink';

describe('SkipLink', () => {
  it('renders skip link', () => {
    render(<SkipLink href="#main" />);
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('has correct href', () => {
    render(<SkipLink href="#main-content" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('has default accessible text', () => {
    render(<SkipLink href="#main" />);
    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
  });

  it('supports custom text', () => {
    render(<SkipLink href="#main">Skip navigation</SkipLink>);
    expect(screen.getByText('Skip navigation')).toBeInTheDocument();
  });

  it('is focusable', () => {
    render(<SkipLink href="#main" />);
    const link = screen.getByRole('link');
    link.focus();
    expect(link).toHaveFocus();
  });

  it('focuses target element on click', async () => {
    // Set up DOM with target element
    document.body.innerHTML = '<div id="main" tabindex="-1">Main content</div>';
    const container = document.createElement('div');
    document.body.appendChild(container);

    const user = userEvent.setup();
    render(<SkipLink href="#main" />, { container });

    const link = screen.getByRole('link');
    await user.click(link);

    const target = document.getElementById('main');
    expect(target).toHaveFocus();

    // Cleanup
    document.body.innerHTML = '';
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<SkipLink href="#main" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations with custom text', async () => {
      const { container } = render(
        <SkipLink href="#main">Skip to navigation</SkipLink>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('link has accessible name', () => {
      render(<SkipLink href="#main" />);
      const link = screen.getByRole('link');
      expect(link).toHaveAccessibleName('Skip to main content');
    });

    it('link is keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<SkipLink href="#main" />);

      // Tab to focus the link
      await user.tab();
      const link = screen.getByRole('link');
      expect(link).toHaveFocus();
    });
  });
});
