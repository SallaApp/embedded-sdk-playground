/**
 * Callback for action button clicks.
 */
declare type ActionClickCallback = (url?: string, value?: string) => void;

/**
 * Auth module interface.
 */
export declare interface AuthModule {
  /**
   * Get the token from the URL query parameter.
   * The token is passed to the iframe via ?token=XXX
   * @returns The token string or null if not present
   */
  getToken(): string | null;
  /**
   * Get the app ID from the URL query parameter.
   * The app ID is passed to the iframe via ?app_id=XXX
   * @returns The app ID string or null if not present
   */
  getAppId(): string | null;
  /**
   * Request a token refresh from the host.
   * This will re-render the iframe with a new token URL.
   */
  refresh(): void;
  /**
   * Introspect (verify) a short-lived token with Salla's API.
   * This method verifies the token and returns token information.
   *
   * @param options - Optional params (appId, token, refreshOnError); auto extracted from URL if not provided.
   * @returns Promise with introspect result.
   * @throws {Error} If required params missing.
   */
  introspect(options?: IntrospectOptions): Promise<IntrospectResponse>;
}

/**
 * Checkout module interface.
 */
export declare interface CheckoutModule {
  /**
   * Create/initiate a checkout flow.
   *
   * @param payload - Checkout data
   *
   * @example
   * ```typescript
   * embedded.checkout.create({
   *   items: [{ productId: 123, quantity: 1 }],
   *   amount: 99.99,
   *   currency: 'SAR'
   * });
   * ```
   */
  create(payload: CheckoutPayload): void;
}

/**
 * @fileoverview Type definitions for the checkout module.
 */
/**
 * Checkout payload structure.
 */
export declare interface CheckoutPayload {
  /** Cart items or product IDs */
  items?: unknown[];
  /** Total amount */
  amount?: number;
  /** Currency code */
  currency?: string;
  /** Additional checkout data */
  [key: string]: unknown;
}

/**
 * Confirm dialog options.
 */
export declare interface ConfirmOptions {
  /** Dialog title */
  title: string;
  /** Dialog message/body */
  message: string;
  /** Text for the confirm button (default: "Confirm") */
  confirmText?: string;
  /** Text for the cancel button (default: "Cancel") */
  cancelText?: string;
  /** Visual variant for the dialog (default: "info") */
  variant?: ConfirmVariant;
}

/**
 * Confirm dialog result.
 */
export declare interface ConfirmResult {
  /** Whether the user confirmed (true) or cancelled (false) */
  confirmed: boolean;
}

/**
 * Confirm dialog variant.
 */
export declare type ConfirmVariant = "danger" | "warning" | "info";

export declare const embedded: EmbeddedApp;

/**
 * Main Embedded SDK class.
 * Provides the primary interface for third-party apps to communicate with the Salla host.
 */
export declare class EmbeddedApp {
  private config;
  private state;
  private themeCallbacks;
  private initCallbacks;
  private appReady;
  /** Auth module for token management */
  auth: AuthModule;
  /** Page module for navigation and resize */
  page: PageModule;
  /** Nav module for primary actions */
  nav: NavModule;
  /** UI module for loading, overlay, toast, confirm */
  ui: UIModule;
  /** Checkout module for checkout flow */
  checkout: CheckoutModule;
  constructor();
  /**
   * Get current SDK state (layout info only, no token).
   */
  getState(): Readonly<EmbeddedState>;
  /**
   * Get current SDK configuration.
   */
  getConfig(): Readonly<EmbeddedConfig>;
  /**
   * Check if SDK is initialized.
   */
  isReady(): boolean;
  /**
   * Unified internal logging function that supports all console log types.
   *
   * @param type - Log type (log, warn, error, info, debug)
   * @param args - Arguments to log
   */
  private internalLog;
  /**
   * Set up listener for theme changes from host.
   */
  private setupThemeListener;
  /**
   * Set up listeners for async response events from host.
   */
  private setupResponseListeners;
  /**
   * Subscribe to theme changes.
   *
   * @param callback - Function called when theme changes
   * @returns Unsubscribe function
   *
   * @example
   * ```typescript
   * const unsubscribe = embedded.onThemeChange((theme) => {
   *   document.body.classList.toggle('dark-mode', theme === 'dark');
   * });
   * ```
   */
  onThemeChange(callback: ThemeChangeCallback): () => void;
  /**
   * Subscribe to init completion. If called after init, fires immediately.
   *
   * @param callback - Function called when init completes
   * @returns Unsubscribe function
   *
   * @example
   * ```typescript
   * embedded.onInit((state) => {
   *   console.log('SDK initialized with layout:', state.layout);
   * });
   * ```
   */
  onInit(callback: InitCallback): () => void;
  /**
   * Signal that the app is fully loaded and ready.
   * This removes the host's loading overlay.
   *
   * @example
   * ```typescript
   * // After verifying token and loading initial data
   * embedded.ready();
   * ```
   */
  ready(): void;
  /**
   * Initialize the SDK and establish connection with the host.
   *
   * @param options - Initialization options (optional)
   * @returns Promise that resolves with layout info
   *
   * @example
   * ```typescript
   * const { layout } = await embedded.init({ debug: true });
   * console.log('Theme:', layout.theme);
   * console.log('Locale:', layout.locale);
   * ```
   */
  init(options?: InitOptions): Promise<{
    layout: LayoutInfo;
  }>;
  /**
   * Wait for initialization to complete.
   * Useful when multiple calls to init() might happen.
   */
  private waitForInit;
  /**
   * Destroy the SDK instance and clean up resources.
   * Sends a destroy event to the host to navigate away from the embedded view.
   *
   * @example
   * ```typescript
   * // On auth failure or when app needs to exit
   * embedded.destroy();
   * ```
   */
  destroy(): void;
}

/**
 * Internal configuration after initialization.
 */
declare interface EmbeddedConfig {
  debug: boolean;
  initialized: boolean;
}

/**
 * Current state of the embedded SDK.
 */
export declare interface EmbeddedState {
  /** Whether the SDK is ready */
  ready: boolean;
  /** Whether initialization is in progress */
  initializing: boolean;
  /** Layout information from the host */
  layout: LayoutInfo;
}

/**
 * Extended action for navigation.
 */
export declare interface ExtendedAction {
  title: string;
  subTitle?: string;
  url?: string;
  value?: string;
  icon?: string;
  disabled?: boolean;
}

/**
 * Get the singleton EmbeddedApp instance.
 */
export declare function getEmbeddedApp(): EmbeddedApp;

/**
 * Init callback type for onInit subscribers.
 */
declare type InitCallback = (state: EmbeddedState) => void;

/**
 * Options for initializing the embedded SDK.
 */
export declare interface InitOptions {
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Options for the introspect method.
 */
declare interface IntrospectOptions {
  /** Application ID (audience). If not provided, will be extracted from URL params. */
  appId?: string;
  /** Short-lived token. If not provided, will be extracted from URL params. */
  token?: string;
  /** Automatically refresh token on error (default: true) */
  refreshOnError?: boolean;
}

/**
 * Response from the introspect API.
 */
declare interface IntrospectResponse {
  /** Whether the token was verified successfully */
  isVerified: boolean;
  /** Whether an error occurred */
  isError: boolean;
  /** Error content if an error occurred */
  error?: unknown;
  /** Response data (null on error) */
  data: IntrospectResponseData | null;
}

/**
 * Response data from the introspect API.
 */
declare interface IntrospectResponseData {
  /** Token ID */
  id: number;
  /** User ID */
  user_id: number;
  /** Expiration time in ISO 8601 format */
  exp: string;
}

/**
 * Layout information from the host.
 */
declare interface LayoutInfo {
  /** Current theme */
  theme: Theme;
  /** Parent window width */
  width: number;
  /** Current locale */
  locale: string;
  /** Current currency */
  currency: string;
}

/**
 * Loading mode.
 */
export declare type LoadingMode = "full" | "component";

/**
 * Loading sub-module interface.
 */
declare interface LoadingSubModule {
  /**
   * Show loading indicator.
   *
   * @example
   * ```typescript
   * embedded.ui.loading.show();
   * await fetchData();
   * embedded.ui.loading.hide();
   * ```
   */
  show(): void;
  /**
   * Hide loading indicator.
   */
  hide(): void;
}

/**
 * Nav module interface.
 */
export declare interface NavModule {
  /**
   * Set the primary action button in the navbar.
   *
   * @param config - Action button configuration
   *
   * @example
   * ```typescript
   * embedded.nav.setAction({
   *   title: 'Create Product',
   *   onClick: () => {
   *     // Handle click
   *   }
   * });
   *
   * // With optional props
   * embedded.nav.setAction({
   *   title: 'Save',
   *   subTitle: 'Save changes',
   *   icon: 'sicon-save',
   *   disabled: false,
   *   onClick: () => {
   *     handleSave();
   *   }
   * });
   *
   * // With extended actions dropdown
   * embedded.nav.setAction({
   *   title: 'Actions',
   *   value: 'main-action',
   *   extendedActions: [
   *     { title: 'Import', url: '/import' },
   *     { title: 'Export', value: 'export' }
   *   ]
   * });
   * ```
   */
  setAction(config: PrimaryActionConfig): void;
  /**
   * Clear the primary action button.
   *
   * @example
   * ```typescript
   * embedded.nav.clearAction();
   * ```
   */
  clearAction(): void;
  /**
   * Subscribe to action button click events.
   *
   * @param callback - Function called when action is clicked
   * @returns Unsubscribe function
   *
   * @example
   * ```typescript
   * const unsubscribe = embedded.nav.onActionClick((url, value) => {
   *   if (value === 'export') {
   *     handleExport();
   *   }
   * });
   * ```
   */
  onActionClick(callback: ActionClickCallback): Unsubscribe;
  /**
   * @deprecated Use setAction instead
   */
  primaryAction(config: PrimaryActionConfig): void;
  /**
   * @deprecated Use clearAction instead
   */
  clearPrimaryAction(): void;
}

/**
 * @fileoverview Type definitions for the page module.
 */
/**
 * Options for navigation.
 */
export declare interface NavToOptions {
  /** State to pass to the route */
  state?: Record<string, unknown>;
  /** Replace history entry instead of push */
  replace?: boolean;
}

/**
 * Page module interface.
 */
export declare interface PageModule {
  /**
   * Navigate to a path using React Router (SPA navigation).
   * Use this for internal dashboard paths.
   *
   * @param path - The path to navigate to
   * @param options - Navigation options
   *
   * @example
   * ```typescript
   * embedded.page.navigate('/products');
   * embedded.page.navigate('/orders', { replace: true });
   * ```
   */
  navigate(path: string, options?: NavToOptions): void;
  /**
   * Redirect to a URL (full page reload).
   * Use this for external URLs or when a full reload is needed.
   *
   * @param url - The URL to redirect to
   *
   * @example
   * ```typescript
   * embedded.page.redirect('https://external-site.com');
   * ```
   */
  redirect(url: string): void;
  /**
   * Navigate to a path - auto-detects internal vs external.
   * Internal paths use React Router, external URLs use redirect.
   *
   * @param path - The path or URL to navigate to
   * @param options - Navigation options (only for internal paths)
   *
   * @example
   * ```typescript
   * embedded.page.navTo('/products'); // SPA navigation
   * embedded.page.navTo('https://external.com'); // Full redirect
   * ```
   */
  navTo(path: string, options?: NavToOptions): void;
  /**
   * Update the iframe height.
   *
   * @param height - Height in pixels
   *
   * @example
   * ```typescript
   * embedded.page.resize(800);
   * ```
   */
  resize(height: number): void;
  /**
   * Auto-resize iframe to content height.
   * Measures document.documentElement.scrollHeight and sends resize.
   *
   * @example
   * ```typescript
   * // After content changes
   * embedded.page.autoResize();
   * ```
   */
  autoResize(): void;
  /**
   * Set the page title in the host document.
   *
   * @param title - The title to set
   *
   * @example
   * ```typescript
   * embedded.page.setTitle('Product Details');
   * ```
   */
  setTitle(title: string): void;
}

/**
 * Configuration for the primary action button.
 */
export declare interface PrimaryActionConfig {
  /** Button title */
  title: string;
  /** Callback function to execute when clicked (replaces url) */
  onClick?: () => void;
  /** Custom value for identifying the action (passed to onClick callback) */
  value?: string;
  /** Optional subtitle */
  subTitle?: string;
  /** Optional icon class name */
  icon?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Extended dropdown actions */
  extendedActions?: ExtendedAction[];
}

/**
 * Reset the singleton (mainly for testing).
 */
export declare function resetEmbeddedApp(): void;

/**
 * @fileoverview Core type definitions for the Embedded SDK.
 */
/**
 * Theme type for the SDK.
 */
declare type Theme = "light" | "dark";

/**
 * Theme change callback type.
 */
declare type ThemeChangeCallback = (theme: "light" | "dark") => void;

/**
 * Toast notification options.
 */
export declare interface ToastOptions {
  /** Toast type */
  type: ToastType_2;
  /** Message to display */
  message: string;
  /** Duration in milliseconds (optional) */
  duration?: number;
}

/**
 * Toast sub-module interface.
 */
declare interface ToastSubModule {
  /**
   * Show a toast notification.
   * @param options - Toast configuration
   *
   * @example
   * ```typescript
   * embedded.ui.toast.show({
   *   type: 'success',
   *   message: 'Product saved!',
   *   duration: 3000
   * });
   * ```
   */
  show(options: ToastOptions): void;
  /**
   * Show success toast.
   * @param message - Message to display
   * @param duration - Duration in ms
   */
  success(message: string, duration?: number): void;
  /**
   * Show error toast.
   * @param message - Message to display
   * @param duration - Duration in ms
   */
  error(message: string, duration?: number): void;
  /**
   * Show warning toast.
   * @param message - Message to display
   * @param duration - Duration in ms
   */
  warning(message: string, duration?: number): void;
  /**
   * Show info toast.
   * @param message - Message to display
   * @param duration - Duration in ms
   */
  info(message: string, duration?: number): void;
}

/**
 * Toast notification types.
 */
export declare type ToastType = "success" | "error" | "warning" | "info";

/**
 * Toast type.
 */
declare type ToastType_2 = "success" | "error" | "warning" | "info";

/**
 * UI module interface with nested sub-modules.
 */
export declare interface UIModule {
  /**
   * Loading state control.
   */
  loading: LoadingSubModule;
  /**
   * Toast notifications.
   */
  toast: ToastSubModule;
  /**
   * Show a confirmation dialog and wait for user response.
   *
   * @param options - Confirm dialog options
   * @returns Promise that resolves with the user's choice
   *
   * @example
   * ```typescript
   * const result = await embedded.ui.confirm({
   *   title: 'Delete Product?',
   *   message: 'This action cannot be undone.',
   *   confirmText: 'Delete',
   *   variant: 'danger',
   * });
   * if (result.confirmed) {
   *   // User confirmed
   * }
   * ```
   */
  confirm(options: ConfirmOptions): Promise<ConfirmResult>;
}

/**
 * Unsubscribe function returned by message listeners.
 */
declare type Unsubscribe = () => void;

/**
 * @fileoverview Validation types for SDK payload validation.
 */
/**
 * Result of a validation check.
 */
export declare interface ValidationResult {
  /** Whether the validation passed */
  valid: boolean;
  /** Array of error messages if validation failed */
  errors: string[];
}

export declare const version: string;

export {};
