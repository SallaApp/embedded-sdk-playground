import { useState, useEffect, useRef } from "react";
import { useToast } from "../contexts/ToastContext.jsx";

/**
 * useIframeAutoBootstrap
 *
 * Detects if the app is running in an iframe/popup and auto-triggers
 * the SDK bootstrap when embedded.
 *
 * @param {function} bootstrap - Bootstrap function from useAppBootstrap
 * @returns {{ iframeMode: string, parentOrigin: string|null, setParentOrigin: function }}
 */
export function useIframeAutoBootstrap(bootstrap) {
  const { showToast } = useToast();

  const [iframeMode, setIframeMode] = useState("standalone");
  const [parentOrigin, setParentOrigin] = useState(null);

  const bootstrapInitiatedRef = useRef(false);
  const isInIframeRef = useRef(false);

  // Detect iframe/popup mode on mount
  useEffect(() => {
    const isInIframe = window.parent !== window;
    const hasOpener = window.opener !== null;

    isInIframeRef.current = isInIframe;

    if (!isInIframe && !hasOpener) {
      setIframeMode("standalone");
    } else {
      setIframeMode(isInIframe ? "iframe" : "popup");
    }

    // Try to detect parent origin if same-origin
    if (isInIframe) {
      try {
        const origin = window.parent.location.origin;
        if (origin && origin !== window.location.origin) {
          setParentOrigin(origin);
        } else {
          setParentOrigin(window.location.origin + " (self)");
        }
      } catch {
        // Cross-origin: will be updated from postMessage
        setParentOrigin("Cross-origin");
      }
    }
  }, []);

  // Auto-bootstrap when in iframe
  useEffect(() => {
    if (isInIframeRef.current && !bootstrapInitiatedRef.current) {
      bootstrapInitiatedRef.current = true;
      // Small delay to ensure UI is ready
      setTimeout(() => {
        showToast("Initializing SDK...", "info");
        bootstrap();
      }, 500);
    }
  }, [bootstrap, showToast]);

  return { iframeMode, parentOrigin, setParentOrigin };
}
