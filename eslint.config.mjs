import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  nextPlugin.configs['core-web-vitals'],
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'prefer-const': 'warn',
      '@next/next/no-img-element': 'off',
      'react-hooks/exhaustive-deps': 'warn'
    }
  }
);
