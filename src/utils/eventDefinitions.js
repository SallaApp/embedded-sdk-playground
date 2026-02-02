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

  /**
   * Request iframe resize
   */
  "embedded::iframe.resize": {
    category: "iframe",
    description: "Request iframe height change",
    payload: {
      height: 800,
    },
    configurable: ["height"],
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

  // ============================================
  // UI Events
  // ============================================

  /**
   * Show loading indicator
   */
  "embedded::ui.loading-show": {
    category: "ui",
    description: "Show loading indicator (content not ready)",
    payload: {
      action: "show",
    },
  },

  /**
   * Hide loading indicator
   */
  "embedded::ui.loading-hide": {
    category: "ui",
    description: "Hide loading indicator (content ready)",
    payload: {
      action: "hide",
    },
  },

  /**
   * Show success toast
   */
  "embedded::ui.toast-success": {
    category: "ui",
    description: "Show success toast notification",
    payload: {
      type: "success",
      message: "Operation completed successfully!",
      duration: 3000,
    },
    configurable: ["message", "duration"],
  },

  /**
   * Show error toast
   */
  "embedded::ui.toast-error": {
    category: "ui",
    description: "Show error toast notification",
    payload: {
      type: "error",
      message: "Something went wrong!",
      duration: 5000,
    },
    configurable: ["message", "duration"],
  },

  /**
   * Show warning toast
   */
  "embedded::ui.toast-warning": {
    category: "ui",
    description: "Show warning toast notification",
    payload: {
      type: "warning",
      message: "Please review your input",
      duration: 4000,
    },
    configurable: ["message", "duration"],
  },

  /**
   * Show info toast
   */
  "embedded::ui.toast-info": {
    category: "ui",
    description: "Show info toast notification",
    payload: {
      type: "info",
      message: "New features available",
      duration: 3000,
    },
    configurable: ["message", "duration"],
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
   * Create checkout
   */
  "embedded::checkout.create": {
    category: "checkout",
    description: "Initiate checkout process",
    payload: {
      checkoutId: "CHK_" + Date.now(),
      amount: 299.99,
      currency: "SAR",
      items: [
        { id: "PROD_001", name: "Test Product", quantity: 1, price: 299.99 },
      ],
    },
    configurable: ["checkoutId", "amount", "currency", "items"],
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

  "embedded::ui.confirm.response": {
    description: "Response to confirm dialog request",
    expectedFields: ["requestId", "confirmed"],
  },
};

// Export for ESM consumers
export { EmbeddedEvents, IncomingEvents };
