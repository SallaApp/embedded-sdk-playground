import { useState } from "react";
import CodeEditor from "./CodeEditor.jsx";
import OutputPanel from "./OutputPanel.jsx";
import { useCodeExecution } from "../../hooks/useCodeExecution.js";
import Button from "../forms/Button.jsx";

const DEFAULT_CODE = `// Try the embedded SDK
async function main() {
  // Example: Initialize and get layout info
  const { layout } = await window.salla.embedded.init({ debug: true });
  console.log('Layout:', layout);

  // Get token from URL
  const token = window.salla.embedded.auth.getToken();
  console.log('Token:', token ? 'Found' : 'Not found');

  // Signal ready
  window.salla.embedded.ready();
  console.log('App ready!');
}

main();
`;

export default function PlaygroundTab({ embedded, logMessage, showToast }) {
  const [code, setCode] = useState(DEFAULT_CODE);
  const { output, isExecuting, executeCode, clearOutput } = useCodeExecution();

  const handleRun = () => {
    if (!code.trim()) {
      showToast("Please enter some code", "warning");
      return;
    }
    executeCode(code);
  };

  return (
    <div className="playground-container">
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Code Editor</h2>
            <span className="panel-subtitle">
              Write window.salla.embedded.* code
            </span>
          </div>
          <div className="panel-actions">
            <Button
              variant="primary"
              onClick={handleRun}
              disabled={isExecuting}
            >
              Run
            </Button>
            <Button onClick={clearOutput}>Clear Output</Button>
          </div>
        </div>
        <div style={{ padding: "var(--space-md)" }}>
          <CodeEditor value={code} onChange={setCode} height="600px" />
        </div>
      </div>
      <OutputPanel output={output} isExecuting={isExecuting} />
    </div>
  );
}
