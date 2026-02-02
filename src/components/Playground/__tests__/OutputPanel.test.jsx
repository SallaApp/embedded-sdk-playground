import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OutputPanel from "../OutputPanel.jsx";

describe("OutputPanel", () => {
  it("renders empty state when no output", () => {
    render(<OutputPanel output={[]} isExecuting={false} />);
    expect(screen.getByText("No output yet")).toBeInTheDocument();
  });

  it("renders output entries", () => {
    const output = [
      { type: "log", args: "hello" },
      { type: "result", args: "42" },
    ];
    render(<OutputPanel output={output} isExecuting={false} />);
    expect(screen.getByText("hello")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders executing state when isExecuting is true", () => {
    render(<OutputPanel output={[]} isExecuting={true} />);
    expect(screen.getByText("Running code...")).toBeInTheDocument();
  });

  it("toggles show type labels when checkbox is clicked", async () => {
    render(
      <OutputPanel
        output={[{ type: "log", args: "hi" }]}
        isExecuting={false}
      />,
    );
    await userEvent.click(
      screen.getByRole("checkbox", { name: /show type labels/i }),
    );
    expect(screen.getByText("hi")).toBeInTheDocument();
  });
});
