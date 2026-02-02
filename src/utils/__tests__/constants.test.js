import { describe, it, expect, afterEach } from "vitest";
import { VERIFY_FUNCTION_URL, getAppId } from "../constants.js";

describe("constants", () => {
  it("exports VERIFY_FUNCTION_URL as Netlify function path", () => {
    expect(VERIFY_FUNCTION_URL).toBe("/.netlify/functions/verify-token");
  });

  describe("getAppId", () => {
    const originalLocation = window.location;

    afterEach(() => {
      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
      });
    });

    it("returns app_id from URL search params when present", () => {
      Object.defineProperty(window, "location", {
        value: new URL("http://localhost/?app_id=my-app-123"),
        writable: true,
      });
      expect(getAppId()).toBe("my-app-123");
    });

    it("returns null when app_id is not in URL", () => {
      Object.defineProperty(window, "location", {
        value: new URL("http://localhost/?foo=bar"),
        writable: true,
      });
      expect(getAppId()).toBe(null);
    });

    it("returns null when search is empty", () => {
      Object.defineProperty(window, "location", {
        value: new URL("http://localhost/"),
        writable: true,
      });
      expect(getAppId()).toBe(null);
    });
  });
});
