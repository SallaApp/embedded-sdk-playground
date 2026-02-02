import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToast } from "../useToast.js";

describe("useToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns empty toasts initially", () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it("showToast adds a toast and returns id", () => {
    const { result } = renderHook(() => useToast());
    let id;
    act(() => {
      id = result.current.showToast("Hello", "info");
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("Hello");
    expect(result.current.toasts[0].type).toBe("info");
    expect(typeof id).toBe("number");
  });

  it("removeToast removes the toast", () => {
    const { result } = renderHook(() => useToast());
    let id;
    act(() => {
      id = result.current.showToast("Hello");
    });
    act(() => {
      result.current.removeToast(id);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it("auto-removes toast after 3 seconds", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.showToast("Hello");
    });
    expect(result.current.toasts).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.toasts).toHaveLength(0);
  });
});
