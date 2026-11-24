import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

/*
 * Quy ước code FE (Unijob):
 *  - Component: PascalCase, tên file = tên component
 *  - Hàm / biến: camelCase; hằng số dùng chung: UPPER_SNAKE_CASE
 *  - Thư mục: chữ thường (pages/candidate, pages/employer, ...)
 *  - Chuỗi trong JS: nháy đơn; thuộc tính JSX: nháy kép; luôn có dấu chấm phẩy
 *  - Màu sắc lấy từ constants/colors.js, không viết mã màu trực tiếp trong trang
 */
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: { react },
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
      // Biến dùng trong JSX được tính là đã dùng → bắt được cả import component thừa
      'react/jsx-uses-vars': 'error',
      'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_', caughtErrors: 'none' }],
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      'jsx-quotes': ['error', 'prefer-double'],
      semi: ['error', 'always'],
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
]);
