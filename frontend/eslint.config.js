import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // Import 순서 상세 설정
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // React 및 외부 라이브러리
            ['^react', '^@?\\w'],

            // 절대 경로 -> 상위 경로 -> 현재 경로 순서로 정리
            [
              '^@/(?!.*\\.(types|css|css\\.ts|style)$)', // 절대 경로
              '^\\.\\./?(?!.*\\.(types|css|css\\.ts|style)$)', // 상위 경로
              '^\\./?(?!.*\\.(types|css|css\\.ts|style)$)', // 현재 경로
            ],

            // 타입 파일 (.types, /types/)
            ['^@/.*\\.types$', '^@/types', '^.*\\.types$'],

            // 스타일 파일 (.css, .css.ts)
            ['^.*\\.css(\\.ts)?$', '^\\u0000'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',

      // Prettier 규칙 적용
      ...prettier.rules,
    },
  }
);
