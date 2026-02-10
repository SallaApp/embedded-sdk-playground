import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "./contexts/ThemeContext.jsx";
import { useAppBootstrap } from "./hooks/useAppBootstrap.js";
import { useExposeEmbeddedGlobally } from "./hooks/useExposeEmbeddedGlobally.js";
import { useCheckoutResultSubscription } from "./hooks/useCheckoutResultSubscription.js";
import { useIframeAutoBootstrap } from "./hooks/useIframeAutoBootstrap.js";
import { useMessageLog } from "./hooks/useMessageLog.js";
import { ToastProvider, useToast } from "./contexts/ToastContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import Header from "./components/Header.jsx";
import StatusBar from "./components/StatusBar.jsx";
import Tabs from "./components/Tabs.jsx";
import EventTriggers from "./components/EventTriggers.jsx";
import MessageLog from "./components/MessageLog.jsx";
import DataDisplay from "./components/DataDisplay.jsx";
import PayloadEditor from "./components/PayloadEditor.jsx";
import PlaygroundTab from "./components/Playground/PlaygroundTab.jsx";
import AddonsTab from "./components/Addons/AddonsTab.jsx";

function AppContent() {
  const { setTheme } = useTheme();
  const { showToast } = useToast();

  // ============================================
  // EXAMPLE: Embedded App Bootstrap
  // This demonstrates the recommended initialization flow
  // ============================================

  // Memoize callbacks to prevent subscription churn
  const handleSdkThemeChange = useCallback(
    (newTheme) => {
      setTheme(newTheme);
      showToast(`Theme changed by host: ${newTheme}`, "info");
    },
    [setTheme, showToast],
  );

  const handleSdkActionClick = useCallback(
    (value) => {
      showToast(`Action clicked! Value: ${value}`, "info");
    },
    [showToast],
  );

  const {
    embedded,
    isReady,
    layout,
    token,
    verifiedData,
    verifyStatus,
    bootstrap,
  } = useAppBootstrap({
    debug: true,
    autoInit: false, // We trigger manually after iframe detection
    onThemeChange: handleSdkThemeChange,
    onActionClick: handleSdkActionClick,
  });

  // Expose embedded globally for Playground feature
  useExposeEmbeddedGlobally();

  // Subscribe to checkout results (works after 3DS redirects)
  useCheckoutResultSubscription();

  // Detect iframe mode and auto-bootstrap when embedded
  const { iframeMode, parentOrigin, setParentOrigin } =
    useIframeAutoBootstrap(bootstrap);

  // ============================================
  // TEST CONSOLE TOOLING
  // The following is specific to this test app,
  // not part of a typical embedded app
  // ============================================

  const {
    messageLog,
    filterUnknown,
    setFilterUnknown,
    logMessage,
    clearLog,
    copyLog,
  } = useMessageLog();

  const [activeTab, setActiveTab] = useState("test-console");
  const [eventPayload, setEventPayload] = useState(null);
  const hasShownConnectedToast = useRef(false);

  const handleTabChange = useCallback(
    (tabId) => {
      setActiveTab(tabId);
      // Auto-resize iframe after view changes
      setTimeout(() => {
        embedded.page.resize(document.body.clientHeight);
      }, 100);
    },
    [embedded],
  );

  // Connection status derived from SDK state
  const isConnected = isReady;

  // Show toast on initial connection (once only)
  useEffect(() => {
    if (isReady && layout && !hasShownConnectedToast.current) {
      hasShownConnectedToast.current = true;
      showToast("Connected! Received layout context.", "success");
      // Sync initial theme from host (subsequent changes handled by onThemeChange callback)
      if (layout.theme) {
        setTheme(layout.theme);
      }
    }
  }, [isReady, layout, showToast, setTheme]);

  // ============================================
  // TOOLING: Message Logger
  // Logs ALL postMessage traffic for debugging
  // Real apps should NOT include this
  // ============================================

  useEffect(() => {
    const handleIncomingMessage = (event) => {
      // Only log embedded:: events
      if (!event.data?.event?.startsWith?.("embedded::")) return;

      // Log for debugging
      logMessage("incoming", event.data, null, event.origin);

      // Update parent origin from first message
      if (event.origin && event.origin !== window.location.origin) {
        setParentOrigin(event.origin);
      }
    };

    window.addEventListener("message", handleIncomingMessage);
    return () => window.removeEventListener("message", handleIncomingMessage);
  }, [logMessage, setParentOrigin]);

  // ============================================
  // TOOLING: Event Trigger Handlers
  // ============================================

  const handleEventClick = useCallback((eventName, payload) => {
    setEventPayload({ eventName, payload });
  }, []);

  const handleSendCustom = useCallback(
    (payload) => {
      const target = window.parent !== window ? window.parent : window.opener;

      if (!target || target === window) {
        showToast(
          "No parent window detected. Open this page in an iframe.",
          "error",
        );
        logMessage("outgoing", payload, "No parent window");
        return;
      }

      try {
        target.postMessage(payload, "*");
        logMessage("outgoing", payload);
      } catch (error) {
        showToast("Failed to send message: " + error.message, "error");
        logMessage("outgoing", payload, error.message);
      }
    },
    [showToast, logMessage],
  );

  const handleCopyLog = useCallback(async () => {
    const success = await copyLog();
    showToast(
      success ? "Log copied to clipboard" : "Failed to copy log",
      success ? "success" : "error",
    );
  }, [copyLog, showToast]);

  // ============================================
  // Render
  // ============================================

  const tabs = [
    { id: "test-console", label: "Test Console" },
    { id: "playground", label: "Playground" },
    { id: "addons", label: "Addons" },
  ];

  return (
    <div className="app">
      <Header />
      <StatusBar
        isConnected={isConnected}
        parentOrigin={parentOrigin}
        iframeMode={iframeMode}
      />
      <Tabs activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs} />
      <main className="main-content">
        {activeTab === "test-console" && (
          <>
            <EventTriggers
              embedded={embedded}
              logMessage={logMessage}
              showToast={showToast}
              bootstrap={bootstrap}
              onEventClick={handleEventClick}
            />
            <div className="panel-right">
              <MessageLog
                messageLog={messageLog}
                filterUnknown={filterUnknown}
                onFilterChange={setFilterUnknown}
                onClear={clearLog}
                onCopy={handleCopyLog}
              />
              <DataDisplay
                layoutData={layout}
                token={token}
                verifiedData={verifiedData}
                verifyStatus={
                  verifyStatus === "verified"
                    ? "✓ Verified"
                    : verifyStatus === "failed"
                      ? "✗ Failed"
                      : verifyStatus === "verifying"
                        ? "Verifying..."
                        : "—"
                }
              />
              <PayloadEditor
                onSend={handleSendCustom}
                eventPayload={eventPayload}
              />
            </div>
          </>
        )}
        {activeTab === "playground" && (
          <PlaygroundTab
            embedded={embedded}
            logMessage={logMessage}
            showToast={showToast}
          />
        )}
        {activeTab === "addons" && (
          <AddonsTab
            embedded={embedded}
            logMessage={logMessage}
            showToast={showToast}
          />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
