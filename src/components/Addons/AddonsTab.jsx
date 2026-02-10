import { useState, useEffect, useCallback, useRef } from "react";
import { useCheckoutFlow } from "../../hooks/useCheckoutFlow.js";
import AddonCard from "./AddonCard.jsx";
import Button from "../forms/Button.jsx";
import logger from "../../utils/logger.js";

export default function AddonsTab({ embedded, logMessage, showToast }) {
  const [addons, setAddons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetchedRef = useRef(false);

  const { initiateCheckout, getCheckoutState } = useCheckoutFlow(
    embedded,
    showToast,
  );

  const loadAddons = useCallback(
    async (force = false) => {
      if (!embedded?.checkout?.getAddons) {
        setError("SDK getAddons not available");
        setIsLoading(false);
        return;
      }

      // Prevent duplicate fetches from StrictMode, unless forced (refresh button)
      if (!force && hasFetchedRef.current) {
        return;
      }
      hasFetchedRef.current = true;

      setIsLoading(true);
      setError(null);

      try {
        logMessage("outgoing", { event: "embedded::checkout.getAddons" });
        const result = await embedded.checkout.getAddons();
        // Note: Response is logged by App.jsx's global message listener

        if (result.success) {
          setAddons(result.addons || []);
        } else {
          setError(result.error?.message || "Failed to fetch addons");
        }
      } catch (err) {
        logger.error("Failed to fetch addons:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [embedded, logMessage],
  );

  useEffect(() => {
    loadAddons();
  }, [loadAddons]);

  const handleBuy = (addon) => {
    logMessage("outgoing", {
      event: "embedded::checkout.create",
      item: { type: "addon", slug: addon.slug, quantity: 1 },
    });
    initiateCheckout(addon);
  };

  if (isLoading) {
    return (
      <div className="addons-container">
        <div className="addons-loading">Loading addons...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="addons-container">
        <div className="addons-error">
          <p>Failed to load addons: {error}</p>
          <Button variant="primary" onClick={() => loadAddons(true)}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="addons-container">
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Addon Store</h2>
            <span className="panel-subtitle">
              Test checkout flow with embedded.checkout.getAddons() and
              embedded.checkout.create()
            </span>
          </div>
          <div className="panel-actions">
            <Button onClick={() => loadAddons(true)}>Refresh</Button>
          </div>
        </div>
        <div className="addons-grid">
          {addons.map((addon) => (
            <AddonCard
              key={addon.slug}
              addon={addon}
              checkoutState={getCheckoutState(addon.slug)}
              onBuy={handleBuy}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
