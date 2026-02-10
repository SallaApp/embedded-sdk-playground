import Button from "../forms/Button.jsx";

const STATUS_CONFIG = {
  idle: { label: "Buy", variant: "primary", disabled: false },
  pending: { label: "Processing...", variant: "warning", disabled: true },
  success: { label: "Purchased!", variant: "success", disabled: true },
  error: { label: "Retry", variant: "danger", disabled: false },
};

export default function AddonCard({ addon, checkoutState, onBuy }) {
  const { status } = checkoutState;
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idle;

  return (
    <div className={`addon-card addon-card--${status}`}>
      <div className="addon-card-header">
        <h3 className="addon-card-name">{addon.name}</h3>
        <span className="addon-card-slug">{addon.slug}</span>
      </div>
      <p className="addon-card-description">{addon.description}</p>
      <div className="addon-card-footer">
        <div className="addon-card-price">
          <span className="addon-card-amount">{addon.price}</span>
          <span className="addon-card-currency">{addon.currency}</span>
        </div>
        <Button
          variant={config.variant}
          disabled={config.disabled}
          onClick={() => onBuy(addon)}
        >
          {config.label}
        </Button>
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
