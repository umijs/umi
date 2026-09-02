import type { ConfigObject, RuleConfig } from '@utoo/lint';
import { Linter } from '@utoo/lint';
import rules, {
  jestRules,
  typescript as typescriptRules,
} from '../eslint/rules/recommended';

type Rules = Record<string, RuleConfig>;

const RULE_ALIASES: Record<string, string> = {
  '@typescript-eslint/no-invalid-this': 'no-invalid-this',
  'no-native-reassign': 'no-global-assign',
};

function getSupportedRules(rules: Rules, supportedRules: Set<string>): Rules {
  return Object.fromEntries(
    Object.entries(rules).flatMap(([rule, value]) => {
      const resolvedRule = RULE_ALIASES[rule] || rule;
      return supportedRules.has(resolvedRule) ? [[resolvedRule, value]] : [];
    }),
  );
}

export function getUtooLintConfig(): ConfigObject[] {
  const supportedRules = new Set(new Linter().getRules().keys());

  return [
    {
      name: 'umi/recommended',
      rules: getSupportedRules(rules as Rules, supportedRules),
    },
    {
      name: 'umi/typescript',
      files: ['**/*.{ts,tsx}'],
      rules: getSupportedRules(typescriptRules as Rules, supportedRules),
    },
    {
      name: 'umi/jest',
      files: ['**/*.{test,spec,unit,e2e}.{js,jsx,ts,tsx}'],
      rules: getSupportedRules(jestRules as Rules, supportedRules),
    },
  ];
}
