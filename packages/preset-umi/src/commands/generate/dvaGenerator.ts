import { GeneratorType } from '@umijs/core';
import { installWithNpmClient, logger } from '@umijs/utils';
import assert from 'assert';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';
import { set as setUmirc } from '../config/set';

export default (api: IApi) => {
  api.registerGenerator({
    key: 'dva',
    name: 'Enable Dva',
    description: 'Setup Dva configuration',
    type: GeneratorType.enable,
    checkEnable: (opts) => {
      const { api } = opts;
      return !api.config.dva;
    },
    fn: async ({ generateFile }) => {
      api.pkg.devDependencies = {
        ...api.pkg.devDependencies,
        '@umijs/plugins': '4',
        tailwindcss: 'latest',
      };
      writeFileSync(api.pkgPath, JSON.stringify(api.pkg, null, 2));
      logger.info('Write package.json');

      setUmirc(api, 'dva', {});
      setUmirc(
        api,
        'plugins',
        (api.config.plugins || []).concat('@umijs/plugins/dist/dva'),
      );
      logger.info('Update .umirc.ts');

      await generateFile({
        path: join(__dirname, '../../../templates/generate/dva'),
        target: api.cwd,
      });
      logger.info('Write models');

      const npmClient = api.userConfig.npmClient;
      assert(npmClient, `npmClient is required in your config.`);
      installWithNpmClient({
        npmClient,
      });
      logger.info(`Install dependencies with ${npmClient}`);
    },
  });
};
