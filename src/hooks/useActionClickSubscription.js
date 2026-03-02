import { useEffect } from "react";
import { embedded } from "@salla.sa/embedded-sdk";
import logger from "../utils/logger.js";

/**
 * useActionClickSubscription - Subscribe to nav action button clicks
 *
 * This hook subscribes to clicks on the primary action button in the
 * Salla dashboard navigation bar. Use embedded.nav.setAction() to
 * configure the button first.
 *
 * @example
 * ```jsx
 * function MyComponent() {
 *   // Set up the action button
 *   useEffect(() => {
 *     embedded.nav.setAction({
 *       title: 'Save',
 *       value: 'save',
 *       icon: 'sicon-save'
 *     });
 *     return () => embedded.nav.clearAction();
 *   }, []);
 *
 *   // Handle clicks
 *   useActionClickSubscription((value) => {
 *     if (value === 'save') {
 *       saveData();
 *     }
 *   });
 * }
 * ```
 *
 * @param {function} onActionClick - Callback when action is clicked (receives action value)
 * @param {boolean} enabled - Whether subscription is active (default: true)
 */
export function useActionClickSubscription(onActionClick, enabled = true) {
  useEffect(() => {
    if (!enabled || !onActionClick) return;

    logger.log("Subscribing to nav action clicks...");
    const unsubscribe = embedded.nav.onActionClick((value) => {
      logger.log("Nav action clicked:", value);
      onActionClick(value);
    });

    return () => {
      logger.log("Unsubscribing from nav action clicks");
      unsubscribe();
    };
  }, [onActionClick, enabled]);
}
