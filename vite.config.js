import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: ".",
  build: {
    outDir: "dist",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["src/test/setup.js"],
    include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      outputDir: "coverage",
      exclude: [
        "node_modules/",
        "dist/",
        ".eslintrc.cjs",
        "**/*.config.js",
        "**/test/**",
        "**/__tests__/**",
        "public/**",
        "scripts/**",
        "server/**",
        "**/main.jsx",
      ],
    },
  },
});
