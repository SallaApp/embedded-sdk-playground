export default function StatusBar({ isConnected, parentOrigin, iframeMode }) {
  return (
    <div className="status-bar">
      <div className="status-item">
        <span className="status-label">Status:</span>
        <span
          className={`status-badge ${
            isConnected ? "status-connected" : "status-disconnected"
          }`}
        >
          <span className="status-dot"></span>
          {isConnected ? "Connected" : "Waiting for Parent"}
        </span>
      </div>
      <div className="status-item">
        <span className="status-label">Parent Origin:</span>
        <code className="status-value">{parentOrigin || "—"}</code>
      </div>
      <div className="status-item">
        <span className="status-label">Mode:</span>
        <code className="status-value">{iframeMode}</code>
      </div>
    </div>
  );
}
