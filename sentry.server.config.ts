// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://284d4afd3ddfa99f31f39830c66ebf8c@o4509580880117760.ingest.de.sentry.io/4509580880576592",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  
  // Environment configuration
  environment: process.env.NODE_ENV || 'development',
  
  // Performance monitoring configuration
  integrations: [
    // Add performance monitoring
    ...(process.env.NODE_ENV === 'production' ? [] : []),
  ],
  
  // Filter out non-critical errors in production
  beforeSend(event) {
    // In development, send all events
    if (process.env.NODE_ENV === 'development') {
      return event;
    }
    
    // In production, filter out some errors
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error?.type === 'ChunkLoadError' || 
          error?.value?.includes('Loading chunk') ||
          error?.value?.includes('ECONNRESET')) {
        return null; // Don't send these common errors
      }
    }
    
    return event;
  },
});
