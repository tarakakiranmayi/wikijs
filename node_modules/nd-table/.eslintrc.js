
module.exports = exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ['google'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  plugins: ['import'],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      plugins: ['@typescript-eslint', 'unicorn'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['./tsconfig.json']
      },
      rules: {
        '@typescript-eslint/explicit-function-return-type': ['error'],
        '@typescript-eslint/indent': ['error', 2],
        '@typescript-eslint/no-restricted-imports': [
          'error',
          { patterns: ['!./*', '!../*'] }
        ],
        '@typescript-eslint/no-unused-vars': ['error'],
        'indent': 'off',
        'no-restricted-imports': 'off',
        'no-unused-vars': 'off',
        'unicorn/filename-case': [
          'error',
          {
            case: 'kebabCase'
          }
        ],
        'valid-jsdoc': 0,
        'require-jsdoc': 0
      }
    }
  ],
  rules: {
    'comma-dangle': ['error', 'never'],
    'eqeqeq': ['error', 'smart'],
    'import/order': [
      'error',
      {
        'alphabetize': {
          caseInsensitive: false,
          order: 'asc'
        },
        'groups': ['external', 'builtin', 'parent', ['sibling', 'index']],
        'newlines-between': 'never',
        'pathGroups': [
          {
            group: 'external',
            pattern: 'react',
            position: 'before'
          }
        ],
        'pathGroupsExcludedImportTypes': ['builtin']
      }
    ],
    'max-len': ['error', { code: 140 }],
    'object-curly-spacing': ['error', 'always'],
    'valid-jsdoc': [
      'error',
      { requireParamType: true, requireReturn: false, requireReturnType: true }
    ]
  }
};
