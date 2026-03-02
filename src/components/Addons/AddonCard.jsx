import Button from "../forms/Button.jsx";

const STATUS_CONFIG = {
  idle: { label: "Buy", variant: "primary", disabled: false },
  pending: { label: "Processing...", variant: "warning", disabled: true },
  success: { label: "Purchased!", variant: "success", disabled: true },
  error: { label: "Retry", variant: "danger", disabled: false },
};

export default function AddonCard({
  addon,
  checkoutState,
  onBuy,
  selected,
  onToggleSelect,
  onQuantityChange,
}) {
  const { status } = checkoutState;
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  const quantity = addon._quantity || 1;

  return (
    <div
      className={`addon-card addon-card--${status}${selected ? " addon-card--selected" : ""}`}
    >
      <div className="addon-card-top">
        <label className="addon-card-select">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(addon.slug)}
          />
        </label>
        <div className="addon-card-header">
          <h3 className="addon-card-name">{addon.name}</h3>
          <span className="addon-card-slug">{addon.slug}</span>
        </div>
      </div>
      <p className="addon-card-description">{addon.description}</p>
      <div className="addon-card-footer">
        <div className="addon-card-price">
          <span className="addon-card-amount">{addon.price}</span>
          <span className="addon-card-currency">{addon.currency}</span>
        </div>
        <div className="addon-card-actions">
          <div className="addon-card-quantity-wrapper">
            <label className="addon-card-quantity-label">Qty</label>
            <input
              type="number"
              className="addon-card-quantity"
              min={1}
              value={quantity}
              onChange={(e) =>
                onQuantityChange(
                  addon.slug,
                  Math.max(1, parseInt(e.target.value) || 1),
                )
              }
            />
          </div>
          <Button
            variant={config.variant}
            disabled={config.disabled}
            onClick={() => onBuy(addon)}
          >
            {config.label}
          </Button>
        </div>
      </div>
      {status === "success" && checkoutState.result && (
        <div className="addon-card-result addon-card-result--success">
          Order: {checkoutState.result.order_id || "N/A"} — Status:{" "}
          {checkoutState.result.status}
        </div>
      )}
      {status === "error" && checkoutState.result?.error && (
        <div className="addon-card-result addon-card-result--error">
          Error: {checkoutState.result.error.message}
        </div>
      )}
    </div>
  );
}
