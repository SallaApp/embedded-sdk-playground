import { useState } from "react";
import { useCheckoutById } from "../../hooks/useCheckoutById.js";
import Button from "../forms/Button.jsx";

function ResultRow({ label, value }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value || "—"}</dd>
    </>
  );
}

export default function CheckoutTab({ embedded, logMessage, showToast }) {
  const [checkoutId, setCheckoutId] = useState("");
  const [contextText, setContextText] = useState("");
  const [contextError, setContextError] = useState(null);

  const { startCheckout, status, lastResult, error } = useCheckoutById(
    embedded,
    showToast,
  );

  const handleStart = () => {
    let context;
    if (contextText.trim()) {
      try {
        context = JSON.parse(contextText);
      } catch (err) {
        setContextError(`Invalid context JSON: ${err.message}`);
        return;
      }
    }
    setContextError(null);

    const id = checkoutId.trim();
    logMessage("outgoing", {
      event: "embedded::checkout.create",
      checkout_id: id,
      context,
    });
    startCheckout(id, context);
  };

  return (
    <div className="checkout-container">
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Checkout by ID</h2>
            <span className="panel-subtitle">
              Open a server-created checkout with embedded.checkout.create({"{"}{" "}
              checkout_id {"}"})
            </span>
          </div>
        </div>
        <div className="checkout-form">
          <label className="checkout-field">
            <span className="data-label">Checkout ID</span>
            <input
              type="text"
              className="checkout-input"
              placeholder="Paste the checkout_id from your backend"
              value={checkoutId}
              onChange={(e) => setCheckoutId(e.target.value)}
            />
          </label>
          <label className="checkout-field">
            <span className="data-label">Context (optional JSON)</span>
            <textarea
              className="payload-textarea"
              placeholder='{ "route": "/billing" }'
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
              spellCheck={false}
            />
          </label>
          <div>
            <Button variant="primary" onClick={handleStart}>
              {status === "pending" ? "Processing..." : "Start checkout"}
            </Button>
          </div>

          {contextError && (
            <div className="addon-card-result addon-card-result--error">
              {contextError}
            </div>
          )}

          {error && (
            <div className="addon-card-result addon-card-result--error">
              Error: {error.code ? `${error.code}: ` : ""}
              {error.message}
            </div>
          )}

          {lastResult && (
            <div
              className={`addon-card-result addon-card-result--${lastResult.success ? "success" : "error"}`}
            >
              <dl className="checkout-result-list">
                <ResultRow label="Status" value={lastResult.status} />
                <ResultRow label="Order ID" value={lastResult.order_id} />
                <ResultRow label="Checkout ID" value={lastResult.checkout_id} />
                <ResultRow label="Error code" value={lastResult.error?.code} />
                <ResultRow
                  label="Error message"
                  value={lastResult.error?.message}
                />
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
