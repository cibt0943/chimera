import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginJsxA11y from 'eslint-plugin-jsx-a11y'
import configPrettier from 'eslint-config-prettier'
// ES9に対応したらしいので有効にしたけどちゃんと動いてるか後で確認する
import pluginImport from 'eslint-plugin-import'

/**
 * @type {import('eslint').Linter.Config}
 */
export default tseslint.config(
  // base
  {
    ignores: ['build/', '.react-router', 'app/components/ui/'],
  },
  eslint.configs.recommended, // eslint:recommended を適用する
  ...tseslint.configs.recommended, // @typescript-eslint/eslint-plugin を適用する
  pluginImport.flatConfigs.recommended,
  configPrettier, // eslint-config-prettier を適用する
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
  },

  // custom rules
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

  // React
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
      'import/resolver': {
        typescript: {},
      },
    },
  },
)
