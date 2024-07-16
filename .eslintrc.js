module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    node: true
  },
  plugins: ['@typescript-eslint', 'react', 'unused-imports'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react/recommended'],
  rules: {
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
    'react/react-in-jsx-scope': 'off',
    'unused-imports/no-unused-imports': 'error',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  }
};
