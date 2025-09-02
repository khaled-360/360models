// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from "eslint-plugin-react"

// Begin fix
react.configs.recommended.plugins = { react }
react.configs.recommended.languageOptions = {
  parserOptions: react.configs.recommended.parserOptions
}
delete react.configs.recommended.parserOptions
// End fix

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...[{
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    plugins: {
      react,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // ... any rules you want
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
    },
  }],
  ...[{
    ignores: ["**/*.config.js"],
    rules: {
      "react/react-in-jsx-scope": "off",
    }
  }]
);