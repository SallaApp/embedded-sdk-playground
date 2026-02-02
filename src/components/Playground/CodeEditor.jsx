import Editor from "@monaco-editor/react";
import logger from "../../utils/logger.js";
import { useTheme } from "../../contexts/ThemeContext.jsx";

const onMount = async (editor, monaco) => {
  let sdkTypesLoaded = false;
  try {
    const response = await fetch("/types/salla-embedded-sdk.d.ts");
    if (response.ok) {
      let sdkTypes = await response.text();
      sdkTypes += `
          declare global {
            interface Window {
              salla: {
                embedded: EmbeddedApp;
              };
            }
          }
          export {};
        `;
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        sdkTypes,
        "file:///node_modules/@types/salla-embedded-sdk/index.d.ts",
      );
      sdkTypesLoaded = true;
    }
  } catch (e) {
    logger.warn("Could not load SDK types, using inline types", e);
  }
};

export default function CodeEditor({ value, onChange, height = "400px" }) {
  const { isDarkMode } = useTheme();

  return (
    <Editor
      height={height}
      language="typescript"
      theme={isDarkMode ? "vs-dark" : "vs-light"}
      value={value}
      onChange={onChange}
      onMount={onMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
      }}
    />
  );
}
