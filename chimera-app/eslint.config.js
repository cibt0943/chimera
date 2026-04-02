// eslint.config.js
import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginJsxA11y from 'eslint-plugin-jsx-a11y'
import pluginImport from 'eslint-plugin-import'
import configPrettier from 'eslint-config-prettier'

/**
 * @type {import('eslint').Linter.FlatConfig[]}
 */
export default tseslint.config(
  // ベース構成
  {
    ignores: ['build/', '.react-router', 'app/components/ui/'],
  },
  eslint.configs.recommended, // eslint:recommended を適用する
  ...tseslint.configs.recommended, // @typescript-eslint/eslint-plugin を適用する
  pluginImport.flatConfigs.recommended,
  configPrettier, // eslint-config-prettier を適用する

  // 共通設定（全ファイルに適用される）
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.commonjs,
        ...globals.es6,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {}, // tsconfig.json に基づいてモジュール解決
      },
    },
  },

  // カスタムルール
  {
    rules: {
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          // A && B, A || C を許可
          allowShortCircuit: true,
          // 三項演算子を許可
          allowTernary: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // JSX/TSX ファイル用の React 設定（overrides 形式）
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      'jsx-a11y': pluginJsxA11y,
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...pluginReact.configs['jsx-runtime'].rules,
      ...pluginReactHooks.configs.recommended.rules,
      ...pluginJsxA11y.configs.recommended.rules,
      'react/prop-types': 'off', // Props の型チェックは TS で行う & 誤検知があるため無効化
    },
    settings: {
      react: {
        version: 'detect',
      },
      formComponents: ['Form'],
      linkComponents: [
        { name: 'Link', linkAttribute: 'to' },
        { name: 'NavLink', linkAttribute: 'to' },
      ],
    },
  },
)
