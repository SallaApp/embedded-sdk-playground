/* eslint-env node */
module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  plugins: ["react", "react-hooks", "react-refresh", "unused-imports"],
  settings: {
    react: { version: "detect" },
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "no-redeclare": ["error", { builtinGlobals: false }],
    "no-unused-vars": "off",
    "unused-imports/no-unused-imports": "warn",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
  },
  ignorePatterns: [
    "dist",
    "node_modules",
    "coverage",
    "*.config.js",
    "*.config.cjs",
    "public",
  ],
  overrides: [
    {
      files: ["server/**/*.js", "scripts/**/*.js"],
      env: { node: true, browser: false },
      rules: {
        "react-refresh/only-export-components": "off",
        "unused-imports/no-unused-imports": "warn",
      },
    },
    {
      files: ["src/test/**/*.js", "src/**/__tests__/**/*.{js,jsx}"],
      env: { node: true, browser: true },
      globals: {
        vi: "readonly",
        global: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
      },
      rules: {
        "react-refresh/only-export-components": "off",
      },
    },
  ],
};
