/**
 * ESLINT CONFIGURATION (Flat Config Format)
 *
 * ESLint is a JavaScript linter that helps catch bugs and enforce code style.
 * This configuration uses ESLint's new "flat config" format (eslint.config.js).
 *
 * Configuration breakdown:
 * 1. Extends recommended configs from ESLint, React Hooks, and React Refresh
 * 2. Configures language settings for modern JavaScript + JSX
 * 3. Customizes rules for React development patterns
 *
 * Plugins used:
 * - @eslint/js: ESLint's recommended JavaScript rules
 * - eslint-plugin-react-hooks: Enforces React Hooks rules (dependencies, order)
 * - eslint-plugin-react-refresh: Ensures components work with Vite's HMR
 */

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Ignore build output directory (don't lint compiled/bundled code)
  globalIgnores(['dist']),
  {
    // Apply to all JavaScript and JSX files
    files: ['**/*.{js,jsx}'],

    // Extend recommended configurations:
    // - js.configs.recommended: ESLint's core JavaScript rules
    // - reactHooks.configs.flat.recommended: React Hooks best practices
    // - reactRefresh.configs.vite: Vite HMR compatibility rules
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    // Language configuration
    languageOptions: {
      ecmaVersion: 2020, // Support ES2020 features
      globals: globals.browser, // Include browser globals (window, document, etc.)
      parserOptions: {
        ecmaVersion: 'latest', // Parse latest JavaScript syntax
        ecmaFeatures: { jsx: true }, // Enable JSX parsing
        sourceType: 'module', // Use ES modules (import/export)
      },
    },

    // Custom rule overrides
    rules: {
      /**
       * Allow unused variables that start with uppercase or underscore.
       *
       * Why this is needed:
       * - React components are often imported but used in JSX (not "called" traditionally)
       * - Constants defined but not yet used during development
       * - Underscore prefix convention for intentionally unused parameters
       *
       * Examples that won't trigger errors:
       * - const MyComponent = () => <div />  // Uppercase
       * - const API_URL = "..."              // Uppercase
       * - function fn(_unusedParam) {}       // Underscore prefix
       */
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
