/**
 * Callback for action button clicks.
 * @param value - The value identifier of the clicked action
 */
declare type ActionClickCallback = (value: string) => void;

/**
 * Addon information returned by getAddons.
 */
declare interface AddonInfo {
    /** Unique slug identifier */
    slug: string;
    /** Internal product ID */
    product_id: number;
    /** Internal price ID */
    product_price_id: number;
    /** Display name */
    name: string;
    /** Price amount */
    price: number;
}

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
 * Optional configuration for checkout creation.
 */
export declare interface CheckoutCreateConfig {
    /** Optional context to persist across 3DS redirects.
     * Stored on the host side and returned in onResult after redirect. */
    context?: unknown;
}

/**
 * @fileoverview Type definitions for the checkout module.
 */
/**
 * Checkout item with type information.
 */
export declare interface CheckoutItem {
    /** Item type */
    type: "addon";
    /** Item slug identifier */
    slug: string;
    /** Quantity (default: 1) */
    quantity?: number;
}

/**
 * Checkout module interface.
 */
export declare interface CheckoutModule {
    /**
     * Create/initiate a checkout flow.
     *
     * Accepts a single item or an array of items for multi-item checkout.
     *
     * @param input - Single checkout item or array of items
     * @param config - Optional configuration
     *
     * @example
     * ```typescript
     * // Single item
     * embedded.checkout.create(
     *   { type: "addon", slug: "premium-analytics", quantity: 1 },
     *   { context: { route: "/pricing", plan: "premium" } },
     * );
     *
     * // Multiple items
     * embedded.checkout.create([
     *   { type: "addon", slug: "premium-analytics", quantity: 2 },
     *   { type: "addon", slug: "extra-storage" },
     * ]);
     * ```
     */
    create(input: CheckoutItem | CheckoutItem[], config?: CheckoutCreateConfig): void;
    /**
     * Subscribe to checkout results.
     * Context from create() is returned here after 3DS redirect.
     *
     * @param callback - Function called when checkout completes
     * @returns Unsubscribe function
     *
     * @example
     * ```typescript
     * const unsubscribe = embedded.checkout.onResult((result) => {
     *   if (result.context?.route) {
     *     router.push(result.context.route);
     *   }
     *   if (result.success) {
     *     console.log("Order:", result.order_id);
     *   }
     * });
     * ```
     */
    onResult(callback: CheckoutResultCallback): () => void;
    /**
     * Get available addons for the current app.
     * Results are cached on the host side (30 min TTL).
     *
     * @returns Promise resolving to addon list
     *
     * @example
     * ```typescript
     * const result = await embedded.checkout.getAddons();
     * if (result.success) {
     *   console.log('Available addons:', result.addons);
     * } else {
     *   console.error('Error:', result.error);
     * }
     * ```
     */
    getAddons(): Promise<GetAddonsResult>;
    /**
     * Clean up module resources (message listeners, subscriptions).
     * Called automatically by EmbeddedApp.destroy().
     */
    destroy(): void;
}

/**
 * Checkout result returned after payment.
 */
export declare interface CheckoutResult {
    /** Whether the checkout was successful */
    success: boolean;
    /** Order ID if successful */
    order_id?: string;
    /** Payment status */
    status: "paid" | "pending" | "failed" | "cancelled" | "success";
    /** Error details if failed */
    error?: {
        code: string;
        message: string;
    };
    /** Developer context passed to create(), restored after 3DS redirect */
    context?: unknown;
}

/**
 * Callback for checkout result.
 */
export declare type CheckoutResultCallback = (result: CheckoutResult) => void;

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
    private initialized;
    private initializing;
    private debugMode;
    private appReady;
    private layout;
    private themeSubscription;
    private initSubscription;
    private postInitHooks;
    /** Auth module for token management */
    auth: AuthModule;
    /** Page module for navigation and resize */
    page: PageModule;
    /** Nav module for primary actions */
    nav: NavModule;
    /** UI module for loading, overlay, toast, modal */
    ui: UIModule;
    /** Checkout module for checkout flow */
    checkout: CheckoutModule;
    constructor();
    /**
     * Register a hook to run after successful init handshake.
     * Used by modules to process context data.
     */
    private registerPostInitHook;
    /**
     * Set up core event listeners.
     */
    private setupListeners;
    /**
     * Get current SDK state.
     */
    getState(): Readonly<EmbeddedState>;
    /**
     * Check if SDK is initialized and ready.
     */
    isReady(): boolean;
    /**
     * Subscribe to theme changes.
     */
    onThemeChange(callback: (theme: "light" | "dark") => void): () => void;
    /**
     * Subscribe to init completion. Fires immediately if already initialized.
     */
    onInit(callback: InitCallback): () => void;
    /**
     * Signal that the app is fully loaded and ready.
     */
    ready(): void;
    /**
     * Initialize the SDK and establish connection with the host.
     */
    init(options?: InitOptions): Promise<{
        layout: LayoutInfo;
    }>;
    /**
     * Destroy the SDK instance and clean up resources.
     */
    destroy(): void;
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
    value: string;
    subTitle?: string;
    icon?: string;
    disabled?: boolean;
}

/**
 * Result of getAddons call.
 */
declare interface GetAddonsResult {
    /** Whether the fetch was successful */
    success: boolean;
    /** List of available addons (if success) */
    addons?: AddonInfo[];
    /** Error details (if failed) */
    error?: {
        code: string;
        message: string;
    };
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
    /** Merchant ID (Store ID) */
    merchant_id: number;
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
     * // Simple action button
     * embedded.nav.setAction({
     *   title: 'Create Product',
     *   value: 'create-product',
     *   icon: 'sicon-plus',
     * });
     *
     * // With extended actions dropdown
     * embedded.nav.setAction({
     *   title: 'Actions',
     *   value: 'main-action',
     *   extendedActions: [
     *     { title: 'Import', value: 'import' },
     *     { title: 'Export', value: 'export' },
     *   ]
     * });
     *
     * // Handle clicks via onActionClick
     * embedded.nav.onActionClick((value) => {
     *   if (value === 'create-product') {
     *     openCreateForm();
     *   } else if (value === 'import') {
     *     embedded.page.navigate('/import');
     *   }
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
     * @param callback - Function called when action is clicked, receives the action value
     * @returns Unsubscribe function
     *
     * @example
     * ```typescript
     * const unsubscribe = embedded.nav.onActionClick((value) => {
     *   switch (value) {
     *     case 'save':
     *       handleSave();
     *       break;
     *     case 'export':
     *       handleExport();
     *       break;
     *     case 'settings':
     *       embedded.page.navigate('/settings');
     *       break;
     *   }
     * });
     * ```
     */
    onActionClick(callback: ActionClickCallback): Unsubscribe;
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
    /** Value identifier for the action (passed to onActionClick callback) */
    value: string;
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
 * Reset the singleton (for testing).
 */
export declare function resetEmbeddedApp(): void;

/**
 * Theme type for the SDK.
 */
declare type Theme = "light" | "dark";

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

export { }
