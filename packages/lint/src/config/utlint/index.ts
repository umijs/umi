import recommended, {
  jest as jestRules,
  typescript as typescriptRules,
} from '../eslint/rules/recommended';

type RuleConfig = 0 | 1 | 2 | [0 | 1 | 2, ...unknown[]];

type FlatConfig = {
  name: string;
  files: string[];
  rules: Record<string, RuleConfig>;
};

const aliases: Record<string, string> = {
  'no-native-reassign': 'no-global-assign',
  '@typescript-eslint/no-invalid-this': 'no-invalid-this',
};

function nativeRules(source: Record<string, number>) {
  const rules: FlatConfig['rules'] = {};
  for (const [name, severity] of Object.entries(source)) {
    if (severity !== 0 && severity !== 1 && severity !== 2) {
      throw new TypeError(`Invalid severity for ${name}: ${severity}`);
    }
    rules[aliases[name] || name] = severity;
  }
  return rules;
}

const config: FlatConfig[] = [
  {
    name: 'umi/base',
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: nativeRules(recommended),
  },
  {
    name: 'umi/typescript',
    files: ['**/*.{ts,tsx}'],
    rules: {
      ...nativeRules(typescriptRules),
      // Preserve Umi's policy where native rule defaults differ from ESLint.
      '@typescript-eslint/ban-types': [
        2,
        { extendDefaults: true, types: { '{}': true } },
      ],
      '@typescript-eslint/no-this-alias': [2, { allowedNames: [] }],
      '@typescript-eslint/no-use-before-define': [2, { functions: true }],
    },
  },
  {
    name: 'umi/jest',
    files: ['**/*.{test,spec,unit,e2e}.{ts,tsx,js,jsx}'],
    rules: nativeRules(jestRules),
  },
];

export = config;
