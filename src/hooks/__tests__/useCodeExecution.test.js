import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCodeExecution } from "../useCodeExecution.js";

describe("useCodeExecution", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns empty output and isExecuting false initially", () => {
    const { result } = renderHook(() => useCodeExecution());
    expect(result.current.output).toEqual([]);
    expect(result.current.isExecuting).toBe(false);
  });

  it("executeCode with sync code captures result and logs", () => {
    const { result } = renderHook(() => useCodeExecution());
    let ret;
    act(() => {
      ret = result.current.executeCode("console.log('hi'); return 42;");
    });
    expect(ret.result).toBe(42);
    expect(ret.error).toBe(null);
    expect(
      result.current.output.some((o) => o.args && o.args.includes("hi")),
    ).toBe(true);
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(result.current.isExecuting).toBe(false);
  });

  it("executeCode with error returns error", () => {
    const { result } = renderHook(() => useCodeExecution());
    let ret;
    act(() => {
      ret = result.current.executeCode("throw new Error('oops');");
    });
    expect(ret.error).toBe("oops");
    expect(ret.result).toBe(null);
  });

  it("clearOutput empties output", () => {
    const { result } = renderHook(() => useCodeExecution());
    act(() => {
      result.current.executeCode("return 1;");
    });
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(result.current.output.length).toBeGreaterThan(0);
    act(() => {
      result.current.clearOutput();
    });
    expect(result.current.output).toEqual([]);
  });
});
