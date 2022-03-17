import { GeneratorType } from '@umijs/core';
import { installWithNpmClient, logger } from '@umijs/utils';
import assert from 'assert';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.registerGenerator({
    key: 'tsconfig',
    name: 'Enable Typescript',
    description: 'Setup tsconfig.json',
    type: GeneratorType.enable,
    checkEnable: (opts) => {
      const { api } = opts;
      return !existsSync(join(api.paths.cwd, 'tsconfig.json'));
    },
    fn: async () => {
      api.pkg.devDependencies = {
        ...api.pkg.devDependencies,
        typescript: '^4',
      };
      writeFileSync(api.pkgPath, JSON.stringify(api.pkg, null, 2));
      logger.info('Update package.json');

      writeFileSync(
        join(api.cwd, 'tsconfig.json'),
        `
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "node",
    "importHelpers": true,
    "jsx": "react",
    "esModuleInterop": true,
    "sourceMap": true,
    "baseUrl": ".",
    "strict": true,
    "paths": {
      "@/*": ["*"],
      "@@/*": [".umi/*"]
    },
    "allowSyntheticDefaultImports": true
  }
}
`.trimLeft(),
      );
      logger.info('Write tsconfig.json');

      const npmClient = api.userConfig.npmClient;
      assert(npmClient, `npmClient is required in your config.`);
      installWithNpmClient({
        npmClient,
      });
      logger.info(`Install dependencies with ${npmClient}`);
    },
  });
};
