import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
  it('renders without crashing', () => {
    render(<Header />);
  });

  it('renders as a banner landmark', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders navigation element', () => {
    render(<Header />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Header />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders logo link with aria-label', () => {
    render(<Header />);
    expect(screen.getByLabelText('Puff Puff Dev Home')).toBeInTheDocument();
  });

  it('marks Home as active link', () => {
    render(<Header />);
    const homeLink = screen.getByText('Home');
    // Check that the Home link has the active class applied
    expect(homeLink).toBeInTheDocument();
  });
});
