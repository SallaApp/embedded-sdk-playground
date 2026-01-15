# Embedded SDK Test Kit v0.1.0-beta.12

A developer testing tool for the Salla Embedded SDK.

## Overview

This test console allows you to simulate and debug the communication between an embedded third-party app (iframe) and the Salla Dashboard (host). It sends and receives events using the `@salla.sa/embedded-sdk` package.

## Bootstrap Flow

The test console demonstrates the complete authentication flow:

```
1. embedded.init() - Initialize SDK and get layout info
2. embedded.auth.getToken() - Get token from URL (?token=XXX)
3. Verify token with Salla API
4. embedded.ready() - Signal app is ready (removes host loading)
   OR embedded.destroy() - Exit embedded view
```

## Usage

1. Open this app inside an iframe within the Salla Dashboard
2. The console will auto-run the bootstrap flow
3. Use the buttons to trigger various events
4. Monitor the message log for incoming/outgoing events

## Event Reference

All events use the `embedded::` namespace prefix.

### Outgoing Events (App → Host)

#### Iframe Lifecycle

| Event                     | Description                          |
| ------------------------- | ------------------------------------ |
| `embedded::iframe.ready`  | Init handshake, request layout info  |
| `embedded::ready`         | Signal app is fully loaded and ready |
| `embedded::iframe.resize` | Request iframe height change         |
| `embedded::destroy`       | Exit embedded view                   |

#### Authentication

| Event                    | Description                     |
| ------------------------ | ------------------------------- |
| `embedded::auth.refresh` | Re-render iframe with new token |

#### Page Navigation

| Event                     | Description                        |
| ------------------------- | ---------------------------------- |
| `embedded::page.navigate` | SPA navigation within dashboard    |
| `embedded::page.redirect` | Full page redirect to external URL |
| `embedded::page.setTitle` | Set document title in host         |

#### Navigation Bar

| Event                     | Description                     |
| ------------------------- | ------------------------------- |
| `embedded::nav.setAction` | Set/clear primary action button |

#### UI State

| Event                  | Description                 |
| ---------------------- | --------------------------- |
| `embedded::ui.loading` | Show/hide loading indicator |
| `embedded::ui.toast`   | Show toast notification     |
| `embedded::ui.modal`   | Open/close modal dialog     |
| `embedded::ui.confirm` | Show confirm dialog (async) |

#### Business

| Event                       | Description               |
| --------------------------- | ------------------------- |
| `embedded::checkout.create` | Initiate checkout process |

#### Logging

| Event           | Description              |
| --------------- | ------------------------ |
| `embedded::log` | Send log message to host |

### Incoming Events (Host → App)

| Event                           | Description                      |
| ------------------------------- | -------------------------------- |
| `embedded::context.provide`     | Layout info (theme, width, etc.) |
| `embedded::theme.change`        | Theme changed notification       |
| `embedded::nav.actionClick`     | Primary action button clicked    |
| `embedded::ui.confirm.response` | Confirm dialog response          |

## Layout Data

When connected, the host provides layout info:

| Field      | Type                | Description            |
| ---------- | ------------------- | ---------------------- |
| `theme`    | `'light' \| 'dark'` | Current theme          |
| `width`    | `number`            | Parent container width |
| `locale`   | `string`            | Current locale code    |
| `currency` | `string`            | Current currency code  |

## Token Verification

The test console verifies tokens using the Salla API:

**Endpoint:**

```
POST https://exchange-authority-service-dev-59.merchants.workers.dev/exchange-authority/v1/verify
```

**Headers:**

```
s-source: app
Content-Type: application/json
```

**Request:**

```json
{
  "token": "<token_from_url>",
  "iss": "salla-partners",
  "subject": "apps",
  "env": "dev"
}
```

**Response:**

```json
{
  "status": 200,
  "success": true,
  "data": {
    "store_id": 123,
    "user_id": 123,
    "owner_id": 123,
    "exp": "2026-12-22T10:27:40Z"
  }
}
```

## Event Payloads

All events follow the BaseMessage structure:

```typescript
interface BaseMessage {
  event: string;
  payload: Record<string, unknown>;
  timestamp: number;
  source: "embedded-app" | "merchant-dashboard";
  requestId?: string;
  metadata?: {
    version: string;
    [key: string]: unknown;
  };
}
```

### `embedded::iframe.ready`

```json
{
  "event": "embedded::iframe.ready",
  "payload": {
    "height": 600
  },
  "timestamp": 1234567890,
  "source": "embedded-app"
}
```

### `embedded::ready`

```json
{
  "event": "embedded::ready",
  "payload": {},
  "timestamp": 1234567890,
  "source": "embedded-app"
}
```

### `embedded::auth.refresh`

```json
{
  "event": "embedded::auth.refresh",
  "payload": {},
  "timestamp": 1234567890,
  "source": "embedded-app"
}
```

### `embedded::destroy`

```json
{
  "event": "embedded::destroy",
  "payload": {},
  "timestamp": 1234567890,
  "source": "embedded-app"
}
```

### `embedded::page.navigate`

```json
{
  "event": "embedded::page.navigate",
  "payload": {
    "path": "/products",
    "state": {},
    "replace": false
  },
  "timestamp": 1234567890,
  "source": "embedded-app"
}
```

### `embedded::page.redirect`

```json
{
  "event": "embedded::page.redirect",
  "payload": {
    "url": "https://external-site.com"
  },
  "timestamp": 1234567890,
  "source": "embedded-app"
}
```

### `embedded::page.setTitle`

```json
{
  "event": "embedded::page.setTitle",
  "payload": {
    "title": "My App - Product Details"
  },
  "timestamp": 1234567890,
  "source": "embedded-app"
}
```

### `embedded::nav.setAction`

```json
{
  "event": "embedded::nav.setAction",
  "payload": {
    "title": "Add Product",
    "onClick": true,
    "value": "create",
    "subTitle": "Create a new product",
    "icon": "sicon-add",
    "disabled": false,
    "extendedActions": [
      { "title": "Import", "value": "import" },
      { "title": "Export", "value": "export" }
    ]
  },
  "timestamp": 1234567890,
  "source": "embedded-app"
}
```

### `embedded::ui.loading`

```json
{
  "event": "embedded::ui.loading",
  "payload": {
    "action": "show"
  },
  "timestamp": 1234567890,
  "source": "embedded-app"
}
```

**Actions:**

- `"show"` - Show loading indicator
- `"hide"` - Hide loading indicator

### `embedded::ui.toast`

```json
{
  "event": "embedded::ui.toast",
  "payload": {
    "type": "success",
    "message": "Operation completed!",
    "duration": 3000
  },
  "timestamp": 1234567890,
  "source": "embedded-app"
}
```

### `embedded::ui.confirm`

```json
{
  "event": "embedded::ui.confirm",
  "payload": {
    "title": "Delete Product?",
    "message": "This action cannot be undone.",
    "confirmText": "Delete",
    "cancelText": "Cancel",
    "variant": "danger"
  },
  "requestId": "req-1234567890",
  "timestamp": 1234567890,
  "source": "embedded-app"
}
```

**Note:** `requestId` is at the root level (not in payload) for async request/response patterns.

### `embedded::checkout.create`

```json
{
  "event": "embedded::checkout.create",
  "payload": {
    "amount": 299.99,
    "currency": "SAR",
    "items": [{ "id": "PROD_001", "quantity": 1 }]
  },
  "timestamp": 1234567890,
  "source": "embedded-app"
}
```

### `embedded::log`

```json
{
  "event": "embedded::log",
  "payload": {
    "level": "info",
    "message": "Test log message",
    "context": {
      "component": "TestConsole"
    }
  },
  "timestamp": 1234567890,
  "source": "embedded-app"
}
```

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling with dark/light theme support
- `src/events.js` - Event definitions and payloads
- `src/app.js` - Application logic with bootstrap flow
- `src/main.js` - Entry point

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
```

For testing with the dashboard, embed this app via iframe with a token:

```html
<iframe src="http://localhost:5173/?token=XXX"></iframe>
```

## License

Copyright 2024 Salla
