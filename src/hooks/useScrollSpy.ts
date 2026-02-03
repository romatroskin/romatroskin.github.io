import { useState, useEffect } from 'react';

export interface UseScrollSpyOptions {
  rootMargin?: string;
  threshold?: number | number[];
}

/**
 * Hook that tracks which section is currently visible in the viewport
 * using Intersection Observer API.
 *
 * @param sectionIds - Array of section IDs to observe
 * @param options - Optional IntersectionObserver configuration
 * @returns The ID of the currently active section, or empty string if none
 */
export function useScrollSpy(
  sectionIds: string[],
  options?: UseScrollSpyOptions
): string {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Default options optimized for section detection
    // rootMargin triggers when section is 10% from top of viewport
    const observerOptions: IntersectionObserverInit = {
      rootMargin: options?.rootMargin ?? '-10% 0px -85% 0px',
      threshold: options?.threshold ?? [0, 0.25, 0.5, 0.75, 1],
    };

    const observer = new IntersectionObserver((entries) => {
      // Find the entry with highest intersection ratio
      // This handles multiple sections intersecting simultaneously
      let maxRatio = 0;
      let activeEntry: IntersectionObserverEntry | undefined;

      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio;
          activeEntry = entry;
        }
      });

      // Only update if we found an intersecting section
      // This keeps the previous active section when scrolling between sections
      if (activeEntry) {
        setActiveId(activeEntry.target.id);
      }
    }, observerOptions);

    // Observe all section elements
    const elements: Element[] = [];
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
        elements.push(element);
      }
    });

    // Cleanup: disconnect observer on unmount or when sectionIds change
    return () => {
      observer.disconnect();
    };
  }, [sectionIds, options?.rootMargin, options?.threshold]);

  return activeId;
}
