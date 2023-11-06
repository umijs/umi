import { chalk } from '@umijs/utils';
import type { IApi } from '../../types';

// https://babeljs.io/blog/2023/05/26/7.22.0#renamed-packages
const DEPRECATED_DEPS: string[] = [
  'unicode-sets-regex',
  'class-static-block',
  'private-property-in-object',
  'class-properties',
  'private-methods',
  'numeric-separator',
  'logical-assignment-operators',
  'nullish-coalescing-operator',
  'optional-chaining',
  'export-namespace-from',
  'json-strings',
  'optional-catch-binding',
  'async-generator-functions',
  'object-rest-spread',
  'unicode-property-regex',
];
const BABEL_PROPOSAL_PREFIX = '@babel/plugin-proposal-';
const BABEL_TRANSFORM_PREFIX = '@babel/plugin-transform-';

export default (api: IApi) => {
  api.onCheck(() => {
    const pkg = api.pkg;
    const breakingDeps = DEPRECATED_DEPS.map(
      (i) => `${BABEL_PROPOSAL_PREFIX}${i}`,
    );
    const deps = Object.keys({
      ...(pkg?.dependencies || {}),
      ...(pkg?.devDependencies || {}),
    });
    const willBreakingDeps = deps.filter((i) => breakingDeps.includes(i));
    if (willBreakingDeps.length) {
      const tips = [
        ...willBreakingDeps.map((dep) => {
          const oldName = chalk.yellow(dep);
          const newName = chalk.green(
            `${BABEL_TRANSFORM_PREFIX}${dep.replace(
              BABEL_PROPOSAL_PREFIX,
              '',
            )}`,
          );
          return ` - ${oldName} -> ${newName}`;
        }),
      ];
      console.log(`
  ${chalk.bold.yellow('Babel Deprecation Warning')}

  Babel >= 7.22.0 will remove the following plugins:
  ${tips.join('\n')}
  Please use the ${chalk.bold.green(
    BABEL_TRANSFORM_PREFIX,
  )} prefix instead of ${chalk.bold.yellow(
        BABEL_PROPOSAL_PREFIX,
      )} prefix and ${chalk.blue('update your dependencies and config file')}.
  Refer: https://babeljs.io/blog/2023/05/26/7.22.0#renamed-packages
`);
    }
  });
};
