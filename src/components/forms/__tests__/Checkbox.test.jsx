import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Checkbox from "../Checkbox.jsx";

describe("Checkbox", () => {
  it("renders with label", () => {
    render(
      <Checkbox label="Filter unknown" checked={false} onChange={() => {}} />,
    );
    expect(screen.getByLabelText("Filter unknown")).toBeInTheDocument();
  });

  it("reflects checked state", () => {
    render(<Checkbox label="Opt" checked={true} onChange={() => {}} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("calls onChange with new value when toggled", async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Opt" checked={false} onChange={onChange} />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("uses id when provided", () => {
    render(
      <Checkbox id="my-id" label="Opt" checked={false} onChange={() => {}} />,
    );
    expect(screen.getByRole("checkbox")).toHaveAttribute("id", "my-id");
  });
});
