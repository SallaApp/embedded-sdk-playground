/**
 * Custom logger utility for the SDK test app
 * All logs are prefixed with [sdk-test]
 */
/* global console */

const PREFIX = "[sdk-test]";

/**
 * Strip %c format specifiers and their style arguments from console log args
 * Handles styled console logs like: console.log('%cText %cMore', 'style1', 'style2', 'message')
 */
function stripConsoleStyles(...args) {
  if (args.length === 0) return [];

  const firstArg = String(args[0]);
  const percentCMatches = firstArg.match(/%c/g);
  const styleCount = percentCMatches ? percentCMatches.length : 0;

  // If no %c found, process normally
  if (styleCount === 0) {
    return args.map((arg) => {
      if (typeof arg === "object" && arg !== null) {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    });
  }

  // Remove %c from the format string
  let cleanedFormat = firstArg.replace(/%c/g, "");

  // Skip style arguments (they come after the format string)
  const messageArgs = args.slice(1 + styleCount);

  // Combine cleaned format with remaining message args
  const result = [cleanedFormat, ...messageArgs].map((arg) => {
    if (typeof arg === "object" && arg !== null) {
      try {
        return JSON.stringify(arg, null, 2);
      } catch (e) {
        return String(arg);
      }
    }
    return String(arg);
  });

  return result;
}

/**
 * Format arguments for logging
 */
function formatArgs(...args) {
  return stripConsoleStyles(...args);
}

/**
 * Custom logger with [sdk-test] prefix
 */
export const logger = {
  log: (...args) => {
    console.log(PREFIX, ...formatArgs(...args));
  },
  warn: (...args) => {
    console.warn(PREFIX, ...formatArgs(...args));
  },
  error: (...args) => {
    console.error(PREFIX, ...formatArgs(...args));
  },
  info: (...args) => {
    console.info(PREFIX, ...formatArgs(...args));
  },
  debug: (...args) => {
    console.debug(PREFIX, ...formatArgs(...args));
  },
};

export default logger;
