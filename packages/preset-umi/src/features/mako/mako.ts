import path from 'path';
import { IApi } from '../../types';
import { chalk } from '@umijs/utils';

export default (api: IApi) => {
  api.describe({
    key: 'mako',
    config: {
      schema({ zod }) {
        return zod.object({});
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.modifyConfig((memo) => {
    return {
      ...memo,
      mfsu: false,
      hmrGuardian: false,
    };
  });

  api.onStart(() => {
    process.env.OKAM = process.env.OKAM || require.resolve('@umijs/bundler-mako');
    try {
      const pkg = require(path.join(
        require.resolve(process.env.OKAM),
        '../package.json',
      ));
      api.logger.info(`Using mako@${pkg.version}`);
      const isBigfish = process.env.BIGFISH_INFO;
      if (!isBigfish) {
        api.logger.warn(chalk.yellow(chalk.bold(`Mako is an extremely fast, production-grade web bundler based on Rust. And it's still under active development and is not yet ready for production use. If you encounter any issues, please checkout https://makojs.dev/ to join the community and report the issue.`)));
      }
    } catch (e) {
      console.error(e);
    }
  });
};
