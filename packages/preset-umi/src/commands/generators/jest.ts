import { GeneratorType } from '@umijs/core';
import { logger } from '@umijs/utils';
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
    checkEnable: () => {
      return (
        !existsSync(join(api.paths.cwd, 'jest.config.ts')) &&
        !existsSync(join(api.paths.cwd, 'jest.config.js'))
      );
    },
    disabledDescription:
      'jest has already enabled. You can remove jest.config.{ts,js}, then run this again to re-setup.',
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
      const basicDeps = {
        jest: '^27',
        '@types/jest': '^27',
        // we use `jest.config.ts` so jest needs ts and ts-node
        typescript: '^4',
        'ts-node': '^10',
      };
      const packageToInstall: Record<string, string> = res.willUseTLR
        ? {
            ...basicDeps,
            '@testing-library/react': '^13',
            '@testing-library/jest-dom': '^5.16.4',
            '@types/testing-library__jest-dom': '^5.14.5',
          }
        : basicDeps;
      h.addDevDeps(packageToInstall);
      h.addScript('test', 'jest');

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
            '!jest.config.{js,ts}',
            '!coverage/**',
            '!dist/**',
            '!config/**',
            '!mock/**',
          ];

      writeFileSync(
        join(api.cwd, 'jest.config.ts'),
        `
import { Config, configUmiAlias, createConfig } from '${importSource}/test';

export default async () => {
  return (await configUmiAlias({
    ...createConfig({
      target: 'browser',
      jsTransformer: 'esbuild',
      // config opts for esbuild , it will pass to esbuild directly
      jsTransformerOpts: { jsx: 'automatic' },
    }),
    ${res.willUseTLR ? `setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],` : ''}
    collectCoverageFrom: [
${collectCoverageFrom.map((v) => `      '${v}'`).join(',\n')}
    ],
    // if you require some es-module npm package, please uncomment below line and insert your package name
    // transformIgnorePatterns: ['node_modules/(?!.*(lodash-es|your-es-pkg-name)/)']
  })) as Config.InitialOptions;
};
`.trimLeft(),
      );
      logger.info('Write jest.config.ts');

      h.installDeps();
    },
  });
};
