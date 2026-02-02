import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PayloadEditor from "../PayloadEditor.jsx";

describe("PayloadEditor", () => {
  it("renders Payload Editor title and Send button", () => {
    const onSend = vi.fn();
    render(<PayloadEditor onSend={onSend} />);
    expect(screen.getByText("Payload Editor")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("calls onSend with parsed JSON when Send is clicked", async () => {
    const onSend = vi.fn();
    render(<PayloadEditor onSend={onSend} initialPayload='{"event":"test"}' />);
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    expect(onSend).toHaveBeenCalledWith({ event: "test" });
  });

  it("updates payload when eventPayload prop changes", () => {
    const onSend = vi.fn();
    const { rerender } = render(<PayloadEditor onSend={onSend} />);
    rerender(
      <PayloadEditor
        onSend={onSend}
        eventPayload={{
          eventName: "embedded::ready",
          payload: {},
        }}
      />,
    );
    const textarea = screen.getByRole("textbox");
    expect(textarea.value).toContain("embedded::ready");
  });
});
