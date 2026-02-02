import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { embedded as mockEmbedded } from "@salla.sa/embedded-sdk";
import { useEmbeddedSDK } from "../useEmbeddedSDK.js";

vi.mock("@salla.sa/embedded-sdk", () => ({
  embedded: {
    init: vi.fn().mockResolvedValue({ layout: { theme: "light" } }),
  },
}));

vi.mock("../../utils/logger.js", () => ({
  default: { error: vi.fn() },
}));

describe("useEmbeddedSDK", () => {
  beforeEach(() => {
    vi.mocked(mockEmbedded.init).mockResolvedValue({
      layout: { theme: "light" },
    });
    if (window.salla) {
      delete window.salla.embedded;
    }
  });

  it("returns embedded, isInitialized false, layoutData null initially", () => {
    const { result } = renderHook(() => useEmbeddedSDK());
    expect(result.current.isInitialized).toBe(false);
    expect(result.current.layoutData).toBe(null);
    expect(result.current.embedded).toBeDefined();
  });

  it("init calls embedded.init and sets layoutData and isInitialized", async () => {
    const layout = { theme: "dark" };
    vi.mocked(mockEmbedded.init).mockResolvedValue({ layout });
    const { result } = renderHook(() => useEmbeddedSDK());
    await act(async () => {
      await result.current.init({ debug: true });
    });
    expect(vi.mocked(mockEmbedded.init)).toHaveBeenCalledWith({ debug: true });
    expect(result.current.layoutData).toEqual(layout);
    expect(result.current.isInitialized).toBe(true);
  });

  it("exposes window.salla.embedded after mount", () => {
    renderHook(() => useEmbeddedSDK());
    expect(window.salla).toBeDefined();
    expect(window.salla.embedded).toBeDefined();
  });

  it("setLayoutData updates layoutData", () => {
    const { result } = renderHook(() => useEmbeddedSDK());
    act(() => {
      result.current.setLayoutData({ theme: "dark" });
    });
    expect(result.current.layoutData).toEqual({ theme: "dark" });
  });
});
