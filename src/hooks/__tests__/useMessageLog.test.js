import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMessageLog } from "../useMessageLog.js";

describe("useMessageLog", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  it("returns empty messageLog and filterUnknown true initially", () => {
    const { result } = renderHook(() => useMessageLog());
    expect(result.current.messageLog).toEqual([]);
    expect(result.current.filterUnknown).toBe(true);
  });

  it("logMessage appends entry to messageLog", () => {
    const { result } = renderHook(() => useMessageLog());
    act(() => {
      result.current.logMessage("incoming", { event: "test" });
    });
    expect(result.current.messageLog).toHaveLength(1);
    expect(result.current.messageLog[0].direction).toBe("incoming");
    expect(result.current.messageLog[0].event).toBe("test");
  });

  it("clearLog empties messageLog", () => {
    const { result } = renderHook(() => useMessageLog());
    act(() => {
      result.current.logMessage("incoming", { event: "a" });
    });
    act(() => {
      result.current.clearLog();
    });
    expect(result.current.messageLog).toEqual([]);
  });

  it("setFilterUnknown updates filterUnknown", () => {
    const { result } = renderHook(() => useMessageLog());
    act(() => {
      result.current.setFilterUnknown(false);
    });
    expect(result.current.filterUnknown).toBe(false);
  });

  it("copyLog writes formatted log to clipboard", async () => {
    const { result } = renderHook(() => useMessageLog());
    act(() => {
      result.current.logMessage("outgoing", { event: "e1" });
    });
    let copied = false;
    await act(async () => {
      copied = await result.current.copyLog();
    });
    expect(copied).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("e1"),
    );
  });
});
