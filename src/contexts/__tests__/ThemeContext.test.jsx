import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "../ThemeContext.jsx";

function TestConsumer() {
  const { isDarkMode, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="dark">{String(isDarkMode)}</span>
      <button type="button" onClick={toggleTheme}>
        Toggle
      </button>
      <button type="button" onClick={() => setTheme("dark")}>
        Set Dark
      </button>
      <button type="button" onClick={() => setTheme("light")}>
        Set Light
      </button>
    </div>
  );
}

describe("ThemeContext", () => {
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
      clear: () => {
        for (const key of Object.keys(store)) delete store[key];
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

  it("provides isDarkMode from localStorage when theme is dark", () => {
    window.localStorage.setItem("theme", "dark");
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("dark")).toHaveTextContent("true");
  });

  it("provides isDarkMode false when localStorage theme is light", () => {
    window.localStorage.setItem("theme", "light");
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("dark")).toHaveTextContent("false");
  });

  it("toggleTheme flips isDarkMode", async () => {
    window.localStorage.setItem("theme", "light");
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("dark")).toHaveTextContent("false");
    await userEvent.click(screen.getByRole("button", { name: "Toggle" }));
    expect(screen.getByTestId("dark")).toHaveTextContent("true");
  });

  it("setTheme updates isDarkMode", async () => {
    window.localStorage.setItem("theme", "light");
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Set Dark" }));
    expect(screen.getByTestId("dark")).toHaveTextContent("true");
    await userEvent.click(screen.getByRole("button", { name: "Set Light" }));
    expect(screen.getByTestId("dark")).toHaveTextContent("false");
  });

  it("useTheme throws when used outside ThemeProvider", () => {
    expect(() => render(<TestConsumer />)).toThrow(
      "useTheme must be used within ThemeProvider",
    );
  });
});
