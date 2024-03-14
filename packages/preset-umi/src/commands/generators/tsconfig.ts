import { GeneratorType } from '@umijs/core';
import { logger, semver } from '@umijs/utils';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';
import { GeneratorHelper } from './utils';

export default (api: IApi) => {
  api.describe({
    key: 'generator:tsconfig',
  });

  api.registerGenerator({
    key: 'tsconfig',
    name: 'Enable Typescript',
    description: 'Setup tsconfig.json',
    type: GeneratorType.enable,
    checkEnable: () => {
      return !existsSync(join(api.paths.cwd, 'tsconfig.json'));
    },
    disabledDescription:
      'tsconfig has been enabled; you can remove tsconfig.json then run this again to re-setup',
    fn: async () => {
      const h = new GeneratorHelper(api);

      const reactVersion = api.appData.react.version;
      const reactDomVersion = api.appData['react-dom'].version;
      if (semver.neq(reactVersion, reactDomVersion)) {
        logger.warn(
          `The react version ${reactVersion} is not equal to the react-dom version ${reactDomVersion}, please check.`,
        );
      }

      const reactMajorVersion = parseInt(reactVersion.split('.')[0], 10) || 18;
      h.addDevDeps({
        typescript: '^5',
        '@types/react': `^${reactMajorVersion}`,
        '@types/react-dom': `^${reactMajorVersion}`,
      });

      writeFileSync(
        join(api.cwd, 'tsconfig.json'),
        `
{
  "extends": "./${api.appData.hasSrcDir ? 'src/' : ''}.umi/tsconfig.json"
}
`.trimStart(),
      );
      logger.info('Write tsconfig.json');

      const importSource = api.appData.umi.importSource;
      writeFileSync(
        join(api.cwd, 'typings.d.ts'),
        `import '${importSource}/typings';`.trimStart(),
      );
      logger.info('Write typings.d.ts');

      h.installDeps();
    },
  });
};
