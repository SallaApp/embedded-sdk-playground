import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTheme } from "../useTheme.js";

describe("useTheme", () => {
  const originalLocation = window.location;
  const originalLocalStorage = window.localStorage;

  beforeEach(() => {
    Object.defineProperty(window, "location", {
      value: new URL("http://localhost/"),
      writable: true,
    });
    const store = {};
    window.localStorage = {
      getItem: (key) => store[key] ?? null,
      setItem: (key, value) => {
        store[key] = value;
      },
    };
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
    window.localStorage = originalLocalStorage;
  });

  it("returns isDarkMode from localStorage when theme is dark", () => {
    window.localStorage.setItem("theme", "dark");
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDarkMode).toBe(true);
  });

  it("returns isDarkMode false when localStorage theme is light", () => {
    window.localStorage.setItem("theme", "light");
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDarkMode).toBe(false);
  });

  it("toggleTheme flips isDarkMode", () => {
    window.localStorage.setItem("theme", "light");
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDarkMode).toBe(false);
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.isDarkMode).toBe(true);
  });

  it("setTheme updates isDarkMode", () => {
    window.localStorage.setItem("theme", "light");
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setTheme("dark");
    });
    expect(result.current.isDarkMode).toBe(true);
    act(() => {
      result.current.setTheme("light");
    });
    expect(result.current.isDarkMode).toBe(false);
  });
});
