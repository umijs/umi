import { expect, jest, test } from '@jest/globals';
import recommended, {
  jest as jestRules,
  typescript as typescriptRules,
} from '../eslint/rules/recommended';
import config = require('./index');

test('exports a CommonJS array scoped to source, TypeScript, and test files', () => {
  expect(require('./index')).toBe(config);
  expect(Array.isArray(config)).toBe(true);
  expect(config.map(({ name, files }) => ({ name, files }))).toEqual([
    { name: 'umi/base', files: ['**/*.{js,jsx,ts,tsx}'] },
    { name: 'umi/typescript', files: ['**/*.{ts,tsx}'] },
    {
      name: 'umi/jest',
      files: ['**/*.{test,spec,unit,e2e}.{ts,tsx,js,jsx}'],
    },
  ]);
  // Consumers own ignores, parsers, and plugin installation.
  for (const scope of config) {
    expect(Object.keys(scope).sort()).toEqual(['files', 'name', 'rules']);
  }
});

test('preserves recommended rules in their scopes while normalizing native aliases', () => {
  const [base, typescript, jest] = config.map(({ rules }) => rules);
  expect(Object.keys(base)).toHaveLength(Object.keys(recommended).length - 1);
  expect(Object.keys(typescript)).toHaveLength(
    Object.keys(typescriptRules).length,
  );
  expect(jest).toEqual(jestRules);

  for (const [name, severity] of Object.entries(recommended)) {
    const nativeName =
      name === 'no-native-reassign' ? 'no-global-assign' : name;
    expect(base[nativeName]).toEqual(severity);
    expect(typescript[nativeName]).toBeUndefined();
    expect(jest[nativeName]).toBeUndefined();
  }
  const optionOverrides = new Set([
    '@typescript-eslint/ban-types',
    '@typescript-eslint/no-this-alias',
    '@typescript-eslint/no-use-before-define',
  ]);
  for (const [name, severity] of Object.entries(typescriptRules)) {
    if (optionOverrides.has(name)) continue;
    const nativeName =
      name === '@typescript-eslint/no-invalid-this' ? 'no-invalid-this' : name;
    expect(typescript[nativeName]).toEqual(severity);
  }
  expect(base['no-native-reassign']).toBeUndefined();
  expect(typescript['@typescript-eslint/no-invalid-this']).toBeUndefined();
  expect(typescript['no-invalid-this']).toBe(2);
  expect(base['@typescript-eslint/no-unused-vars']).toBeUndefined();
  expect(typescript['@typescript-eslint/no-unused-vars']).toBe(2);
  expect(typescript['@typescript-eslint/no-namespace']).toBe(2);
  for (const name of Object.keys(jestRules)) {
    expect(base[name]).toBeUndefined();
    expect(typescript[name]).toBeUndefined();
  }
});

test('retains Umi policy where native TypeScript rule defaults differ', () => {
  const rules = config[1].rules;
  expect(rules['@typescript-eslint/ban-types']).toEqual([
    2,
    { extendDefaults: true, types: { '{}': true } },
  ]);
  expect(rules['@typescript-eslint/no-this-alias']).toEqual([
    2,
    { allowedNames: [] },
  ]);
  expect(rules['@typescript-eslint/no-use-before-define']).toEqual([
    2,
    { functions: true },
  ]);
});

test('can load without executing the ESLint setup or Babel parser', () => {
  const unexpectedLoad = jest.fn(() => {
    throw new Error('The native preset must not load ESLint runtime modules');
  });
  jest.doMock('../eslint/setup', unexpectedLoad);
  jest.doMock('@babel/eslint-parser', unexpectedLoad);
  try {
    jest.isolateModules(() => {
      expect(Array.isArray(require('./index'))).toBe(true);
    });
    expect(unexpectedLoad).not.toHaveBeenCalled();
  } finally {
    jest.dontMock('../eslint/setup');
    jest.dontMock('@babel/eslint-parser');
  }
});
