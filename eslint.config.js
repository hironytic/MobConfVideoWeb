import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      react,
    },
    rules: {
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "eqeqeq": [
        "error",
        "always"
      ],
      "semi": [
        "error",
        "never",
        {
          "beforeStatementContinuationChars": "never"
        }
      ],
      "semi-spacing": [
        "error",
        {
          "after": true,
          "before": false
        }
      ],
      "semi-style": [
        "error",
        "first"
      ],
      "no-extra-semi": "error",
      "no-unexpected-multiline": "error",
      "no-unreachable": "error",
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_",
        "destructuredArrayIgnorePattern": "^_",
      }],
    },
    languageOptions: {
      parser: tseslint.parser,
    },
  },
);
