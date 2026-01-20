import logger from "../utils/logger.js";

function maskToken(token) {
  if (!token || token.length < 20) return token;
  return token.substring(0, 10) + "..." + token.substring(token.length - 10);
}

export default function DataDisplay({
  layoutData,
  token,
  verifiedData,
  verifyStatus,
}) {
  const handleTokenClick = async () => {
    if (token) {
      try {
        await navigator.clipboard.writeText(token);
        // Could show a toast here
      } catch (error) {
        logger.error("Failed to copy token:", error);
      }
    }
  };

  return (
    <>
      {/* Layout Data Panel */}
      <section className="panel panel-data">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Layout Data</h2>
            <span className="panel-subtitle">
              From embedded::context.provide
            </span>
          </div>
        </div>
        <div className="data-container">
          <div className="data-grid">
            <div className="data-item">
              <span className="data-label">Theme</span>
              <span className="data-value">{layoutData?.theme || "—"}</span>
            </div>
            <div className="data-item">
              <span className="data-label">Width</span>
              <span className="data-value">
                {layoutData?.width ? `${layoutData.width}px` : "—"}
              </span>
            </div>
            <div className="data-item">
              <span className="data-label">Locale</span>
              <span className="data-value">{layoutData?.locale || "—"}</span>
            </div>
            <div className="data-item">
              <span className="data-label">Currency</span>
              <span className="data-value">{layoutData?.currency || "—"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Token & Verification Data Panel */}
      <section className="panel panel-data">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Token Verification</h2>
            <span className="panel-subtitle">
              From URL param & API response
            </span>
          </div>
        </div>
        <div className="data-container">
          <div className="data-grid">
            <div className="data-item data-item-full">
              <span className="data-label">Token</span>
              <span
                className={`data-value data-value-truncate ${token ? "cursor-pointer" : ""}`}
                onClick={handleTokenClick}
                title={token ? "Click to copy" : ""}
              >
                {token ? maskToken(token) : "—"}
              </span>
            </div>
            <div className="data-item">
              <span className="data-label">Verify Status</span>
              <span
                className={`data-value ${
                  verifyStatus === "✓ Verified"
                    ? "data-value-success"
                    : verifyStatus === "✗ Failed"
                      ? "data-value-error"
                      : ""
                }`}
              >
                {verifyStatus}
              </span>
            </div>
            <div className="data-item">
              <span className="data-label">Store ID</span>
              <span className="data-value">
                {verifiedData?.store_id || "—"}
              </span>
            </div>
            <div className="data-item">
              <span className="data-label">User ID</span>
              <span className="data-value">{verifiedData?.user_id || "—"}</span>
            </div>
            <div className="data-item">
              <span className="data-label">Owner ID</span>
              <span className="data-value">
                {verifiedData?.owner_id || "—"}
              </span>
            </div>
            <div className="data-item">
              <span className="data-label">Expiry</span>
              <span className="data-value">{verifiedData?.exp || "—"}</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
