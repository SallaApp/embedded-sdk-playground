import { useState, useEffect, useCallback, useRef } from "react";
import logger from "../utils/logger.js";

/**
 * Hook for the Checkout tab: opens a server-created checkout by ID and
 * tracks the last result.
 *
 * Note: Toasts for results are handled globally by useCheckoutResultSubscription in App.jsx.
 *
 * @param {object} embedded - The embedded SDK instance
 * @param {function} showToast - Toast notification function (for initiation and thrown errors)
 */
export function useCheckoutById(embedded, showToast) {
  const [status, setStatus] = useState("idle");
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);
  const pendingRef = useRef(false);

  useEffect(() => {
    if (!embedded?.checkout?.onResult) return;

    const unsubscribe = embedded.checkout.onResult((result) => {
      // Ignore addon checkout results unless one of ours is in flight
      if (!result.checkout_id && !pendingRef.current) return;
      logger.log("Checkout by ID result received:", result);

      pendingRef.current = false;
      setLastResult(result);
      setStatus(result.success ? "success" : "error");
    });

    return unsubscribe;
  }, [embedded]);

  const startCheckout = useCallback(
    (checkoutId, context) => {
      setError(null);
      setLastResult(null);

      try {
        pendingRef.current = true;
        setStatus("pending");
        showToast(`Initiating checkout ${checkoutId}...`, "info");
        embedded.checkout.create({ checkout_id: checkoutId }, { context });
      } catch (err) {
        logger.error("Checkout create error:", err);
        showToast(`Checkout error: ${err.message}`, "error");
        pendingRef.current = false;
        setStatus("error");
        setError({ code: err.code, message: err.message });
      }
    },
    [embedded, showToast],
  );

  return { startCheckout, status, lastResult, error };
}
