import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DataDisplay from "../DataDisplay.jsx";

describe("DataDisplay", () => {
  it("renders Layout Data panel", () => {
    render(
      <DataDisplay
        layoutData={null}
        token={null}
        verifiedData={null}
        verifyStatus="—"
      />,
    );
    expect(screen.getByText("Layout Data")).toBeInTheDocument();
  });

  it("displays layoutData theme and width", () => {
    render(
      <DataDisplay
        layoutData={{ theme: "dark", width: 400 }}
        token={null}
        verifiedData={null}
        verifyStatus="—"
      />,
    );
    expect(screen.getByText("dark")).toBeInTheDocument();
    expect(screen.getByText("400px")).toBeInTheDocument();
  });

  it("displays verifyStatus", () => {
    render(
      <DataDisplay
        layoutData={null}
        token={null}
        verifiedData={null}
        verifyStatus="✓ Verified"
      />,
    );
    expect(screen.getByText("✓ Verified")).toBeInTheDocument();
  });

  it("displays token (masked when long)", () => {
    render(
      <DataDisplay
        layoutData={null}
        token="short"
        verifiedData={null}
        verifyStatus="—"
      />,
    );
    expect(screen.getByText("short")).toBeInTheDocument();
  });
});
