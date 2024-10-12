import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import configPrettier from 'eslint-config-prettier'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginJsxA11y from 'eslint-plugin-jsx-a11y'
// ES9に対応したらしいので有効にしたけどちゃんと動いてるか後で確認する
import pluginImport from 'eslint-plugin-import'
// eslint-plugin-react-hooks がES9に対応していないので一時的にES8の設定をES9で使えるようにする
import { fixupPluginRules } from '@eslint/compat'

/**
 * @type {import('eslint').Linter.Config}
 */
export default tseslint.config(
  // base
  {
    ignores: ['build/', 'app/components/ui/'],
  },
  eslint.configs.recommended, // eslint:recommended を適用する
  pluginImport.flatConfigs.recommended,
  ...tseslint.configs.recommended, // @typescript-eslint/eslint-plugin を適用する
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
          allowShortCircuit: true,
          allowTernary: true,
        },
      ],
    },
  },

  // React
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react: pluginReact,
      'react-hooks': fixupPluginRules(pluginReactHooks),
      // 'react-hooks': pluginReactHooks,
      'jsx-a11y': pluginJsxA11y,
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...pluginReact.configs['jsx-runtime'].rules,
      ...pluginJsxA11y.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      'react/prop-types': 'off', // Props の型チェックは TS で行う & 誤検知があるため無効化
    },
    languageOptions: {
      ...pluginReact.configs.recommended.languageOptions,
      ...pluginReact.configs['jsx-runtime'].languageOptions,
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
