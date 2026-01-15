import { useState, useCallback } from "react";
import { verifyToken } from "../utils/tokenVerification.js";
import logger from "../utils/logger.js";

export function useBootstrap(
  embedded,
  onLayoutUpdate,
  onVerifiedDataUpdate,
  showToast,
) {
  const [token, setToken] = useState(null);
  const [verifiedData, setVerifiedData] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState("—");

  const bootstrap = useCallback(async () => {
    try {
      // Step 1: Initialize SDK and get layout info
      showToast("Initializing SDK...", "info");
      const { layout } = await embedded.init({ debug: true });

      onLayoutUpdate(layout);

      // Step 2: Get token from URL
      const tokenValue = embedded.auth.getToken();
      setToken(tokenValue);

      if (!tokenValue) {
        showToast("No token found in URL. Skipping verification.", "warning");
        embedded.ready();
        showToast("App ready (no token verification)", "success");
        return;
      }

      // Step 3: Verify token with backend API
      showToast("Verifying token...", "info");
      setVerifyStatus("Verifying...");

      const verifyResult = await verifyToken(tokenValue);

      if (verifyResult.success) {
        // Step 4a: Token valid - signal ready
        setVerifiedData(verifyResult.data);
        onVerifiedDataUpdate(verifyResult.data);
        setVerifyStatus("✓ Verified");
        embedded.ready();
        showToast("Token verified! App is ready.", "success");
      } else {
        // Step 4b: Token invalid - signal error
        setVerifyStatus("✗ Failed");
        showToast("Token verification failed!", "error");
        setTimeout(() => {
          embedded.ui.toast.error("Verification failed");
        }, 500);
        setTimeout(() => {
          embedded.destroy();
        }, 1500);
      }
    } catch (err) {
      logger.error("Bootstrap error:", err);
      showToast("Bootstrap failed: " + err.message, "error");
    }
  }, [embedded, onLayoutUpdate, onVerifiedDataUpdate, showToast]);

  return {
    token,
    verifiedData,
    verifyStatus,
    bootstrap,
  };
}
