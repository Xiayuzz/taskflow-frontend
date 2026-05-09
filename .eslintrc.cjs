module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: ['./tsconfig.json'],
      },
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['vue', '@typescript-eslint', 'simple-import-sort', 'unused-imports'],
  rules: {
    'vue/multi-word-component-names': 'off',
    'unused-imports/no-unused-imports': 'warn',
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'prettier/prettier': ['warn', { endOfLine: 'auto' }],
    // === 格式化与 Prettier 协同：仅保留 Prettier 不覆盖的语义/命名规则 ===
    // 关闭会与 Prettier 重复或产生冲突的规则
    'vue/attributes-order': 'off',
    'vue/first-attribute-linebreak': 'off',
    'vue/html-self-closing': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    // 仅保留：单行属性数量限制（Prettier 不控制）+ 多行每行一个（与 singleAttributePerLine 保持一致）
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: 3,
        multiline: 1,
      },
    ],
    // 保留连字符规则（语义统一，非纯格式）
    'vue/attribute-hyphenation': ['error', 'always'],
  },
};
