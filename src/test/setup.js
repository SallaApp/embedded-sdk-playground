import "@testing-library/jest-dom";

// Minimal global mocks so component/hook tests don't depend on real SDK or DOM APIs
if (typeof window !== "undefined") {
  if (!window.salla) {
    window.salla = {};
  }
  window.salla.embedded = window.salla.embedded || {
    init: vi.fn().mockResolvedValue({ layout: {} }),
  };

  if (typeof window.matchMedia === "undefined") {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }

  if (typeof window.ResizeObserver === "undefined") {
    window.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  }
}
