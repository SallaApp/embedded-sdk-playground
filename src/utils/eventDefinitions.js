/* global document */
/**
 * Embedded SDK Test Console - Event Definitions
 *
 * Updated to match the new EmbeddedPage component event contract.
 * All events use the `embedded::` namespace prefix.
 */

const EmbeddedEvents = {
  // ============================================
  // Iframe Lifecycle Events
  // ============================================

  /**
   * Signal iframe is ready and request layout context
   */
  "embedded::iframe.ready": {
    category: "iframe",
    description: "Init handshake - request layout context from host",
    payload: {
      height:
        typeof document !== "undefined"
          ? document.body.scrollHeight || 600
          : 600,
    },
  },

  /**
   * Signal app is fully loaded (removes host loading overlay)
   */
  "embedded::ready": {
    category: "iframe",
    description: "Signal app is fully loaded and ready",
    payload: {},
  },

  // ============================================
  // Authentication Events
  // ============================================

  /**
   * Request token refresh
   */
  "embedded::auth.refresh": {
    category: "auth",
    description: "Request iframe re-render with new token",
    payload: {},
    warning: "This will reload the iframe!",
  },

  /**
   * Introspect token (async)
   * Returns a Promise with token information
   */
  "embedded::auth.introspect": {
    category: "auth",
    description: "Get token information (async - returns Promise)",
    payload: {},
    async: true,
  },

  // ============================================
  // Destroy Event
  // ============================================

  /**
   * Exit embedded view
   */
  "embedded::destroy": {
    category: "iframe",
    description: "Exit embedded view and navigate to apps page",
    payload: {},
    warning: "This will navigate away from the app!",
  },

  // ============================================
  // Page Navigation Events
  // ============================================

  /**
   * Navigate to internal path (SPA)
   */
  "embedded::page.navigate": {
    category: "page",
    description: "Navigate to internal dashboard path (SPA navigation)",
    payload: {
      path: "/products",
      state: {},
      replace: false,
    },
    configurable: ["path", "state", "replace"],
  },

  /**
   * Redirect to external URL
   */
  "embedded::page.redirect": {
    category: "page",
    description: "Redirect to external URL (full page redirect)",
    payload: {
      url: "https://salla.sa",
    },
    configurable: ["url"],
  },

  /**
   * Set page title
   */
  "embedded::page.setTitle": {
    category: "page",
    description: "Set document title in host",
    payload: {
      title: "My App - Product Details",
    },
    configurable: ["title"],
  },

  // ============================================
  // Navigation Bar Events
  // ============================================

  /**
   * Set primary navigation action button
   */
  "embedded::nav.setAction": {
    category: "nav",
    description: "Set primary action button in navigation bar",
    payload: {
      title: "Add Product",
      value: "create",
      subTitle: "Create a new product",
      icon: "sicon-add",
      disabled: false,
      extendedActions: [
        { title: "Import Products", value: "import" },
        { title: "Bulk Edit", value: "bulk-edit" },
      ],
    },
    configurable: [
      "title",
      "value",
      "subTitle",
      "icon",
      "disabled",
      "extendedActions",
    ],
  },

  /**
   * Clear primary navigation action
   */
  "embedded::nav.clearAction": {
    category: "nav",
    description: "Clear primary action button",
    payload: {},
  },

  /**
   * Add one host navbar item (opaque id returned via addItem.response)
   */
  "embedded::nav.addItem": {
    category: "nav",
    description:
      "Add a dynamic item (Added Item {n}) to merchant dashboard navbar",
    async: true,
    payload: {
      item: {
        title: "Added Item 1",
        value: "added-item-1",
        url: "/apps/installed",
        disabled: false,
        active: false,
      },
    },
    configurable: ["item"],
  },

  /**
   * Update injected item (requires id from addNavItem response)
   */
  "embedded::nav.updateItem": {
    category: "nav",
    description: "Rename most recently added item to Updated Item {n}",
    payload: {
      item: {
        id: "REPLACE_WITH_ID_FROM_RESPONSE",
        title: "Updated Item 1",
      },
    },
    configurable: ["item"],
  },

  /**
   * Remove injected items by opaque id (host ignores unknown ids)
   */
  "embedded::nav.removeItem": {
    category: "nav",
    description: "Remove most recently added dynamic item (LIFO)",
    payload: {
      id: "",
    },
    configurable: ["id"],
    warning:
      "Runtime behavior always removes the most recently added item tracked by the app.",
  },

  // ============================================
  // UI Events
  // ============================================

  /**
   * Set loading state
   */
  "embedded::ui.loading": {
    category: "ui",
    description: "Set loading state in host",
    payload: {
      action: "show",
    },
    configurable: ["action"],
  },

  /**
   * Set breadcrumbs visibility in host shell
   */
  "embedded::ui.breadcrumbs": {
    category: "ui",
    description: "Show or hide host breadcrumbs container",
    payload: {
      action: "show",
    },
    configurable: ["action"],
  },

  /**
   * Show toast notification
   */
  "embedded::ui.toast": {
    category: "ui",
    description: "Show toast notification",
    payload: {
      type: "success",
      message: "Operation completed successfully!",
      duration: 3000,
    },
    configurable: ["type", "message", "duration"],
  },

  /**
   * Confirm dialog (async)
   * Returns a Promise with the user's choice
   */
  "embedded::ui.confirm": {
    category: "ui",
    description: "Show confirm dialog (async - returns result)",
    payload: {
      title: "Delete Product?",
      message:
        "This action cannot be undone. Are you sure you want to proceed?",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    },
    configurable: ["title", "message", "confirmText", "cancelText", "variant"],
    async: true,
  },

  // ============================================
  // Checkout Events
  // ============================================

  /**
   * Get available addons for the app
   * Note: Use the Addons tab to test checkout flow with real addons
   */
  "embedded::checkout.getAddons": {
    category: "checkout",
    description: "Fetch available addons for the app (cached on host)",
    payload: {},
    async: true,
  },
};

/**
 * Events that the parent window (host) may send to the iframe
 */
const IncomingEvents = {
  "embedded::context.provide": {
    description: "Layout context data sent after iframe.ready",
    expectedFields: [
      "layout.theme",
      "layout.width",
      "layout.locale",
      "layout.currency",
    ],
  },

  "embedded::theme.change": {
    description: "Theme change notification from host",
    expectedFields: ["theme"],
  },

  "embedded::nav.actionClick": {
    description: "Primary action button was clicked by user",
    expectedFields: ["value"],
  },

  "embedded::nav.itemClick": {
    description: "Clicked an injected dashboard navbar item",
    expectedFields: ["id", "value", "url"],
  },

  "embedded::nav.addItem.response": {
    description: "Ack for nav.addNavItem with generated opaque id",
    expectedFields: ["item"],
  },

  "embedded::ui.confirm.response": {
    description: "Response to confirm dialog request",
    expectedFields: ["requestId", "confirmed"],
  },

  "embedded::checkout.response": {
    description: "Checkout result from host",
    expectedFields: [
      "success",
      "status",
      "order_id",
      "error",
      "context",
      "message",
    ],
  },

  "embedded::checkout.getAddons.response": {
    description: "Available addons list from host",
    expectedFields: ["success", "addons", "error"],
  },
};

// Export for ESM consumers
export { EmbeddedEvents, IncomingEvents };
