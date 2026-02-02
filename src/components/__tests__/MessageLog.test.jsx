import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MessageLog from "../MessageLog.jsx";

describe("MessageLog", () => {
  const defaultProps = {
    messageLog: [],
    filterUnknown: true,
    onFilterChange: vi.fn(),
    onClear: vi.fn(),
    onCopy: vi.fn(),
  };

  it("renders empty state when log is empty", () => {
    render(<MessageLog {...defaultProps} />);
    expect(screen.getByText(/No messages/)).toBeInTheDocument();
  });

  it("renders log entries", () => {
    const log = [
      {
        time: new Date().toISOString(),
        direction: "incoming",
        event: "embedded::ready",
        data: {},
      },
    ];
    render(<MessageLog {...defaultProps} messageLog={log} />);
    expect(screen.getByText("ready")).toBeInTheDocument();
  });

  it("calls onClear when clear button is clicked", async () => {
    render(<MessageLog {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /clear/i }));
    expect(defaultProps.onClear).toHaveBeenCalled();
  });

  it("calls onCopy when copy button is clicked", async () => {
    render(<MessageLog {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /copy/i }));
    expect(defaultProps.onCopy).toHaveBeenCalled();
  });

  it("calls onFilterChange when filter checkbox is toggled", async () => {
    render(<MessageLog {...defaultProps} />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(defaultProps.onFilterChange).toHaveBeenCalled();
  });
});
