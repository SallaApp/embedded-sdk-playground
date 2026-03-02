import { useEffect } from "react";
import { embedded } from "@salla.sa/embedded-sdk";
import logger from "../utils/logger.js";

/**
 * useThemeSubscription - Subscribe to theme changes from the host
 *
 * This hook subscribes to theme change events from the Salla dashboard.
 * Use it to keep your app's theme in sync with the host.
 *
 * @example
 * ```jsx
 * function MyComponent() {
 *   const [theme, setTheme] = useState('light');
 *
 *   useThemeSubscription((newTheme) => {
 *     setTheme(newTheme);
 *     document.body.dataset.theme = newTheme;
 *   });
 *
 *   return <div className={theme}>...</div>;
 * }
 * ```
 *
 * @param {function} onThemeChange - Callback when theme changes (receives 'light' | 'dark')
 * @param {boolean} enabled - Whether subscription is active (default: true)
 */
export function useThemeSubscription(onThemeChange, enabled = true) {
  useEffect(() => {
    if (!enabled || !onThemeChange) return;

    logger.log("Subscribing to theme changes...");
    const unsubscribe = embedded.onThemeChange((newTheme) => {
      logger.log("Theme changed:", newTheme);
      onThemeChange(newTheme);
    });

    return () => {
      logger.log("Unsubscribing from theme changes");
      unsubscribe();
    };
  }, [onThemeChange, enabled]);
}
