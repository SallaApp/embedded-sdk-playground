import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// Mock the embedded SDK - must be defined before vi.mock
vi.mock("@salla.sa/embedded-sdk", () => ({
  embedded: {
    init: vi.fn(),
    ready: vi.fn(),
    auth: {
      getToken: vi.fn(),
    },
    onThemeChange: vi.fn(),
    nav: {
      onActionClick: vi.fn(),
    },
  },
}));

// Mock token verification
vi.mock("../../utils/tokenVerification.js", () => ({
  verifyToken: vi.fn(),
}));

// Mock subscription hooks
vi.mock("../useThemeSubscription.js", () => ({
  useThemeSubscription: vi.fn(),
}));

vi.mock("../useActionClickSubscription.js", () => ({
  useActionClickSubscription: vi.fn(),
}));

// Import after mocks are set up
import { useAppBootstrap } from "../useAppBootstrap.js";
import { embedded as mockEmbedded } from "@salla.sa/embedded-sdk";
import { verifyToken } from "../../utils/tokenVerification.js";
import { useThemeSubscription } from "../useThemeSubscription.js";
import { useActionClickSubscription } from "../useActionClickSubscription.js";

describe("useAppBootstrap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEmbedded.init.mockResolvedValue({
      layout: { theme: "light", locale: "ar", currency: "SAR", width: 1000 },
    });
    mockEmbedded.auth.getToken.mockReturnValue(null);
    mockEmbedded.onThemeChange.mockReturnValue(() => {});
    mockEmbedded.nav.onActionClick.mockReturnValue(() => {});
  });

  it("initializes with default state", () => {
    const { result } = renderHook(() => useAppBootstrap());

    expect(result.current.isReady).toBe(false);
    expect(result.current.isInitializing).toBe(false);
    expect(result.current.layout).toBe(null);
    expect(result.current.token).toBe(null);
    expect(result.current.verifiedData).toBe(null);
    expect(result.current.verifyStatus).toBe("idle");
    expect(result.current.error).toBe(null);
  });

  it("provides embedded SDK instance", () => {
    const { result } = renderHook(() => useAppBootstrap());
    expect(result.current.embedded).toBe(mockEmbedded);
  });

  it("bootstraps successfully without token", async () => {
    const { result } = renderHook(() => useAppBootstrap());

    await act(async () => {
      await result.current.bootstrap();
    });

    expect(mockEmbedded.init).toHaveBeenCalledWith({ debug: true });
    expect(mockEmbedded.auth.getToken).toHaveBeenCalled();
    expect(mockEmbedded.ready).toHaveBeenCalled();
    expect(result.current.isReady).toBe(true);
    expect(result.current.layout).toEqual({
      theme: "light",
      locale: "ar",
      currency: "SAR",
      width: 1000,
    });
  });

  it("bootstraps successfully with valid token", async () => {
    mockEmbedded.auth.getToken.mockReturnValue("test-token");
    verifyToken.mockResolvedValue({
      success: true,
      data: { merchant_id: "123", user_id: "456" },
    });

    const { result } = renderHook(() => useAppBootstrap());

    await act(async () => {
      await result.current.bootstrap();
    });

    expect(verifyToken).toHaveBeenCalledWith("test-token");
    expect(result.current.token).toBe("test-token");
    expect(result.current.verifiedData).toEqual({
      merchant_id: "123",
      user_id: "456",
    });
    expect(result.current.verifyStatus).toBe("verified");
    expect(result.current.isReady).toBe(true);
  });

  it("handles token verification failure", async () => {
    mockEmbedded.auth.getToken.mockReturnValue("invalid-token");
    verifyToken.mockResolvedValue({
      success: false,
      error: "Invalid token",
    });

    const { result } = renderHook(() => useAppBootstrap());

    await act(async () => {
      await result.current.bootstrap();
    });

    expect(result.current.verifyStatus).toBe("failed");
    expect(result.current.error).toBe("Token verification failed");
    expect(result.current.isReady).toBe(false);
    expect(mockEmbedded.ready).not.toHaveBeenCalled();
  });

  it("handles SDK init error", async () => {
    mockEmbedded.init.mockRejectedValue(new Error("Connection failed"));

    const { result } = renderHook(() => useAppBootstrap());

    await act(async () => {
      await result.current.bootstrap();
    });

    expect(result.current.error).toBe("Connection failed");
    expect(result.current.isReady).toBe(false);
  });

  it("prevents double initialization", async () => {
    const { result } = renderHook(() => useAppBootstrap());

    await act(async () => {
      // Call bootstrap twice simultaneously
      result.current.bootstrap();
      result.current.bootstrap();
    });

    // Should only init once
    expect(mockEmbedded.init).toHaveBeenCalledTimes(1);
  });

  it("uses theme subscription hook", async () => {
    const onThemeChange = vi.fn();
    const { result } = renderHook(() => useAppBootstrap({ onThemeChange }));

    await act(async () => {
      await result.current.bootstrap();
    });

    // Theme subscription hook should be called with handler and isReady
    expect(useThemeSubscription).toHaveBeenCalled();
  });

  it("uses action click subscription hook", async () => {
    const onActionClick = vi.fn();
    const { result } = renderHook(() => useAppBootstrap({ onActionClick }));

    await act(async () => {
      await result.current.bootstrap();
    });

    // Action click subscription hook should be called
    expect(useActionClickSubscription).toHaveBeenCalled();
  });

  it("auto-initializes when autoInit is true", async () => {
    renderHook(() => useAppBootstrap({ autoInit: true }));

    await waitFor(() => {
      expect(mockEmbedded.init).toHaveBeenCalled();
    });
  });
});
