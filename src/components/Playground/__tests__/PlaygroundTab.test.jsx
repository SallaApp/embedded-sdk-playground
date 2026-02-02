import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../../contexts/ThemeContext.jsx";
import PlaygroundTab from "../PlaygroundTab.jsx";

const mockEmbedded = {};
const mockLogMessage = vi.fn();
const mockShowToast = vi.fn();

function Wrapper({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe("PlaygroundTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Code Editor and Run button", () => {
    render(
      <Wrapper>
        <PlaygroundTab
          embedded={mockEmbedded}
          logMessage={mockLogMessage}
          showToast={mockShowToast}
        />
      </Wrapper>,
    );
    expect(screen.getByText("Code Editor")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /run/i })).toBeInTheDocument();
  });

  it("renders Output panel", () => {
    render(
      <Wrapper>
        <PlaygroundTab
          embedded={mockEmbedded}
          logMessage={mockLogMessage}
          showToast={mockShowToast}
        />
      </Wrapper>,
    );
    expect(screen.getByText("Output")).toBeInTheDocument();
  });
});
