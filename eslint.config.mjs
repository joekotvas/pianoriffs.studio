import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import testingLibrary from "eslint-plugin-testing-library";
import globals from "globals";
import prettier from "eslint-config-prettier";

// Shared rule configurations to avoid duplication
const sharedRules = {
  "@typescript-eslint/no-unused-vars": ["warn", { 
    argsIgnorePattern: "^_",
    varsIgnorePattern: "^_"
  }]
};

export default tseslint.config(
  // Ignore patterns
  {
    ignores: ["dist/", "node_modules/", "demo/", "coverage/", "**/*.d.ts"]
  },

  // Base recommended configs
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,  // Disable ESLint rules that conflict with Prettier

  // TypeScript + React configuration for source files
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/__tests__/**"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021
      }
    },
    plugins: {
      "react-hooks": reactHooks
    },
    rules: {
      // React Hooks - use recommended rules
      ...reactHooks.configs.recommended.rules,
      
      // Custom overrides
      ...sharedRules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/ban-ts-comment": "off",
      "no-console": ["warn", { allow: ["warn", "error"] }]
    }
  },

  // Test files configuration
  {
    files: ["src/__tests__/**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.node
      }
    },
    plugins: {
      "testing-library": testingLibrary
    },
    rules: {
      // Relaxed rules for tests
      ...sharedRules,
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      // Testing Library best practices
      ...testingLibrary.configs.react.rules
    }
  },
  
  // Configuration files (like jest.config.js)
  {
    files: ["*.js", "*.mjs"],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      "@typescript-eslint/no-var-requires": "off"
    }
  }
);
