import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import Button from "./forms/Button.jsx";

export default function PayloadEditor({
  onSend,
  initialPayload = "",
  eventPayload = null,
}) {
  const [payload, setPayload] = useState(
    initialPayload ||
      JSON.stringify({ event: "embedded::iframe.ready", height: 600 }, null, 2),
  );

  // Update payload when event is clicked
  useEffect(() => {
    if (eventPayload) {
      const { eventName, payload: payloadData } = eventPayload;
      // Format as BaseMessage structure for the editor
      const message = {
        event: eventName,
        payload: payloadData,
        timestamp: Date.now(),
        source: "embedded-app",
      };
      setPayload(JSON.stringify(message, null, 2));
    }
  }, [eventPayload]);

  const handleSend = () => {
    try {
      const parsed = JSON.parse(payload);
      onSend(parsed);
    } catch (error) {
      alert("Invalid JSON: " + error.message);
    }
  };

  return (
    <section className="panel panel-editor">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Payload Editor</h2>
          <span className="panel-subtitle">Customize event data</span>
        </div>
        <div className="panel-actions">
          <Button variant="primary" onClick={handleSend}>
            <Send size={14} />
            Send
          </Button>
        </div>
      </div>
      <div className="editor-container">
        <textarea
          className="payload-textarea"
          spellCheck="false"
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
        />
      </div>
    </section>
  );
}
