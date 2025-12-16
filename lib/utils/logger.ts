import * as Sentry from '@sentry/nextjs';

type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

function getLogLevel(): LogLevel {
  if (typeof window === 'undefined') {
    return (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === 'production' ? 'error' : 'debug');
  }
  const fromEnv = (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || undefined;
  if (fromEnv) return fromEnv;
  return process.env.NODE_ENV === 'production' ? 'error' : 'debug';
}

const levelPriority: Record<LogLevel, number> = {
  silent: 5,
  error: 4,
  warn: 3,
  info: 2,
  debug: 1,
};

function shouldLog(level: LogLevel): boolean {
  const current = getLogLevel();
  return levelPriority[level] >= levelPriority[current];
}

interface ErrorContext {
  userId?: string;
  planId?: string;
  sessionId?: string;
  [key: string]: unknown;
}

function captureToSentry(error: unknown, context?: ErrorContext): void {
  // Only capture if Sentry is configured
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  if (error instanceof Error) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    // Convert non-Error to message
    Sentry.captureMessage(String(error), {
      level: 'error',
      extra: context,
    });
  }
}

export const logger = {
  error: (...args: unknown[]) => {
    if (shouldLog('error')) {
      // eslint-disable-next-line no-console
      console.error(...args);
    }
    // Capture to Sentry - find the first Error or string to report
    const errorArg = args.find((arg) => arg instanceof Error);
    const context = args.find((arg) => typeof arg === 'object' && arg !== null && !(arg instanceof Error)) as ErrorContext | undefined;
    
    if (errorArg) {
      captureToSentry(errorArg, context);
    } else if (args.length > 0) {
      // If no Error found, capture the first argument as the message
      captureToSentry(args[0], context);
    }
  },
  
  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) {
      // eslint-disable-next-line no-console
      console.warn(...args);
    }
    // Record warnings as breadcrumbs
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      const message = args.map((arg) => String(arg)).join(' ');
      Sentry.addBreadcrumb({
        category: 'warning',
        message,
        level: 'warning',
      });
    }
  },
  
  info: (...args: unknown[]) => {
    if (shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.info(...args);
    }
  },
  
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },
};
