/* eslint-disable no-unused-vars */

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
    "react/no-unknown-property": "off", // specific for this project due to custom attributes
    "react/no-unescaped-entities": "off", // for things like "don't"
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