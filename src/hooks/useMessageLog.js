import { useState, useCallback } from "react";
import logger from "../utils/logger.js";

/**
 * useMessageLog - TEST CONSOLE TOOLING
 *
 * This hook provides message logging functionality for the test console.
 * It tracks all postMessage traffic between the iframe and host for debugging.
 *
 * ⚠️  NOTE: This is NOT part of a typical embedded app!
 * Real apps should use SDK subscriptions (onThemeChange, onActionClick, etc.)
 * instead of manually listening to postMessage events.
 *
 * This hook exists solely to help developers:
 * - Debug communication issues
 * - Understand the message format
 * - Test custom payloads
 *
 * @returns {Object} Message log state and controls
 * @returns {Array} messageLog - Array of logged messages
 * @returns {boolean} filterUnknown - Whether to filter unknown events
 * @returns {function} setFilterUnknown - Toggle unknown event filter
 * @returns {function} logMessage - Log a new message
 * @returns {function} clearLog - Clear all logged messages
 * @returns {function} copyLog - Copy log to clipboard
 */
export function useMessageLog() {
  const [messageLog, setMessageLog] = useState([]);
  const [filterUnknown, setFilterUnknown] = useState(true);

  const logMessage = useCallback(
    (direction, data, error = null, origin = null) => {
      const entry = {
        time: new Date().toISOString(),
        direction,
        event: data?.event || "unknown",
        data,
        error,
        origin,
      };

      setMessageLog((prev) => [...prev, entry]);
    },
    [],
  );

  const clearLog = useCallback(() => {
    setMessageLog([]);
  }, []);

  const copyLog = useCallback(async () => {
    const logText = messageLog
      .map((entry) => {
        return `[${entry.time}] ${entry.direction === "outgoing" ? "→" : "←"} ${entry.event}: ${JSON.stringify(entry.data)}`;
      })
      .join("\n");

    try {
      await navigator.clipboard.writeText(logText);
      return true;
    } catch (error) {
      logger.error("Failed to copy log:", error);
      return false;
    }
  }, [messageLog]);

  return {
    messageLog,
    filterUnknown,
    setFilterUnknown,
    logMessage,
    clearLog,
    copyLog,
  };
}
