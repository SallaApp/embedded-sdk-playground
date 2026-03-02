import { useRef, useEffect, useState, useCallback } from "react";
import { Trash2, Copy, MessageSquare } from "lucide-react";
import Checkbox from "./forms/Checkbox.jsx";
import Button from "./forms/Button.jsx";

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function LogEntry({ entry }) {
  const [expanded, setExpanded] = useState(false);

  const time = new Date(entry.time);
  const timeStr = time.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });

  const directionIcon = entry.direction === "outgoing" ? "→" : "←";
  const directionClass = entry.direction;
  const displayEvent = entry.event.replace("embedded::", "");

  let fullStr = "";
  let truncatedStr = "";
  let isTruncated = false;
  try {
    fullStr = JSON.stringify(entry.data, null, 2);
    const compactStr = JSON.stringify(entry.data, null, 0);
    if (compactStr.length > 80) {
      truncatedStr = compactStr.substring(0, 80) + "…";
      isTruncated = true;
    } else {
      truncatedStr = compactStr;
    }
  } catch {
    fullStr = String(entry.data);
    truncatedStr = fullStr;
  }

  const toggle = useCallback(() => {
    if (isTruncated) setExpanded((prev) => !prev);
  }, [isTruncated]);

  return (
    <div
      className={`log-entry${expanded ? " log-entry-expanded" : ""}`}
      data-event={entry.event}
    >
      <div className="log-entry-row" onClick={toggle}>
        <span className="log-time">{timeStr}</span>
        <span className={`log-direction ${directionClass}`}>
          {directionIcon}
        </span>
        <span className="log-event">{escapeHtml(displayEvent)}</span>
        <span className={`log-data${isTruncated ? " log-data-clickable" : ""}`}>
          {escapeHtml(truncatedStr)}
        </span>
      </div>
      {expanded && <pre className="log-data-full">{fullStr}</pre>}
    </div>
  );
}

export default function MessageLog({
  messageLog,
  filterUnknown,
  onFilterChange,
  onClear,
  onCopy,
}) {
  const logContainerRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [messageLog]);

  const filteredLog = filterUnknown
    ? messageLog.filter((entry) => entry.event !== "unknown")
    : messageLog;

  return (
    <section className="panel panel-log">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Message Log</h2>
          <span className="panel-subtitle">Real-time event stream</span>
        </div>
        <div className="panel-actions">
          <Checkbox
            checked={filterUnknown}
            onChange={onFilterChange}
            label="Hide unknown"
          />
          <Button title="Clear Log" onClick={onClear}>
            <Trash2 size={14} />
            Clear
          </Button>
          <Button title="Copy Log" onClick={onCopy}>
            <Copy size={14} />
            Copy
          </Button>
        </div>
      </div>
      <div ref={logContainerRef} className="log-container">
        {filteredLog.length === 0 ? (
          <div className="log-empty">
            <MessageSquare
              size={48}
              strokeWidth={1.5}
              style={{ opacity: 0.3 }}
            />
            <p>No messages yet</p>
            <span>{`Click "Init + Verify" to start the bootstrap flow`}</span>
          </div>
        ) : (
          filteredLog.map((entry, i) => (
            <LogEntry key={`${entry.time}-${i}`} entry={entry} />
          ))
        )}
      </div>
    </section>
  );
}
