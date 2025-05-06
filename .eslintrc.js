/* eslint-disable no-unused-vars */
// ========================================================================
// FILE: .eslintrc.js
// ========================================================================
// Assuming a standard ESLint config for Create React App or similar.
// No changes needed based on the prompt unless specific rules were provided.
module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: [
    "eslint:recommended",
    "react-app",
    "react-app/jest",
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "warn",
    "jsx-a11y/anchor-is-valid": "warn",
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  overrides: [
    {
      files: ["**/*.test.js", "**/*.test.jsx"],
      env: {
        jest: true,
      },
    },
  ],
};
