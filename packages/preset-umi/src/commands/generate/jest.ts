import { GeneratorType } from '@umijs/core';
import { installWithNpmClient, logger, prompts } from '@umijs/utils';
import assert from 'assert';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.registerGenerator({
    key: 'jest',
    name: 'Enable Jest',
    description: 'Setup Jest Configuration',
    type: GeneratorType.enable,
    checkEnable: (opts) => {
      const { api } = opts;

      return (
        !existsSync(join(api.paths.cwd, 'jest.config.ts')) &&
        !existsSync(join(api.paths.cwd, 'jest.config.js'))
      );
    },
    fn: async () => {
      const res = await prompts({
        type: 'confirm',
        name: 'willUseTLR',
        message: 'Will you use @testing-library/react for UI testing?!',
        initial: true,
      });

      const packageToInstall: Record<string, string> = res.willUseTLR
        ? {
            jest: 'latest',
            '@types/jest': 'latest',
            'ts-node': '*',
            '@testing-library/react': 'latest',
          }
        : {
            jest: 'latest',
            '@types/jest': 'latest',
            'ts-node': '*',
          };

      api.pkg.devDependencies = {
        ...api.pkg.devDependencies,
        ...packageToInstall,
      };
      writeFileSync(api.pkgPath, JSON.stringify(api.pkg, null, 2));
      logger.info('Update package.json');

      writeFileSync(
        join(api.cwd, 'jest.config.ts'),
        `
import { Config, configUmiAlias, createConfig } from 'umi/test';

export default async () => {
  return (await configUmiAlias({
    ...createConfig({
      target: 'browser',
    }),
  })) as Config.InitialOptions;
};
`.trimLeft(),
      );
      logger.info('Write jest.config.ts');

      const npmClient = api.userConfig.npmClient;
      assert(npmClient, `npmClient is required in your config.`);
      installWithNpmClient({
        npmClient,
      });
      logger.info(`Install dependencies with ${npmClient}`);
    },
  });
};
