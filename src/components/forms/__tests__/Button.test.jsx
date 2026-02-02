import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "../Button.jsx";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: "Click me" }),
    ).toBeInTheDocument();
  });

  it("applies variant class", () => {
    render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-primary");
  });

  it("applies size class", () => {
    render(<Button size="small">Small</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-small");
  });

  it("applies event class when event is true", () => {
    render(<Button event>Event</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-event");
  });

  it("renders label and hint when event is true", () => {
    render(
      <Button event label="Label" hint="Hint">
        Extra
      </Button>,
    );
    expect(screen.getByText("Label")).toBeInTheDocument();
    expect(screen.getByText("Hint")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    render(<Button className="custom-class">Btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn", "custom-class");
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Btn</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
