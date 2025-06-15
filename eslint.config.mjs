// eslint.config.mjs
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // This extends Next.js's recommended ESLint setup,
  // which includes eslint-plugin-react-hooks.
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // Add this object to customize rules from eslint-plugin-react-hooks
  {
    rules: {
      // To make the exhaustive-deps rule an error:
      'react-hooks/exhaustive-deps': 'error',

      // 'react-hooks/rules-of-hooks' is already 'error' via next/core-web-vitals,
      // but you could explicitly set it here if you wanted to be certain.
      // 'react-hooks/rules-of-hooks': 'error',
    },
  },

  // This turns off all rules that are unnecessary or might conflict with Prettier.
  // Make sure it's last so it can override other configs.
  ...compat.extends('prettier'),
];

export default eslintConfig;
