import { EmbeddedEvents } from "../utils/eventDefinitions.js";
import {
  Clock,
  Lock,
  Home,
  Menu,
  Grid3x3,
  Bell,
  Square,
  ShoppingBag,
} from "lucide-react";
import Button from "./forms/Button.jsx";
import logger from "../utils/logger.js";

export default function EventTriggers({
  onEventClick,
  embedded,
  logMessage,
  showToast,
  bootstrap,
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

        case "embedded::iframe.resize":
          embedded.page.resize(payload.height);
          break;

        case "embedded::auth.refresh":
          embedded.auth.refresh();
          break;

        case "embedded::auth.introspect": {
          showToast("Calling auth.introspect()...", "info");
          try {
            const result = await embedded.auth.introspect();
            showToast(
              `Introspect success! Merchant ID: ${result.data.merchant_id}, User ID: ${result.data.user_id}`,
              "success"
            );
            logMessage("incoming", {
              event: "embedded::auth.introspect.response",
              status: result.status,
              success: result.success,
              data: result.data,
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

        case "embedded::ui.loading-show":
          embedded.ui.toast.info(
            "Loading event sent. You should call embedded.ui.loading.hide() to re-show the App. This test App will automatically hide loading after 10 seconds"
          );
          embedded.ui.loading.show();
          setTimeout(() => {
            embedded.ui.loading.hide();
          }, 10000);
          break;

        case "embedded::ui.loading-hide":
          embedded.ui.loading.hide();
          break;

        case "embedded::ui.toast-success":
          embedded.ui.toast.success(payload.message, payload.duration);
          break;

        case "embedded::ui.toast-error":
          embedded.ui.toast.error(payload.message, payload.duration);
          break;

        case "embedded::ui.toast-warning":
          embedded.ui.toast.warning(payload.message, payload.duration);
          break;

        case "embedded::ui.toast-info":
          embedded.ui.toast.info(payload.message, payload.duration);
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
              result.confirmed ? "success" : "info"
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

        case "embedded::checkout.create":
          embedded.checkout.create(payload);
          break;

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
            label="Resize"
            hint="iframe.resize"
            onClick={() => handleEventButtonClick("embedded::iframe.resize")}
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
            onClick={() => handleEventButtonClick("embedded::ui.loading-show")}
          />
          <Button
            event
            label="Loading Off"
            hint="ui.loading (hide)"
            onClick={() => handleEventButtonClick("embedded::ui.loading-hide")}
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
            onClick={() => handleEventButtonClick("embedded::ui.toast-success")}
          />
          <Button
            event
            variant="danger"
            label="Error"
            hint="ui.toast (error)"
            onClick={() => handleEventButtonClick("embedded::ui.toast-error")}
          />
          <Button
            event
            variant="warning"
            label="Warning"
            hint="ui.toast (warning)"
            onClick={() => handleEventButtonClick("embedded::ui.toast-warning")}
          />
          <Button
            event
            variant="info"
            label="Info"
            hint="ui.toast (info)"
            onClick={() => handleEventButtonClick("embedded::ui.toast-info")}
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

      {/* Checkout */}
      <section className="event-section">
        <h3 className="section-title">
          <ShoppingBag size={16} />
          Checkout
        </h3>
        <div className="button-grid">
          <Button
            event
            variant="accent"
            label="Create Checkout"
            hint="checkout.create"
            onClick={() => handleEventButtonClick("embedded::checkout.create")}
            disabled
          />
        </div>
      </section>
    </aside>
  );
}
