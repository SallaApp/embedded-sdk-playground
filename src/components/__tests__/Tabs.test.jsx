import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Tabs from "../Tabs.jsx";

describe("Tabs", () => {
  const tabs = [
    { id: "tab1", label: "Tab 1" },
    { id: "tab2", label: "Tab 2" },
  ];

  it("renders all tab labels", () => {
    render(<Tabs activeTab="tab1" onTabChange={() => {}} tabs={tabs} />);
    expect(screen.getByRole("button", { name: "Tab 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tab 2" })).toBeInTheDocument();
  });

  it("applies active class to active tab", () => {
    render(<Tabs activeTab="tab2" onTabChange={() => {}} tabs={tabs} />);
    const tab2 = screen.getByRole("button", { name: "Tab 2" });
    expect(tab2).toHaveClass("active");
  });

  it("calls onTabChange with tab id when tab is clicked", async () => {
    const onTabChange = vi.fn();
    render(<Tabs activeTab="tab1" onTabChange={onTabChange} tabs={tabs} />);
    await userEvent.click(screen.getByRole("button", { name: "Tab 2" }));
    expect(onTabChange).toHaveBeenCalledWith("tab2");
  });
});
