import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBootstrap } from "../useBootstrap.js";

const mockShowToast = vi.fn();
const mockOnLayoutUpdate = vi.fn();
const mockOnVerifiedDataUpdate = vi.fn();

const mockEmbedded = {
  init: vi.fn().mockResolvedValue({ layout: { theme: "light" } }),
  auth: { getToken: vi.fn().mockReturnValue("token-123") },
  ready: vi.fn(),
  destroy: vi.fn(),
  ui: { toast: { error: vi.fn() } },
};

vi.mock("../../utils/tokenVerification.js", () => ({
  verifyToken: vi.fn().mockResolvedValue({ success: true, data: { id: 1 } }),
}));

vi.mock("../../utils/logger.js", () => ({
  default: { error: vi.fn() },
}));

describe("useBootstrap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEmbedded.init.mockResolvedValue({ layout: { theme: "light" } });
    mockEmbedded.auth.getToken.mockReturnValue("token-123");
  });

  it("returns token null, verifyStatus — initially", () => {
    const { result } = renderHook(() =>
      useBootstrap(
        mockEmbedded,
        mockOnLayoutUpdate,
        mockOnVerifiedDataUpdate,
        mockShowToast,
      ),
    );
    expect(result.current.token).toBe(null);
    expect(result.current.verifyStatus).toBe("—");
  });

  it("bootstrap initializes SDK, verifies token, and calls callbacks", async () => {
    const { result } = renderHook(() =>
      useBootstrap(
        mockEmbedded,
        mockOnLayoutUpdate,
        mockOnVerifiedDataUpdate,
        mockShowToast,
      ),
    );
    await act(async () => {
      await result.current.bootstrap();
    });
    expect(mockEmbedded.init).toHaveBeenCalledWith({ debug: true });
    expect(mockOnLayoutUpdate).toHaveBeenCalledWith({ theme: "light" });
    expect(result.current.token).toBe("token-123");
    expect(result.current.verifyStatus).toBe("✓ Verified");
    expect(mockOnVerifiedDataUpdate).toHaveBeenCalledWith({ id: 1 });
    expect(mockEmbedded.ready).toHaveBeenCalled();
  });

  it("when no token, skips verification and calls ready", async () => {
    mockEmbedded.auth.getToken.mockReturnValue(null);
    const { result } = renderHook(() =>
      useBootstrap(
        mockEmbedded,
        mockOnLayoutUpdate,
        mockOnVerifiedDataUpdate,
        mockShowToast,
      ),
    );
    await act(async () => {
      await result.current.bootstrap();
    });
    expect(mockEmbedded.ready).toHaveBeenCalled();
    expect(result.current.verifyStatus).toBe("—");
  });
});
