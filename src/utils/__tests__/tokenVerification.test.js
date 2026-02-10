import { describe, it, expect, vi, beforeEach } from "vitest";
import { verifyToken } from "../tokenVerification.js";
import { VERIFY_FUNCTION_URL } from "../constants.js";

vi.mock("../constants.js", () => ({
  VERIFY_FUNCTION_URL: "/server/functions/verify-token",
  getAppId: vi.fn(() => "test-app-id"),
}));

vi.mock("../logger.js", () => ({
  default: {
    error: vi.fn(),
  },
}));

describe("tokenVerification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls fetch with correct URL and POST body", async () => {
    const mockJson = vi.fn().mockResolvedValue({ success: true });
    global.fetch = vi.fn().mockResolvedValue({
      json: mockJson,
    });

    await verifyToken("my-token");

    expect(fetch).toHaveBeenCalledWith(VERIFY_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: "my-token",
        appId: "test-app-id",
        iss: "merchant-dashboard",
        subject: "embedded-page",
      }),
    });
    expect(mockJson).toHaveBeenCalled();
  });

  it("returns parsed JSON result on success", async () => {
    const result = { success: true, data: {} };
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(result),
    });

    const out = await verifyToken("token");
    expect(out).toEqual(result);
  });

  it("returns success false and error message on fetch failure", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const out = await verifyToken("token");
    expect(out).toEqual({ success: false, error: "Network error" });
  });
});
