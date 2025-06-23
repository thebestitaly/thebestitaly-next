'use client';

import { useEffect } from 'react';

// Global gtag type declaration
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface PerformanceMetrics {
  CLS: number;
  FID: number;
  FCP: number;
  LCP: number;
  TTFB: number;
}

export default function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    // Simple performance tracking
    const trackPerformance = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        // Track page load time
        window.addEventListener('load', () => {
          const loadTime = performance.now();
          console.log('Page Load Time:', Math.round(loadTime), 'ms');
          
          // Send to Google Analytics if available
          if (window.gtag) {
            window.gtag('event', 'page_load_time', {
              value: Math.round(loadTime),
              event_category: 'performance',
            });
          }
        });

        // Track Core Web Vitals if supported
        if ('PerformanceObserver' in window) {
          try {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              entries.forEach((entry) => {
                console.log(`${entry.name}:`, Math.round(entry.startTime), 'ms');
              });
            });
            
            observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
            
            return () => observer.disconnect();
          } catch (e) {
            console.warn('PerformanceObserver not fully supported');
          }
        }
      }
    };

    trackPerformance();
  }, []);

  return null;
} 