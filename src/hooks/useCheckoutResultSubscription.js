import { useEffect } from "react";
import { embedded } from "@salla.sa/embedded-sdk";
import { useToast } from "../contexts/ToastContext.jsx";

/**
 * useCheckoutResultSubscription
 *
 * Subscribes to checkout results and shows toast notifications.
 * Works after 3DS redirects when user lands back on the app.
 */
export function useCheckoutResultSubscription() {
  const { showToast } = useToast();

  useEffect(() => {
    if (!embedded?.checkout?.onResult) return;

    const unsubscribe = embedded.checkout.onResult((result) => {
      if (result.success) {
        const statusText = result.status === "pending" ? "pending" : "success";
        showToast(
          `Checkout ${statusText}! Order: ${result.order_id || "N/A"}`,
          statusText === "success" ? "success" : "warning",
        );
      } else if (result.status === "cancelled") {
        showToast("Checkout cancelled", "info");
      } else {
        const errorMsg = result.error?.message || result.status || "Failed";
        showToast(`Checkout failed: ${errorMsg}`, "error");
      }
    });

    return unsubscribe;
  }, [showToast]);
}
