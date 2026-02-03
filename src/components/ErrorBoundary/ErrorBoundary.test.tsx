import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, WaveAnimationFallback, AppFallback } from './ErrorBoundary';

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

// Wrapper to test retry functionality
function RetryTestWrapper() {
  const [shouldThrow, setShouldThrow] = useState(true);

  return (
    <ErrorBoundary
      FallbackComponent={AppFallback}
      onReset={() => setShouldThrow(false)}
    >
      <ThrowError shouldThrow={shouldThrow} />
    </ErrorBoundary>
  );
}

describe('ErrorBoundary', () => {
  // Suppress console.error for expected errors in tests
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  describe('ErrorBoundary component', () => {
    it('renders children when no error', () => {
      render(
        <ErrorBoundary FallbackComponent={AppFallback}>
          <div>Child content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('renders fallback when error occurs', () => {
      render(
        <ErrorBoundary FallbackComponent={AppFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('supports retry via resetErrorBoundary', () => {
      render(<RetryTestWrapper />);

      // Should show fallback initially
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Click try again - this will reset the error boundary and update state
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(tryAgainButton);

      // After reset, onReset sets shouldThrow to false, so we should see "No error"
      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('resets on resetKeys change', () => {
      const { rerender } = render(
        <ErrorBoundary FallbackComponent={AppFallback} resetKeys={['key1']}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Change resetKeys and provide non-throwing component
      rerender(
        <ErrorBoundary FallbackComponent={AppFallback} resetKeys={['key2']}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });

  describe('WaveAnimationFallback', () => {
    it('renders gradient fallback with accessibility label', () => {
      render(
        <WaveAnimationFallback
          error={new Error('Wave error')}
          resetErrorBoundary={() => {}}
        />
      );

      const fallback = screen.getByRole('img', { name: /background animation unavailable/i });
      expect(fallback).toBeInTheDocument();
    });

    it('does not show retry button (silent fallback)', () => {
      render(
        <WaveAnimationFallback
          error={new Error('Wave error')}
          resetErrorBoundary={() => {}}
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('AppFallback', () => {
    it('renders error message and retry button', () => {
      render(
        <AppFallback
          error={new Error('App error')}
          resetErrorBoundary={() => {}}
        />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('calls resetErrorBoundary when retry clicked', () => {
      const mockReset = vi.fn();
      render(
        <AppFallback
          error={new Error('App error')}
          resetErrorBoundary={mockReset}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /try again/i }));
      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it('shows accessible alert role', () => {
      render(
        <AppFallback
          error={new Error('App error')}
          resetErrorBoundary={() => {}}
        />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
