import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { INVALID_CHECKOUT_INPUT } from "@salla.sa/embedded-sdk";
import CheckoutTab from "../CheckoutTab.jsx";

describe("CheckoutTab", () => {
  let embedded;
  let emitResult;
  let logMessage;
  let showToast;

  beforeEach(() => {
    emitResult = null;
    embedded = {
      checkout: {
        create: vi.fn(),
        onResult: vi.fn((cb) => {
          emitResult = cb;
          return () => {};
        }),
      },
    };
    logMessage = vi.fn();
    showToast = vi.fn();
  });

  const renderTab = () =>
    render(
      <CheckoutTab
        embedded={embedded}
        logMessage={logMessage}
        showToast={showToast}
      />,
    );

  const start = async (checkoutId, context) => {
    if (checkoutId) {
      await userEvent.type(
        screen.getByPlaceholderText(/checkout_id/),
        checkoutId,
      );
    }
    if (context) {
      // userEvent.type treats { as a key descriptor
      await userEvent.click(screen.getByPlaceholderText(/route/));
      await userEvent.paste(context);
    }
    await userEvent.click(
      screen.getByRole("button", { name: "Start checkout" }),
    );
  };

  it("creates a checkout by ID with context and logs the outgoing event", async () => {
    renderTab();
    await start("chk_123", '{"route":"/billing"}');

    expect(embedded.checkout.create).toHaveBeenCalledWith(
      { checkout_id: "chk_123" },
      { context: { route: "/billing" } },
    );
    expect(logMessage).toHaveBeenCalledWith("outgoing", {
      event: "embedded::checkout.create",
      checkout_id: "chk_123",
      context: { route: "/billing" },
    });
    expect(screen.getByRole("button", { name: "Processing..." })).toBeVisible();
  });

  it("shows a thrown INVALID_CHECKOUT_INPUT error", async () => {
    embedded.checkout.create.mockImplementation(() => {
      const err = new Error("checkout_id must match A-Za-z0-9_-");
      err.code = INVALID_CHECKOUT_INPUT;
      throw err;
    });
    renderTab();
    await start("bad id!");

    expect(
      screen.getByText(
        "Error: INVALID_CHECKOUT_INPUT: checkout_id must match A-Za-z0-9_-",
      ),
    ).toBeInTheDocument();
    expect(showToast).toHaveBeenCalledWith(
      "Checkout error: checkout_id must match A-Za-z0-9_-",
      "error",
    );
    expect(
      screen.getByRole("button", { name: "Start checkout" }),
    ).toBeVisible();
  });

  it("does not call create when the context JSON is invalid", async () => {
    renderTab();
    await start("chk_123", "{not json");

    expect(embedded.checkout.create).not.toHaveBeenCalled();
    expect(screen.getByText(/Invalid context JSON/)).toBeInTheDocument();
  });

  it("renders the result when onResult fires", async () => {
    renderTab();
    await start("chk_123");

    act(() => {
      emitResult({
        success: true,
        status: "paid",
        order_id: "ord_789",
        checkout_id: "chk_123",
      });
    });

    expect(screen.getByText("paid")).toBeInTheDocument();
    expect(screen.getByText("ord_789")).toBeInTheDocument();
    expect(screen.getByText("chk_123")).toBeInTheDocument();
    expect(screen.getByText("paid").closest(".addon-card-result")).toHaveClass(
      "addon-card-result--success",
    );
  });

  it("renders CHECKOUT_NOT_FOUND with its message", async () => {
    renderTab();
    await start("chk_missing");

    act(() => {
      emitResult({
        success: false,
        status: "failed",
        checkout_id: "chk_missing",
        error: { code: "CHECKOUT_NOT_FOUND", message: "Checkout not found" },
      });
    });

    expect(screen.getByText("CHECKOUT_NOT_FOUND")).toBeInTheDocument();
    expect(screen.getByText("Checkout not found")).toBeInTheDocument();
    expect(
      screen.getByText("CHECKOUT_NOT_FOUND").closest(".addon-card-result"),
    ).toHaveClass("addon-card-result--error");
  });

  it("ignores addon checkout results when no checkout by ID is pending", () => {
    renderTab();

    act(() => {
      emitResult({ success: true, status: "paid", order_id: "ord_addon" });
    });

    expect(screen.queryByText("ord_addon")).not.toBeInTheDocument();
  });
});
