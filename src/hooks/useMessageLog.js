import { useState, useCallback } from "react";
import logger from "../utils/logger.js";

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
