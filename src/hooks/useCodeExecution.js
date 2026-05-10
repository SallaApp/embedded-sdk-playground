import { useState, useCallback } from "react";
/* global console */

/**
 * Strip %c format specifiers and their style arguments from console log args
 * Handles styled console logs like: console.log('%cText %cMore', 'style1', 'style2', 'message')
 */
function stripConsoleStyles(...args) {
  if (args.length === 0) return "";

  const firstArg = String(args[0]);
  const percentCMatches = firstArg.match(/%c/g);
  const styleCount = percentCMatches ? percentCMatches.length : 0;

  // If no %c found, process normally
  if (styleCount === 0) {
    return args
      .map((a) =>
        typeof a === "object" ? JSON.stringify(a, null, 2) : String(a),
      )
      .join(" ");
  }

  // Remove %c from the format string
  let cleanedFormat = firstArg.replace(/%c/g, "");

  // Skip style arguments (they come after the format string)
  const messageArgs = args.slice(1 + styleCount);

  // Combine cleaned format with remaining message args
  const parts = [cleanedFormat, ...messageArgs].map((a) =>
    typeof a === "object" ? JSON.stringify(a, null, 2) : String(a),
  );

  return parts.join(" ");
}

export function useCodeExecution() {
  const [output, setOutput] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  // Console is patched once per page lifetime and never restored — original
  // methods remain reachable via `interceptor.original.*`. The previous
  // implementation re-patched on every executeCode call and restored after a
  // 2-second setTimeout, which raced with async code under test.
  const interceptor = globalThis.__playgroundConsoleInterceptor ?? {
    installed: false,
    sink: null,
    original: null,
  };
  globalThis.__playgroundConsoleInterceptor = interceptor;

  const ensureConsolePatched = useCallback(() => {
    if (interceptor.installed) return;

    interceptor.original = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug,
    };

    const methods = ["log", "error", "warn", "info", "debug"];
    for (const method of methods) {
      console[method] = (...args) => {
        if (interceptor.sink) {
          interceptor.sink({
            type: method,
            args: stripConsoleStyles(...args),
          });
        }
        interceptor.original[method](...args);
      };
    }

    interceptor.installed = true;
  }, [interceptor]);

  const executeCode = useCallback(
    (code) => {
      ensureConsolePatched();
      setIsExecuting(true);
      setOutput([]);

      const logs = [];
      interceptor.sink = (entry) => {
        logs.push(entry);
        setOutput([...logs]);
      };

      const processResult = (result) => {
        // Add result to output if present
        if (result !== undefined) {
          logs.push({
            type: "result",
            args:
              typeof result === "object"
                ? JSON.stringify(result, null, 2)
                : String(result),
          });
        }

        // Final output update
        setOutput([...logs]);
        setIsExecuting(false);
        interceptor.sink = null;

        return { result, logs, error: null };
      };

      const processError = (error) => {
        // Add error to logs
        logs.push({ type: "error", args: error.message });

        // Final output update
        setOutput([...logs]);
        setIsExecuting(false);
        interceptor.sink = null;

        return { result: null, logs, error: error.message };
      };

      try {
        // Execute code in current context
        const result = new Function(code)();

        // Handle promises (async code)
        if (result && typeof result.then === "function") {
          result
            .then((resolvedResult) => {
              processResult(resolvedResult);
            })
            .catch((error) => {
              processError(error);
            });
          // Don't restore console yet - wait for promise to resolve
          return { result: null, logs, error: null };
        } else {
          // Synchronous code - process immediately
          return processResult(result);
        }
      } catch (error) {
        return processError(error);
      }
    },
    [ensureConsolePatched, interceptor],
  );

  const clearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  return {
    output,
    isExecuting,
    executeCode,
    clearOutput,
  };
}
