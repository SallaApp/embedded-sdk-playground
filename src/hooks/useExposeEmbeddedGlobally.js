import { useEffect } from "react";
import { embedded } from "@salla.sa/embedded-sdk";

/**
 * useExposeEmbeddedGlobally - Expose SDK on window.salla.embedded
 *
 * TEST-KIT SPECIFIC: This hook is only needed for the Playground feature
 * where users can write code that references window.salla.embedded.
 *
 * Real apps should NOT use this - import the SDK directly instead:
 * ```js
 * import { embedded } from '@salla.sa/embedded-sdk';
 * ```
 */
export function useExposeEmbeddedGlobally() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.salla = window.salla || {};
      window.salla.embedded = embedded;
    }
  }, []);
}
