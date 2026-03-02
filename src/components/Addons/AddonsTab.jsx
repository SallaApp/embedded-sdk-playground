import { useState, useEffect, useCallback, useRef } from "react";
import { useCheckoutFlow } from "../../hooks/useCheckoutFlow.js";
import AddonCard from "./AddonCard.jsx";
import Button from "../forms/Button.jsx";
import logger from "../../utils/logger.js";

export default function AddonsTab({ embedded, logMessage, showToast }) {
  const [addons, setAddons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState(new Set());
  const hasFetchedRef = useRef(false);
  // Keep a ref so the onActionClick handler always sees latest state
  const buySelectedRef = useRef(null);

  const { initiateCheckout, getCheckoutState } = useCheckoutFlow(
    embedded,
    showToast,
  );

  const toggleSelect = useCallback((slug) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }, []);

  const handleBuySelected = useCallback(() => {
    const selected = addons.filter((a) => selectedAddons.has(a.slug));
    if (!selected.length) return;
    logMessage("outgoing", {
      event: "embedded::checkout.create",
      items: selected.map((a) => ({
        type: "addon",
        slug: a.slug,
        quantity: a._quantity || 1,
      })),
    });
    initiateCheckout(selected);
    setSelectedAddons(new Set());
  }, [addons, selectedAddons, logMessage, initiateCheckout]);

  // Keep ref in sync for the action click handler
  buySelectedRef.current = handleBuySelected;

  // Manage nav action button based on selection
  useEffect(() => {
    if (!embedded?.nav) return;

    if (selectedAddons.size > 0) {
      embedded.nav.setAction({
        title: `Buy Selected (${selectedAddons.size})`,
        value: "buy-selected",
        icon: "hgi hgi-stroke hgi-shopping-cart-01",
      });
    } else {
      embedded.nav.clearAction();
    }
  }, [selectedAddons.size, embedded]);

  // Subscribe to nav action clicks & clean up on unmount
  useEffect(() => {
    if (!embedded?.nav?.onActionClick) return;

    const unsubscribe = embedded.nav.onActionClick((value) => {
      if (value === "buy-selected") {
        buySelectedRef.current?.();
      }
    });

    return () => {
      unsubscribe();
      embedded.nav.clearAction();
    };
  }, [embedded]);

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
      items: [
        { type: "addon", slug: addon.slug, quantity: addon._quantity || 1 },
      ],
    });
    initiateCheckout(addon);
  };

  const handleQuantityChange = useCallback((slug, quantity) => {
    setAddons((prev) =>
      prev.map((a) => (a.slug === slug ? { ...a, _quantity: quantity } : a)),
    );
  }, []);

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
              selected={selectedAddons.has(addon.slug)}
              onToggleSelect={toggleSelect}
              onQuantityChange={handleQuantityChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
