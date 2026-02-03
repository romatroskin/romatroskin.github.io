import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScrollSpy } from './useScrollSpy';

describe('useScrollSpy', () => {
  let mockObserve: ReturnType<typeof vi.fn>;
  let mockUnobserve: ReturnType<typeof vi.fn>;
  let mockDisconnect: ReturnType<typeof vi.fn>;
  let observerCallback: IntersectionObserverCallback;
  let mockIntersectionObserver: any;

  beforeEach(() => {
    // Create mock functions
    mockObserve = vi.fn();
    mockUnobserve = vi.fn();
    mockDisconnect = vi.fn();

    // Mock IntersectionObserver
    mockIntersectionObserver = vi.fn(function (
      this: any,
      callback: IntersectionObserverCallback
    ) {
      observerCallback = callback;
      this.observe = mockObserve;
      this.unobserve = mockUnobserve;
      this.disconnect = mockDisconnect;
    });

    global.IntersectionObserver = mockIntersectionObserver as any;

    // Create test section elements
    document.body.innerHTML = `
      <div id="section-1">Section 1</div>
      <div id="section-2">Section 2</div>
      <div id="section-3">Section 3</div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('returns empty string initially when no sections are intersecting', () => {
    const { result } = renderHook(() =>
      useScrollSpy(['section-1', 'section-2', 'section-3'])
    );

    expect(result.current).toBe('');
  });

  it('returns section ID when section is intersecting', () => {
    const { result } = renderHook(() =>
      useScrollSpy(['section-1', 'section-2', 'section-3'])
    );

    // Simulate section-2 intersecting
    const section2 = document.getElementById('section-2')!;
    act(() => {
      observerCallback(
        [
          {
            target: section2,
            isIntersecting: true,
            intersectionRatio: 0.8,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    });

    expect(result.current).toBe('section-2');
  });

  it('returns section with highest intersection ratio when multiple sections intersect', () => {
    const { result } = renderHook(() =>
      useScrollSpy(['section-1', 'section-2', 'section-3'])
    );

    // Simulate multiple sections intersecting
    const section1 = document.getElementById('section-1')!;
    const section2 = document.getElementById('section-2')!;
    act(() => {
      observerCallback(
        [
          {
            target: section1,
            isIntersecting: true,
            intersectionRatio: 0.3,
          } as IntersectionObserverEntry,
          {
            target: section2,
            isIntersecting: true,
            intersectionRatio: 0.7,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    });

    expect(result.current).toBe('section-2');
  });

  it('keeps previous active section when no sections are intersecting', () => {
    const { result } = renderHook(() =>
      useScrollSpy(['section-1', 'section-2', 'section-3'])
    );

    // First, make section-1 active
    const section1 = document.getElementById('section-1')!;
    act(() => {
      observerCallback(
        [
          {
            target: section1,
            isIntersecting: true,
            intersectionRatio: 0.8,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    });

    expect(result.current).toBe('section-1');

    // Now simulate no sections intersecting (scrolling between sections)
    act(() => {
      observerCallback(
        [
          {
            target: section1,
            isIntersecting: false,
            intersectionRatio: 0,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    });

    // Should keep section-1 as active
    expect(result.current).toBe('section-1');
  });

  it('observes all provided section elements', () => {
    renderHook(() => useScrollSpy(['section-1', 'section-2', 'section-3']));

    expect(mockObserve).toHaveBeenCalledTimes(3);
    expect(mockObserve).toHaveBeenCalledWith(document.getElementById('section-1'));
    expect(mockObserve).toHaveBeenCalledWith(document.getElementById('section-2'));
    expect(mockObserve).toHaveBeenCalledWith(document.getElementById('section-3'));
  });

  it('disconnects observer on unmount', () => {
    const { unmount } = renderHook(() =>
      useScrollSpy(['section-1', 'section-2', 'section-3'])
    );

    unmount();

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('re-observes when sectionIds array changes', () => {
    const { rerender } = renderHook(
      ({ ids }) => useScrollSpy(ids),
      {
        initialProps: { ids: ['section-1', 'section-2'] },
      }
    );

    expect(mockObserve).toHaveBeenCalledTimes(2);
    expect(mockDisconnect).toHaveBeenCalledTimes(0);

    // Change the section IDs
    rerender({ ids: ['section-2', 'section-3'] });

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
    expect(mockObserve).toHaveBeenCalledTimes(4); // 2 initial + 2 new
  });

  it('uses custom rootMargin and threshold options', () => {
    renderHook(() =>
      useScrollSpy(['section-1'], {
        rootMargin: '0px 0px -50% 0px',
        threshold: [0, 0.5, 1],
      })
    );

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        rootMargin: '0px 0px -50% 0px',
        threshold: [0, 0.5, 1],
      })
    );
  });

  it('handles missing section elements gracefully', () => {
    // Remove all sections
    document.body.innerHTML = '';

    const { result } = renderHook(() =>
      useScrollSpy(['nonexistent-1', 'nonexistent-2'])
    );

    // Should not crash and should observe zero elements
    expect(mockObserve).not.toHaveBeenCalled();
    expect(result.current).toBe('');
  });
});
