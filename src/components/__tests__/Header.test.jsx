import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "../Header.jsx";
import { ThemeProvider } from "../../contexts/ThemeContext.jsx";

describe("Header", () => {
  it("renders title and version", () => {
    render(
      <ThemeProvider>
        <Header />
      </ThemeProvider>,
    );
    expect(screen.getByText("Embedded SDK Playground")).toBeInTheDocument();
    expect(screen.getByText(/v0\.2\.3/)).toBeInTheDocument();
  });

  it("renders theme toggle button", () => {
    render(
      <ThemeProvider>
        <Header />
      </ThemeProvider>,
    );
    expect(
      screen.getByRole("button", { name: "Toggle Theme" }),
    ).toBeInTheDocument();
  });

  it("toggles theme when theme button is clicked", async () => {
    render(
      <ThemeProvider>
        <Header />
      </ThemeProvider>,
    );
    const toggle = screen.getByRole("button", { name: "Toggle Theme" });
    await userEvent.click(toggle);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
