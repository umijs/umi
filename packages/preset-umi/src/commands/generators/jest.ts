import { GeneratorType } from '@umijs/core';
import { logger, semver } from '@umijs/utils';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';
import { GeneratorHelper, promptsExitWhenCancel } from './utils';

export default (api: IApi) => {
  api.describe({
    key: 'generator:jest',
  });

  api.registerGenerator({
    key: 'jest',
    name: 'Enable Jest',
    description: 'Setup Jest Configuration',
    type: GeneratorType.enable,
    checkEnable: () =>
      ['js', 'ts', 'cjs'].every(
        (ext) => !existsSync(join(api.paths.cwd, `jest.config.${ext}`)),
      ),
    disabledDescription:
      'Jest configuration already exists. Remove the existing config to run this generator again.',
    fn: async () => {
      const h = new GeneratorHelper(api);

      const res = await promptsExitWhenCancel({
        type: 'confirm',
        name: 'willUseTLR',
        message: 'Will you use @testing-library/react for UI testing?!',
        initial: true,
      });

      const hasSrc = api.paths.absSrcPath.endsWith('src');

      const importSource = api.appData.umi.importSource;
      const jestMajorVersion = `^${getJestVersion()}`;
      const basicDeps = {
        jest: jestMajorVersion,
        '@types/jest': jestMajorVersion,
        // The generated config uses the browser target with or without RTL.
        'jest-environment-jsdom': jestMajorVersion,
      };
      const reactTestingDeps = {
        // RTL
        '@testing-library/jest-dom': '^5',
        '@testing-library/react': '^14',
      };
      const packageToInstall: Record<string, string> = res.willUseTLR
        ? {
            ...basicDeps,
            ...reactTestingDeps,
            '@types/testing-library__jest-dom': '^5.14.5',
          }
        : basicDeps;
      h.addDevDeps(packageToInstall);
      h.addScript('test', 'jest --passWithNoTests');

      const setupImports = res.willUseTLR
        ? [
            `import '@testing-library/jest-dom';`,
            `import '${api.appData.umi.importSource}/test-setup'`,
          ]
        : [`import '${api.appData.umi.importSource}/test-setup'`];

      writeFileSync(join(api.cwd, 'jest-setup.ts'), setupImports.join('\n'));
      logger.info('Write jest-setup.ts');

      const collectCoverageFrom = hasSrc
        ? [
            'src/**/*.{ts,js,tsx,jsx}',
            '!src/.umi/**',
            '!src/.umi-test/**',
            '!src/.umi-production/**',
          ]
        : [
            '**/*.{ts,tsx,js,jsx}',
            '!.umi/**',
            '!.umi-test/**',
            '!.umi-production/**',
            '!.umirc.{js,ts}',
            '!.umirc.*.{js,ts}',
            '!jest.config.{js,ts,cjs}',
            '!coverage/**',
            '!dist/**',
            '!config/**',
            '!mock/**',
          ];

      writeFileSync(
        join(api.cwd, 'jest.config.cjs'),
        `
const { configUmiAlias, createConfig } = require('${importSource}/test');

module.exports = () => configUmiAlias({
  ...createConfig({
    target: 'browser',
    jsTransformer: 'esbuild',
    jsTransformerOpts: { jsx: 'automatic' },
  }),
  ${res.willUseTLR ? "setupFilesAfterEnv: ['<rootDir>/jest-setup.ts']," : ''}
  collectCoverageFrom: [
${collectCoverageFrom.map((v) => `    '${v}'`).join(',\n')}
  ],
  // Uncomment to transform an ES module dependency:
  // transformIgnorePatterns: ['node_modules/(?!.*(lodash-es|your-es-pkg-name)/)'],
});
`.trimStart(),
      );
      logger.info('Write jest.config.cjs');

      h.installDeps();
    },
  });
};

function getJestVersion() {
  try {
    const umiPkg = require.resolve('umi/package.json', {
      paths: [process.cwd()],
    });
    const testPkg = require.resolve('@umijs/test/package.json', {
      paths: [umiPkg],
    });
    const version: string = require(testPkg).devDependencies.jest;
    return semver.minVersion(version)!.version.split('.')[0];
  } catch {
    return 29;
  }
}
