import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EventTriggers from "../EventTriggers.jsx";

const mockEmbedded = {
  ready: vi.fn(),
  page: { resize: vi.fn() },
  auth: { refresh: vi.fn(), getToken: vi.fn(), introspect: vi.fn() },
  destroy: vi.fn(),
  ui: { toast: { error: vi.fn() }, loading: { show: vi.fn(), hide: vi.fn() } },
};

describe("EventTriggers", () => {
  const defaultProps = {
    onEventClick: vi.fn(),
    embedded: mockEmbedded,
    logMessage: vi.fn(),
    showToast: vi.fn(),
    bootstrap: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));
  });

  it("renders without crashing", () => {
    render(<EventTriggers {...defaultProps} />);
    expect(screen.getByText("Event Triggers")).toBeInTheDocument();
  });

  it("calls bootstrap when Init + Verify (iframe.ready) is clicked", async () => {
    render(<EventTriggers {...defaultProps} />);
    await userEvent.click(
      screen.getByRole("button", { name: /Init \+ Verify/i }),
    );
    expect(defaultProps.bootstrap).toHaveBeenCalled();
  });
});
