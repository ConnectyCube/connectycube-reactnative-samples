module.exports = {
  'extends': [
    "plugin:react/recommended",
    'plugin:react-native/all',
    'airbnb',
  ],
  'parser': 'babel-eslint',
  'globals': {
    '__DEV__': true,
  },
  'plugins': [
    'react',
    'react-native',
    'react-hooks',
  ],
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true,
    }
  },
  'env': {
    'react-native/react-native': true,
  },
  'settings': {
    'react-native/style-sheet-object-names': [
      'EStyleSheet',
      'OtherStyleSheet',
      'PStyleSheet',
    ]
  },
  'rules': {
    'no-alert': 0,
    'react/state-in-constructor': 0,
    'react/prop-types': 0,
    'react/sort-comp': 0,
    'react/destructuring-assignment': 1,
    'react/jsx-filename-extension': 0,
    'react-native/no-unused-styles': 2,
    'react-native/no-color-literals': 0,
    'react/no-string-refs': 1,
    'react/no-did-update-set-state': 0,
    'react-native/split-platform-components': 2,
    'react-native/no-inline-styles': 0,
    'react-native/no-raw-text': 2,
    'class-methods-use-this': 0,
    'comma-dangle': [1, 'always-multiline'],
    'object-curly-newline': 0,
    'indent': [1, 2],
    'camelcase': 0,
    'no-unused-vars': 1,
    'prefer-rest-params': 1,
    'no-underscore-dangle': 0,
    'arrow-parens': 0,
    'arrow-body-style': 1,
    'padded-blocks': [2, 'never'],
    'no-console': 0,
    'no-shadow': 0,
    'global-require': 0,
    'prefer-template': 1,
    'max-len': [1, 120],
    'no-unused-expressions': 0,
    'consistent-return': 0,
    'import/prefer-default-export': 0,
    'no-use-before-define': 0,
    'no-param-reassign': 1,
    'linebreak-style': 0,
    'no-nested-ternary': 0,
    'import/no-cycle': 0,
    'implicit-arrow-linebreak': 0,
  }
}