import rules, {
  jest as jestRules,
  typescript as tsRules,
} from './rules/recommended';
import './setup';

module.exports = {
  parser: require.resolve('@babel/eslint-parser'),
  plugins: ['react', 'react-hooks'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    browser: true,
    node: true,
    es2022: true,
    jest: true,
  },
  rules,
  overrides: [
    {
      parser: require.resolve('@typescript-eslint/parser'),
      plugins: ['@typescript-eslint/eslint-plugin'],
      files: ['**/*.{ts,tsx}'],
      rules: tsRules,
    },
    {
      settings: {
        jest: {
          version: detectJestVersion(),
        },
      },
      files: ['**/*.{test,spec,unit,e2e}.{ts,tsx,js,jsx}'],
      plugins: ['jest'],
      rules: jestRules,
    },
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    babelOptions: {
      babelrc: false,
      configFile: false,
      browserslistConfigFile: false,
      presets: [require.resolve('@umijs/babel-preset-umi')],
    },
    requireConfigFile: false,
    warnOnUnsupportedTypeScriptVersion: false,
  },
};

function detectJestVersion() {
  try {
    const pkg = require.resolve('jest/package.json', {
      paths: [process.cwd()],
    });
    return require(pkg).version;
  } catch {
    return 29;
  }
}
