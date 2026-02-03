import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock usehooks-ts to avoid window size issues in tests
vi.mock('usehooks-ts', () => ({
  useWindowSize: () => ({ width: 1024, height: 768 })
}));

// Mock react-spring parallax to avoid scroll container issues
vi.mock('@react-spring/parallax', () => ({
  Parallax: React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(
    function MockParallax({ children }, ref) {
      return <div data-testid="parallax" ref={ref}>{children}</div>;
    }
  ),
  ParallaxLayer: ({ children }: { children: React.ReactNode }) => <div data-testid="parallax-layer">{children}</div>,
  IParallax: {}
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Verify the main content renders - use getByAltText for the logo
    expect(screen.getByAltText('Puff Puff logo')).toBeInTheDocument();
  });

  it('renders Header component', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders hero content', () => {
    render(<App />);
    expect(screen.getByText(/Where Code Meets Creativity/i)).toBeInTheDocument();
    expect(screen.getByText(/Dreams Take Shape/i)).toBeInTheDocument();
  });

  it('renders intro section', () => {
    render(<App />);
    expect(screen.getByText(/Craft Applications Workshop/i)).toBeInTheDocument();
  });

  it('renders about section', () => {
    render(<App />);
    // Use getAllByText since "About" appears in nav and section
    const aboutElements = screen.getAllByText(/About/i);
    expect(aboutElements.length).toBeGreaterThan(0);
  });
});
