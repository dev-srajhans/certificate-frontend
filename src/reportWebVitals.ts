const reportWebVitals = (onPerfEntry: (entry: import('web-vitals').Metric) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then((webVitals) => {
      webVitals.onCLS?.(onPerfEntry);
      webVitals.onFID?.(onPerfEntry);
      webVitals.onFCP?.(onPerfEntry);
      webVitals.onLCP?.(onPerfEntry);
      // Corrected or removed invalid method
      // webVitals.getTTFB?.(onPerfEntry);
    });
  }
};

export default reportWebVitals;
