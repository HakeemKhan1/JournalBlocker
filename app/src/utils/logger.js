/**
 * Environment-aware logging utility
 * Logs are only output in development mode
 */

const isDev = __DEV__;

export const logger = {
  log: (...args) => isDev && console.log(...args),
  warn: (...args) => isDev && console.warn(...args),
  error: (...args) => isDev && console.error(...args),
  info: (...args) => isDev && console.info(...args),
  debug: (...args) => isDev && console.debug(...args),
};

export default logger;

