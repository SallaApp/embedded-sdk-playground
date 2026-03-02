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
  const pendingSlugsRef = useRef([]);

  useEffect(() => {
    if (!embedded?.checkout?.onResult) return;

    const unsubscribe = embedded.checkout.onResult((result) => {
      const slugs = pendingSlugsRef.current;
      logger.log("Checkout result received:", result);

      // Update per-addon state for UI (toasts handled globally in App.jsx)
      const updateSlugs = (status, resultValue) => {
        if (!slugs.length) return;
        setCheckoutStates((prev) => {
          const next = { ...prev };
          for (const slug of slugs) {
            next[slug] = { status, result: resultValue };
          }
          return next;
        });
      };

      if (result.success) {
        const statusText = result.status === "pending" ? "pending" : "success";
        updateSlugs(statusText, result);
      } else if (result.status === "cancelled") {
        updateSlugs("idle", null);
      } else {
        updateSlugs("error", result);
      }

      pendingSlugsRef.current = [];
    });

    return unsubscribe;
  }, [embedded]);

  const initiateCheckout = useCallback(
    (addonOrAddons) => {
      const addons = Array.isArray(addonOrAddons)
        ? addonOrAddons
        : [addonOrAddons];
      const slugs = addons.map((a) => a.slug);

      try {
        pendingSlugsRef.current = slugs;
        setCheckoutStates((prev) => {
          const next = { ...prev };
          for (const addon of addons) {
            next[addon.slug] = { status: "pending", result: null };
          }
          return next;
        });

        if (addons.length === 1) {
          const addon = addons[0];
          showToast(`Initiating checkout for ${addon.name}...`, "info");
          embedded.checkout.create(
            { type: "addon", slug: addon.slug, quantity: addon._quantity || 1 },
            { context: { addonSlug: addon.slug } },
          );
        } else {
          showToast(
            `Initiating checkout for ${addons.length} items...`,
            "info",
          );
          embedded.checkout.create(
            addons.map((a) => ({
              type: "addon",
              slug: a.slug,
              quantity: a._quantity || 1,
            })),
            { context: { addonSlugs: slugs } },
          );
        }
      } catch (err) {
        logger.error("Checkout create error:", err);
        showToast(`Checkout error: ${err.message}`, "error");
        setCheckoutStates((prev) => {
          const next = { ...prev };
          for (const slug of slugs) {
            next[slug] = {
              status: "error",
              result: { error: { message: err.message } },
            };
          }
          return next;
        });
        pendingSlugsRef.current = [];
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
