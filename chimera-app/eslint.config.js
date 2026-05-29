// eslint.config.js
import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintReact from '@eslint-react/eslint-plugin'
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
      // virtual: モジュール（react-router のビルド成果物等）はバンドラーが解決するため除外
      'import/no-unresolved': ['error', { ignore: ['^virtual:'] }],
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

  // JSX/TSX ファイル用の React 設定
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [eslintReact.configs['recommended-typescript']],
    plugins: {
      'react-hooks': pluginReactHooks,
      'jsx-a11y': pluginJsxA11y,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      ...pluginJsxA11y.configs.recommended.rules,
      // SSR 対応の初期化パターン（useEffect 内の setState）は有効なコードのため無効化
      'react-hooks/set-state-in-effect': 'off',
      '@eslint-react/set-state-in-effect': 'off',
      // new Date() 等の pure でない呼び出しはフック・コンポーネントで一般的なため無効化
      '@eslint-react/purity': 'off',
      // useIsomorphicLayoutEffect のように hook を返す関数も use prefix を許可
      '@eslint-react/no-unnecessary-use-prefix': 'off',
      // exhaustive-deps は react-hooks/exhaustive-deps で代替
      '@eslint-react/exhaustive-deps': 'off',
      // TanStack Table 等のサードパーティライブラリはメモ化互換性警告を抑制
      'react-hooks/incompatible-library': 'off',
    },
    settings: {
      formComponents: ['Form'],
      linkComponents: [
        { name: 'Link', linkAttribute: 'to' },
        { name: 'NavLink', linkAttribute: 'to' },
      ],
    },
  },
)
