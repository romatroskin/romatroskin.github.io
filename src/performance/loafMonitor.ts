export function monitorLongAnimationFrames() {
  if (!PerformanceObserver.supportedEntryTypes?.includes('long-animation-frame')) {
    console.warn('Long Animation Frames API not supported');
    return;
  }

  const observer = new PerformanceObserver(list => {
    for (const entry of list.getEntries()) {
      // Focus on frames with user interactions and significant blocking
      const loafEntry = entry as PerformanceEntry & {
        blockingDuration?: number;
        firstUIEventTimestamp?: number;
        renderStart?: number;
        scripts?: Array<{
          invoker?: string;
          sourceURL?: string;
          sourceFunctionName?: string;
          duration?: number;
        }>;
      };

      if (loafEntry.blockingDuration && loafEntry.blockingDuration > 100 &&
          loafEntry.firstUIEventTimestamp && loafEntry.firstUIEventTimestamp > 0) {
        console.warn('Long animation frame detected:', {
          duration: `${Math.round(entry.duration)}ms`,
          blockingDuration: `${Math.round(loafEntry.blockingDuration)}ms`,
          renderStart: loafEntry.renderStart,
          scripts: loafEntry.scripts?.map(s => ({
            invoker: s.invoker,
            sourceURL: s.sourceURL?.split('/').pop(),
            functionName: s.sourceFunctionName,
            duration: s.duration
          }))
        });
      }
    }
  });

  observer.observe({ type: 'long-animation-frame', buffered: true });
}
