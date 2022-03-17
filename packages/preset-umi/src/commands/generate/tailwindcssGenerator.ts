import { GeneratorType } from '@umijs/core';
import { installWithNpmClient, logger } from '@umijs/utils';
import assert from 'assert';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';
import { set as setUmirc } from '../config/set';

export default (api: IApi) => {
  api.registerGenerator({
    key: 'tailwindcss',
    name: 'Enable Tailwind CSS',
    description: 'Setup Tailwind CSS configuration',
    type: GeneratorType.enable,
    checkEnable: (opts) => {
      const { api } = opts;
      return !api.config.tailwindcss;
    },
    fn: async () => {
      api.pkg.devDependencies = {
        ...api.pkg.devDependencies,
        '@umijs/plugins': '4',
        tailwindcss: 'latest',
      };
      writeFileSync(api.pkgPath, JSON.stringify(api.pkg, null, 2));
      logger.info('Write package.json');

      setUmirc(api, 'tailwindcss', {});
      setUmirc(
        api,
        'plugins',
        (api.config.plugins || []).concat('@umijs/plugins/dist/tailwindcss'),
      );
      logger.info('Update .umirc.ts');

      writeFileSync(
        join(api.cwd, 'tailwind.config.js'),
        `
module.exports = {
  content: [
    './pages/**/*.tsx',
  ],
}
`.trimLeft(),
      );
      logger.info('Write tailwind.config.js');

      writeFileSync(
        join(api.cwd, 'tailwind.css'),
        `
@tailwind base;
@tailwind components;
@tailwind utilities;
`.trimLeft(),
      );
      logger.info('Write tailwind.css');

      const npmClient = api.userConfig.npmClient;
      assert(npmClient, `npmClient is required in your config.`);
      installWithNpmClient({
        npmClient,
      });
      logger.info(`Install dependencies with ${npmClient}`);
    },
  });
};
