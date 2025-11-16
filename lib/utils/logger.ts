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

export const logger = {
  error: (...args: unknown[]) => {
    if (shouldLog('error')) {
      // eslint-disable-next-line no-console
      console.error(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) {
      // eslint-disable-next-line no-console
      console.warn(...args);
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


