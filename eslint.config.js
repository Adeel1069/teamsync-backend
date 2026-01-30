// Flat config format with Node.js rules
import js from "@eslint/js";
import nodePlugin from "eslint-plugin-n";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default [
  // Base recommended rules
  // Base JavaScript rules like no-undef, no-unused-vars, no-unreachable
  js.configs.recommended,

  // Node.js plugin recommended rules
  // Node.js rules like checking for missing imports, unsupported features
  nodePlugin.configs["flat/recommended"],

  // Prettier config (disables conflicting rules)
  // This will disable all ESLint rules that Prettier handles
  prettierConfig,

  // Global configuration
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },

    rules: {
      // Error prevention
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-console": "off", // Allow console for backend logging
      "no-undef": "error",

      // Node.js specific
      "n/no-missing-import": "off", // Handled by module resolution
      "n/no-unsupported-features/es-syntax": "off", // ES modules supported
      "n/no-process-exit": "off", // Allow process.exit in scripts
      "n/no-unpublished-import": "off", // Allow devDependencies imports
      "n/no-extraneous-import": "off", // Allow eslint peer dependencies

      // Best practices
      eqeqeq: ["error", "always"],
      curly: ["error", "multi-line"],
      "no-var": "error",
      "prefer-const": "error",
      "no-throw-literal": "error",
    },
  },

  // Ignore patterns
  {
    ignores: ["node_modules/", "uploads/", "logs/", "coverage/", "dist/"],
  },
];
