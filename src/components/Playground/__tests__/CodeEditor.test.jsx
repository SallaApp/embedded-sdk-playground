import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CodeEditor from "../CodeEditor.jsx";
import { ThemeProvider } from "../../../contexts/ThemeContext.jsx";

const mockAddExtraLib = vi.fn();

vi.mock("@monaco-editor/react", () => ({
  default: function MockEditor({ value, onChange, height, theme, onMount }) {
    const fakeEditor = {};
    const fakeMonaco = {
      languages: {
        typescript: {
          typescriptDefaults: {
            addExtraLib: mockAddExtraLib,
          },
        },
      },
    };
    if (onMount) {
      Promise.resolve(onMount(fakeEditor, fakeMonaco)).catch(() => {});
    }
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

  it("onMount loads SDK types and calls addExtraLib when fetch succeeds", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("declare module 'salla' {}"),
    });
    vi.stubGlobal("fetch", mockFetch);
    render(
      <ThemeProvider>
        <CodeEditor value="" onChange={() => {}} />
      </ThemeProvider>,
    );
    await waitFor(() => {
      expect(mockAddExtraLib).toHaveBeenCalledWith(
        expect.stringContaining("declare global"),
        "file:///node_modules/@types/salla-embedded-sdk/index.d.ts",
      );
    });
    vi.unstubAllGlobals();
  });
});
