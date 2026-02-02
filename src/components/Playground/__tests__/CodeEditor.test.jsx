import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CodeEditor from "../CodeEditor.jsx";
import { ThemeProvider } from "../../../contexts/ThemeContext.jsx";

vi.mock("@monaco-editor/react", () => ({
  default: function MockEditor({ value, onChange, height, theme }) {
    return (
      <div data-testid="monaco-editor" data-theme={theme} data-height={height}>
        <textarea
          aria-label="code"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  },
}));

describe("CodeEditor", () => {
  it("renders editor with value", () => {
    render(
      <ThemeProvider>
        <CodeEditor value="const x = 1;" onChange={() => {}} />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
    expect(screen.getByDisplayValue("const x = 1;")).toBeInTheDocument();
  });

  it("calls onChange when content changes", async () => {
    const onChange = vi.fn();
    render(
      <ThemeProvider>
        <CodeEditor value="" onChange={onChange} />
      </ThemeProvider>,
    );
    await userEvent.type(screen.getByRole("textbox", { name: "code" }), "x");
    expect(onChange).toHaveBeenCalled();
  });
});
