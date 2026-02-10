import { useState, useEffect, useCallback, useRef } from "react";
import logger from "../utils/logger.js";

/**
 * Hook for managing per-addon checkout state in the Addons tab.
 * Subscribes to onResult to update UI state (button states, etc.).
 *
 * Note: Toasts are handled globally by useCheckoutResultSubscription in App.jsx.
 *
 * @param {object} embedded - The embedded SDK instance
 * @param {function} showToast - Toast notification function (for initiation message only)
 */
export function useCheckoutFlow(embedded, showToast) {
  const [checkoutStates, setCheckoutStates] = useState({});
  const pendingSlugRef = useRef(null);

  useEffect(() => {
    if (!embedded?.checkout?.onResult) return;

    const unsubscribe = embedded.checkout.onResult((result) => {
      const slug = pendingSlugRef.current;
      logger.log("Checkout result received:", result);

      // Update per-addon state for UI (toasts handled globally in App.jsx)
      if (result.success) {
        const statusText = result.status === "pending" ? "pending" : "success";
        if (slug) {
          setCheckoutStates((prev) => ({
            ...prev,
            [slug]: { status: statusText, result },
          }));
        }
      } else if (result.status === "cancelled") {
        if (slug) {
          setCheckoutStates((prev) => ({
            ...prev,
            [slug]: { status: "idle", result: null },
          }));
        }
      } else {
        if (slug) {
          setCheckoutStates((prev) => ({
            ...prev,
            [slug]: { status: "error", result },
          }));
        }
      }

      pendingSlugRef.current = null;
    });

    return unsubscribe;
  }, [embedded]);

  const initiateCheckout = useCallback(
    (addon) => {
      try {
        pendingSlugRef.current = addon.slug;
        setCheckoutStates((prev) => ({
          ...prev,
          [addon.slug]: { status: "pending", result: null },
        }));
        showToast(`Initiating checkout for ${addon.name}...`, "info");
        embedded.checkout.create(
          { type: "addon", slug: addon.slug, quantity: 1 },
          { context: { addonSlug: addon.slug } },
        );
      } catch (err) {
        logger.error("Checkout create error:", err);
        showToast(`Checkout error: ${err.message}`, "error");
        setCheckoutStates((prev) => ({
          ...prev,
          [addon.slug]: {
            status: "error",
            result: { error: { message: err.message } },
          },
        }));
        pendingSlugRef.current = null;
      }
    },
    [embedded, showToast],
  );

  const getCheckoutState = useCallback(
    (slug) => checkoutStates[slug] || { status: "idle", result: null },
    [checkoutStates],
  );

  return { initiateCheckout, getCheckoutState };
}
