// ========================================================================
// FILE: postcss.config.js
// ========================================================================
// Adjusted for standard Tailwind v3+ installation
module.exports = {
  plugins: {
    tailwindcss: {}, // Standard Tailwind plugin
    autoprefixer: {},
    // Removed '@tailwindcss/postcss7-compat' as using standard Tailwind now
    // Removed '@tailwindcss/postcss' which seems redundant/incorrect here
    // Removed 'postcss-flexbugs-fixes' and 'postcss-preset-env' as Autoprefixer handles prefixes
  },
};
