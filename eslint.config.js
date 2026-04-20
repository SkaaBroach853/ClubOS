import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'google-cloud-sdk', 'node_modules']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Allow underscore-prefixed unused vars (common React pattern for destructuring)
      'no-unused-vars': ['warn', { 
        varsIgnorePattern: '^[A-Z_]',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        caughtErrors: 'none', // Never report unused catch error variables
      }],
      // Empty catch blocks are valid in React for intentional error swallowing
      'no-empty': ['warn', { allowEmptyCatch: true }],
      // Downgrade setState-in-effect to off — valid for initialization patterns
      'react-hooks/set-state-in-effect': 'off',
      // Keep exhaustive deps as warn not error
      'react-hooks/exhaustive-deps': 'warn',
      // Allow function hoisting (functions used before declaration in useEffect)
      'no-use-before-define': 'off',
    },
  },
])

