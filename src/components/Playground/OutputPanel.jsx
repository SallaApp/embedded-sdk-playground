import { useState } from "react";
import { MessageSquare } from "lucide-react";
import Checkbox from "../forms/Checkbox.jsx";

function formatOutput(args) {
  // Keep output on one line - don't pretty print JSON
  try {
    // Try to parse as JSON to validate, but keep compact
    const parsed = JSON.parse(args);
    return JSON.stringify(parsed);
  } catch {
    return args;
  }
}

function getLogTypeColor(type) {
  switch (type) {
    case "log":
      return "var(--accent-info)";
    case "error":
      return "var(--accent-danger)";
    case "warn":
      return "var(--accent-warning)";
    case "info":
      return "var(--accent-primary)";
    case "debug":
      return "var(--text-secondary)";
    case "result":
      return "var(--accent-success)";
    default:
      return "var(--text-secondary)";
  }
}

function getLogTypeIcon(type) {
  switch (type) {
    case "log":
      return "ℹ";
    case "error":
      return "✗";
    case "warn":
      return "⚠";
    case "info":
      return "ℹ";
    case "debug":
      return "🔍";
    case "result":
      return "✓";
    default:
      return "•";
  }
}

export default function OutputPanel({ output, isExecuting }) {
  const [showTypeLabels, setShowTypeLabels] = useState(true);

  return (
    <div className="panel panel-log">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Output</h2>
          <span className="panel-subtitle">Console output and results</span>
        </div>
        <div className="panel-actions">
          <Checkbox
            checked={showTypeLabels}
            onChange={setShowTypeLabels}
            label="Show type labels"
          />
        </div>
      </div>
      <div className="log-container console-output">
        {output.length === 0 && !isExecuting ? (
          <div className="log-empty">
            <MessageSquare
              size={48}
              strokeWidth={1.5}
              style={{ opacity: 0.3 }}
            />
            <p>No output yet</p>
            <span>Write code and click "Run" to see results</span>
          </div>
        ) : (
          <>
            {output.map((entry, index) => (
              <div
                key={index}
                className={`console-entry console-${entry.type}`}
                style={{
                  borderLeft: `3px solid ${getLogTypeColor(entry.type)}`,
                }}
              >
                {showTypeLabels && (
                  <span
                    className="console-type"
                    style={{ color: getLogTypeColor(entry.type) }}
                  >
                    {getLogTypeIcon(entry.type)} {entry.type}
                  </span>
                )}
                <span className="console-data">{formatOutput(entry.args)}</span>
              </div>
            ))}
            {isExecuting && (
              <div className="console-entry console-executing">
                {showTypeLabels && (
                  <span
                    className="console-type"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    ⏳ executing
                  </span>
                )}
                <span className="console-data">Running code...</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
