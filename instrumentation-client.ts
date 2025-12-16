// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

// Export the router transition handler for navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set the environment
  environment: process.env.NODE_ENV,

  // Adjust this value in production, or use tracesSampler for greater control
  // Using 10% sample rate to stay within free tier limits (10,000 transactions/month)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Disable session replay for free tier
  replaysOnErrorSampleRate: 0,
  replaysSessionSampleRate: 0,

  // Only send errors in production, or when DSN is explicitly set
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Filter out noisy errors
  beforeSend(event, hint) {
    const error = hint.originalException;

    // Ignore ResizeObserver errors (browser quirk, not actionable)
    if (error instanceof Error) {
      if (error.message.includes('ResizeObserver loop')) {
        return null;
      }
      // Ignore network errors that are expected (user offline, etc.)
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return null;
      }
    }

    return event;
  },
});

