import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App.jsx";

const mockEmbedded = {
  init: vi.fn().mockResolvedValue({ layout: {} }),
  ready: vi.fn(),
  auth: { getToken: vi.fn().mockReturnValue(null) },
  page: { resize: vi.fn() },
  destroy: vi.fn(),
  ui: { toast: { error: vi.fn() }, loading: { show: vi.fn(), hide: vi.fn() } },
};

vi.mock("../hooks/useEmbeddedSDK.js", () => ({
  useEmbeddedSDK: () => ({
    embedded: mockEmbedded,
    layoutData: null,
    setLayoutData: vi.fn(),
    init: vi.fn().mockResolvedValue({ layout: {} }),
    isInitialized: false,
  }),
}));

vi.mock("../hooks/useBootstrap.js", () => ({
  useBootstrap: () => ({
    token: null,
    verifiedData: null,
    verifyStatus: "—",
    bootstrap: vi.fn().mockResolvedValue(undefined),
  }),
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
});
