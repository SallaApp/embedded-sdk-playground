import { useState, useEffect, useCallback, useRef } from "react";
import { embedded } from "@salla.sa/embedded-sdk";
import { verifyToken } from "../utils/tokenVerification.js";
import { useThemeSubscription } from "./useThemeSubscription.js";
import { useActionClickSubscription } from "./useActionClickSubscription.js";
import logger from "../utils/logger.js";

/**
 * useAppBootstrap - Complete Embedded App Initialization Flow
 *
 * This hook demonstrates the recommended way to initialize an embedded app
 * within the Salla merchant dashboard. Follow these steps in your own app:
 *
 * STEP 1: Initialize SDK
 *   - Call embedded.init() to establish connection with the host
 *   - Receive layout context (theme, locale, currency, width)
 *
 * STEP 2: Get Authentication Token
 *   - Token is passed via URL query parameter (?token=XXX)
 *   - Use embedded.auth.getToken() to retrieve it
 *
 * STEP 3: Verify Token (Recommended)
 *   - Send token to your backend for verification
 *   - This ensures the request is legitimate
 *
 * STEP 4: Signal Ready
 *   - Call embedded.ready() to remove the host's loading overlay
 *   - Your app is now visible to the user
 *
 * STEP 5: Subscribe to Events
 *   - Use embedded.onThemeChange() for theme updates
 *   - Use embedded.nav.onActionClick() for nav button clicks
 *
 * @example
 * ```jsx
 * function MyApp() {
 *   const { isReady, layout, verifiedData, error } = useAppBootstrap({
 *     onThemeChange: (theme) => console.log('Theme:', theme),
 *     onActionClick: (value) => console.log('Action:', value),
 *   });
 *
 *   if (error) return <ErrorPage message={error} />;
 *   if (!isReady) return <LoadingSpinner />;
 *
 *   return (
 *     <div data-theme={layout.theme}>
 *       <h1>Welcome, {verifiedData?.merchant_name}</h1>
 *     </div>
 *   );
 * }
 * ```
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.debug - Enable SDK debug logging (default: true)
 * @param {boolean} options.autoInit - Auto-initialize on mount (default: false)
 * @param {function} options.onThemeChange - Callback when theme changes
 * @param {function} options.onActionClick - Callback when nav action is clicked
 * @returns {Object} Bootstrap state and controls
 */
export function useAppBootstrap(options = {}) {
  const {
    debug = true,
    autoInit = false,
    onThemeChange,
    onActionClick,
  } = options;

  // ============================================
  // State
  // ============================================

  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [layout, setLayout] = useState(null);
  const [token, setToken] = useState(null);
  const [verifiedData, setVerifiedData] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState("idle"); // idle | verifying | verified | failed
  const [error, setError] = useState(null);

  const hasInitialized = useRef(false);

  // ============================================
  // STEP 1-4: Bootstrap Function
  // ============================================

  const bootstrap = useCallback(async () => {
    // Prevent double initialization
    if (hasInitialized.current || isInitializing) {
      logger.debug("Bootstrap already in progress or completed");
      return;
    }

    hasInitialized.current = true;
    setIsInitializing(true);
    setError(null);

    try {
      // ------------------------------------------
      // STEP 1: Initialize SDK
      // Establishes postMessage connection with host
      // ------------------------------------------
      logger.log("Step 1: Initializing SDK...");
      const { layout: initialLayout } = await embedded.init({ debug });
      setLayout(initialLayout);
      logger.log("Step 1 complete. Layout:", initialLayout);

      // ------------------------------------------
      // STEP 2: Get Token from URL
      // Token is passed as ?token=XXX query parameter
      // ------------------------------------------
      logger.log("Step 2: Getting token from URL...");
      const tokenValue = embedded.auth.getToken();
      setToken(tokenValue);
      logger.log("Step 2 complete. Token:", tokenValue ? "Found" : "Not found");

      // ------------------------------------------
      // STEP 3: Verify Token (if present)
      // Send to your backend for validation
      // ------------------------------------------
      if (tokenValue) {
        logger.log("Step 3: Verifying token...");
        setVerifyStatus("verifying");

        const result = await verifyToken(tokenValue);

        if (result.success) {
          setVerifiedData(result.data);
          setVerifyStatus("verified");
          logger.log("Step 3 complete. Verified:", result.data);
        } else {
          setVerifyStatus("failed");
          setError("Token verification failed");
          logger.error("Step 3 failed:", result.error);
          // Don't signal ready on verification failure
          setIsInitializing(false);
          return;
        }
      } else {
        logger.log("Step 3: Skipped (no token)");
        setVerifyStatus("idle");
      }

      // ------------------------------------------
      // STEP 4: Signal Ready
      // Removes the dashboard's loading overlay
      // ------------------------------------------
      logger.log("Step 4: Signaling ready...");
      embedded.ready();
      setIsReady(true);
      setIsInitializing(false);
      logger.log("Step 4 complete. App is ready!");
    } catch (err) {
      logger.error("Bootstrap error:", err);
      setError(err.message);
      setIsInitializing(false);
      hasInitialized.current = false; // Allow retry
    }
  }, [debug, isInitializing]);

  // ============================================
  // STEP 5: Subscribe to SDK Events
  // ============================================

  // Theme subscription - updates local layout state + calls user callback
  const handleThemeChange = useCallback(
    (newTheme) => {
      setLayout((prev) => (prev ? { ...prev, theme: newTheme } : prev));
      onThemeChange?.(newTheme);
    },
    [onThemeChange],
  );

  useThemeSubscription(handleThemeChange, isReady);
  useActionClickSubscription(onActionClick, isReady);

  // ============================================
  // Auto-init (optional)
  // ============================================

  useEffect(() => {
    if (autoInit && !hasInitialized.current) {
      bootstrap();
    }
  }, [autoInit, bootstrap]);

  // ============================================
  // Return API
  // ============================================

  return {
    // SDK instance (for direct API calls)
    embedded,

    // State
    isReady,
    isInitializing,
    layout,
    token,
    verifiedData,
    verifyStatus,
    error,

    // Actions
    bootstrap,
  };
}
