import { EmbeddedEvents } from "../utils/eventDefinitions.js";
import { Clock, Lock, Home, Menu, Grid3x3, Bell, Square } from "lucide-react";
import Button from "./forms/Button.jsx";

export default function EventTriggers({
  onEventClick,
  embedded,
  logMessage,
  showToast,
  bootstrap,
  onAddDynamicItem,
  onUpdateLatestDynamicItem,
  onRemoveLatestDynamicItem,
}) {
  const handleEventButtonClick = async (eventName) => {
    const eventDef = EmbeddedEvents[eventName];

    if (!eventDef) {
      showToast("Unknown event: " + eventName, "error");
      return;
    }

    if (eventDef.warning) {
      if (!window.confirm(eventDef.warning + "\n\nContinue?")) {
        return;
      }
    }

    let payload = JSON.parse(JSON.stringify(eventDef.payload));

    if (eventName === "embedded::iframe.ready") {
      payload.height = document.body.scrollHeight || 600;
    }

    // Notify payload editor about the clicked event
    if (onEventClick) {
      onEventClick(eventName, payload);
    }

    await sendSdkEvent(eventName, payload);
  };

  const sendSdkEvent = async (eventName, payload) => {
    // Log with event name included for proper display
    logMessage("outgoing", { event: eventName, ...payload });

    try {
      switch (eventName) {
        case "embedded::iframe.ready":
          await bootstrap();
          break;

        case "embedded::ready":
          embedded.ready();
          showToast("Ready signal sent!", "success");
          break;

        case "embedded::auth.refresh":
          embedded.auth.refresh();
          break;

        case "embedded::auth.introspect": {
          showToast("Calling auth.introspect()...", "info");
          try {
            const result = await embedded.auth.introspect();
            if (result.isVerified && result.data) {
              showToast(
                `Introspect verified. Merchant ID: ${result.data.merchant_id}, User ID: ${result.data.user_id}`,
                "success",
              );
            } else {
              showToast(
                `Introspect failed: ${String(result.error || "Unknown error")}`,
                "error",
              );
            }
            logMessage("incoming", {
              event: "embedded::auth.introspect.response",
              isVerified: result.isVerified,
              isError: result.isError,
              data: result.data,
              error: result.error,
            });
          } catch (error) {
            showToast(`Introspect error: ${error.message}`, "error");
            logMessage("incoming", {
              event: "embedded::auth.introspect.response",
              success: false,
              error: error.message,
            });
          }
          break;
        }

        case "embedded::destroy":
          embedded.destroy();
          break;

        case "embedded::page.navigate":
          embedded.page.navigate(payload.path, {
            state: payload.state,
            replace: payload.replace,
          });
          break;

        case "embedded::page.redirect":
          embedded.page.redirect(payload.url);
          break;

        case "embedded::page.setTitle":
          embedded.page.setTitle(payload.title);
          break;

        case "embedded::nav.setAction":
          embedded.nav.setAction({
            title: payload.title,
            value: payload.value,
            subTitle: payload.subTitle,
            icon: payload.icon,
            disabled: payload.disabled,
            extendedActions: payload.extendedActions,
          });
          break;

        case "embedded::nav.clearAction":
          embedded.nav.clearAction();
          break;

        case "embedded::nav.addItem": {
          showToast("Calling nav.addNavItem()…", "info");
          try {
            if (!onAddDynamicItem)
              throw new Error("Add item handler is missing");
            const result = await onAddDynamicItem();
            showToast(
              `Added navbar item. ID: ${result.id || "none"}`,
              "success",
            );
            logMessage("incoming", {
              event: "embedded::nav.addItem.response",
              item: result,
            });
          } catch (err) {
            showToast(`addNavItem failed: ${err.message}`, "error");
            logMessage(
              "outgoing",
              { event: eventName, ...payload },
              err.message,
            );
          }
          break;
        }

        case "embedded::nav.updateItem": {
          try {
            if (!onUpdateLatestDynamicItem) {
              throw new Error("Update item handler is missing");
            }
            const latest = await onUpdateLatestDynamicItem();
            showToast(`nav.updateNavItem: ${latest.id}`, "success");
          } catch (err) {
            showToast(`updateNavItem failed: ${err.message}`, "error");
          }
          break;
        }

        case "embedded::nav.removeItem": {
          try {
            if (!onRemoveLatestDynamicItem) {
              throw new Error("Remove item handler is missing");
            }
            const latest = await onRemoveLatestDynamicItem();
            showToast(`nav.removeNavItem: ${latest.id}`, "success");
          } catch (err) {
            showToast(`removeNavItem failed: ${err.message}`, "warning");
          }
          break;
        }

        case "embedded::ui.loading":
          embedded.ui.toast.info(
            "Loading event sent. You should call embedded.ui.loading.hide() to re-show the App. This test App will automatically hide loading after 10 seconds",
          );
          if (payload.action === "show") {
            embedded.ui.loading.show();
            setTimeout(() => {
              embedded.ui.loading.hide();
            }, 10000);
          } else {
            embedded.ui.loading.hide();
          }
          break;

        case "embedded::ui.breadcrumbs":
          if (payload.action === "hide") {
            embedded.ui.breadcrumbs.hide();
          } else {
            embedded.ui.breadcrumbs.show();
          }
          break;

        case "embedded::ui.toast":
          embedded.ui.toast.show({
            type: payload.type,
            message: payload.message,
            duration: payload.duration,
          });
          break;

        case "embedded::ui.confirm": {
          showToast("Waiting for confirm dialog response...", "info");
          try {
            const result = await embedded.ui.confirm({
              title: payload.title,
              message: payload.message,
              confirmText: payload.confirmText,
              cancelText: payload.cancelText,
              variant: payload.variant,
            });
            showToast(
              `Confirm result: ${result.confirmed ? "✓ Confirmed" : "✗ Cancelled"}`,
              result.confirmed ? "success" : "info",
            );
            logMessage("incoming", {
              event: "embedded::ui.confirm.response",
              confirmed: result.confirmed,
            });
          } catch (error) {
            showToast(`Confirm error: ${error.message}`, "error");
          }
          break;
        }

        default:
          showToast("No Embedded SDK handler for event: " + eventName, "error");
      }
    } catch (error) {
      showToast("Failed to send SDK event: " + error.message, "error");
      logMessage("outgoing", { event: eventName, ...payload }, error.message);
    }
  };

  return (
    <aside className="panel panel-triggers">
      <div className="panel-header">
        <h2 className="panel-title">Event Triggers</h2>
        <span className="panel-subtitle">
          Send events to host (embedded::*)
        </span>
      </div>

      {/* Iframe Lifecycle Events */}
      <section className="event-section">
        <h3 className="section-title">
          <Clock size={16} />
          Iframe Lifecycle
        </h3>
        <div className="button-grid">
          <Button
            event
            variant="primary"
            label="Init + Verify"
            hint="Full bootstrap flow"
            onClick={() => handleEventButtonClick("embedded::iframe.ready")}
          />
          <Button
            event
            variant="success"
            label="Ready"
            hint="Signal app ready"
            onClick={() => handleEventButtonClick("embedded::ready")}
          />
          <Button
            event
            variant="danger"
            label="Destroy"
            hint="destroy"
            onClick={() => handleEventButtonClick("embedded::destroy")}
          />
        </div>
      </section>

      {/* Auth Events */}
      <section className="event-section">
        <h3 className="section-title">
          <Lock size={16} />
          Authentication
        </h3>
        <div className="button-grid">
          <Button
            event
            variant="warning"
            label="Refresh"
            hint="auth.refresh"
            onClick={() => handleEventButtonClick("embedded::auth.refresh")}
          />
          <Button
            event
            variant="accent"
            label="⚡ Introspect (Async)"
            hint="auth.introspect → Promise"
            onClick={() => handleEventButtonClick("embedded::auth.introspect")}
          />
        </div>
      </section>

      {/* Page Navigation Events */}
      <section className="event-section">
        <h3 className="section-title">
          <Home size={16} />
          Page Navigation
        </h3>
        <div className="button-grid">
          <Button
            event
            label="Navigate"
            hint="page.navigate"
            onClick={() => handleEventButtonClick("embedded::page.navigate")}
          />
          <Button
            event
            label="Redirect"
            hint="page.redirect"
            onClick={() => handleEventButtonClick("embedded::page.redirect")}
          />
          <Button
            event
            label="Set Title"
            hint="page.setTitle"
            onClick={() => handleEventButtonClick("embedded::page.setTitle")}
          />
        </div>
      </section>

      {/* Nav Bar Events */}
      <section className="event-section">
        <h3 className="section-title">
          <Menu size={16} />
          Navigation Bar
        </h3>
        <div className="button-grid">
          <Button
            event
            label="Set Action"
            hint="nav.setAction"
            onClick={() => handleEventButtonClick("embedded::nav.setAction")}
          />
          <Button
            event
            label="Clear Action"
            hint="nav.clearAction"
            onClick={() => handleEventButtonClick("embedded::nav.clearAction")}
          />
          <Button
            event
            label="Add item"
            hint="nav.addNavItem (async)"
            onClick={() => handleEventButtonClick("embedded::nav.addItem")}
          />
          <Button
            event
            label="Update item"
            hint="nav.updateNavItem"
            onClick={() => handleEventButtonClick("embedded::nav.updateItem")}
          />
          <Button
            event
            label="Remove item"
            hint="nav.removeNavItem"
            onClick={() => handleEventButtonClick("embedded::nav.removeItem")}
          />
        </div>
      </section>

      {/* UI Events */}
      <section className="event-section">
        <h3 className="section-title">
          <Grid3x3 size={16} />
          UI State
        </h3>
        <div className="button-grid">
          <Button
            event
            label="Loading On"
            hint="ui.loading (show)"
            onClick={() => {
              onEventClick?.("embedded::ui.loading", { action: "show" });
              sendSdkEvent("embedded::ui.loading", { action: "show" });
            }}
          />
          <Button
            event
            label="Loading Off"
            hint="ui.loading (hide)"
            onClick={() => {
              onEventClick?.("embedded::ui.loading", { action: "hide" });
              sendSdkEvent("embedded::ui.loading", { action: "hide" });
            }}
          />
          <Button
            event
            label="Breadcrumbs Show"
            hint="ui.breadcrumbs (show)"
            onClick={() => {
              onEventClick?.("embedded::ui.breadcrumbs", { action: "show" });
              sendSdkEvent("embedded::ui.breadcrumbs", { action: "show" });
            }}
          />
          <Button
            event
            label="Breadcrumbs Hide"
            hint="ui.breadcrumbs (hide)"
            onClick={() => {
              onEventClick?.("embedded::ui.breadcrumbs", { action: "hide" });
              sendSdkEvent("embedded::ui.breadcrumbs", { action: "hide" });
            }}
          />
        </div>
      </section>

      {/* Toast Events */}
      <section className="event-section">
        <h3 className="section-title">
          <Bell size={16} />
          Toast Notifications
        </h3>
        <div className="button-grid">
          <Button
            event
            variant="success"
            label="Success"
            hint="ui.toast (success)"
            onClick={() => {
              onEventClick?.("embedded::ui.toast", {
                type: "success",
                message: "Operation completed successfully!",
                duration: 3000,
              });
              sendSdkEvent("embedded::ui.toast", {
                type: "success",
                message: "Operation completed successfully!",
                duration: 3000,
              });
            }}
          />
          <Button
            event
            variant="danger"
            label="Error"
            hint="ui.toast (error)"
            onClick={() => {
              onEventClick?.("embedded::ui.toast", {
                type: "error",
                message: "Something went wrong!",
                duration: 5000,
              });
              sendSdkEvent("embedded::ui.toast", {
                type: "error",
                message: "Something went wrong!",
                duration: 5000,
              });
            }}
          />
          <Button
            event
            variant="warning"
            label="Warning"
            hint="ui.toast (warning)"
            onClick={() => {
              onEventClick?.("embedded::ui.toast", {
                type: "warning",
                message: "Please review your input",
                duration: 4000,
              });
              sendSdkEvent("embedded::ui.toast", {
                type: "warning",
                message: "Please review your input",
                duration: 4000,
              });
            }}
          />
          <Button
            event
            variant="info"
            label="Info"
            hint="ui.toast (info)"
            onClick={() => {
              onEventClick?.("embedded::ui.toast", {
                type: "info",
                message: "New features available",
                duration: 3000,
              });
              sendSdkEvent("embedded::ui.toast", {
                type: "info",
                message: "New features available",
                duration: 3000,
              });
            }}
          />
        </div>
      </section>

      {/* Dialogs */}
      <section className="event-section">
        <h3 className="section-title">
          <Square size={16} />
          Dialogs
        </h3>
        <div className="button-grid">
          <Button
            event
            variant="accent"
            label="⚡ Confirm (Async)"
            hint="ui.confirm → Promise"
            onClick={() => handleEventButtonClick("embedded::ui.confirm")}
          />
        </div>
      </section>
    </aside>
  );
}
