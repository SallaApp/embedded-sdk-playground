import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App.jsx";

const mockEmbedded = {
  init: vi.fn().mockResolvedValue({ layout: {} }),
  ready: vi.fn(),
  auth: { getToken: vi.fn().mockReturnValue(null) },
  page: { resize: vi.fn() },
  nav: { onActionClick: vi.fn().mockReturnValue(() => {}) },
  destroy: vi.fn(),
  onThemeChange: vi.fn().mockReturnValue(() => {}),
  onInit: vi.fn().mockReturnValue(() => {}),
  ui: { toast: { error: vi.fn() }, loading: { show: vi.fn(), hide: vi.fn() } },
  checkout: { getAddons: vi.fn(), onResult: vi.fn().mockReturnValue(() => {}) },
};

vi.mock("../hooks/useAppBootstrap.js", () => ({
  useAppBootstrap: () => ({
    embedded: mockEmbedded,
    isReady: false,
    isInitializing: false,
    layout: null,
    token: null,
    verifiedData: null,
    verifyStatus: "idle",
    error: null,
    bootstrap: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock("../hooks/useExposeEmbeddedGlobally.js", () => ({
  useExposeEmbeddedGlobally: () => {},
}));

describe("App", () => {
  it("renders header and tabs", () => {
    render(<App />);
    expect(screen.getByText("Embedded SDK Playground")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Test Console" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Playground" }),
    ).toBeInTheDocument();
  });

  it("shows Test Console content by default", () => {
    render(<App />);
    expect(screen.getByText("Payload Editor")).toBeInTheDocument();
  });

  it("switches to Playground when Playground tab is clicked", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "Playground" }));
    expect(screen.getByText("Code Editor")).toBeInTheDocument();
  });

  it("shows toast when Send is clicked with no parent window", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    expect(
      screen.getByText(
        /No parent window detected\. Open this page in an iframe/,
      ),
    ).toBeInTheDocument();
  });
});
