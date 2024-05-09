import path from 'path';
import { IApi } from '../../types';

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
    if (!process.env.OKAM) {
      process.env.OKAM = require.resolve('@umijs/bundler-mako');
    }
    try {
      const pkg = require(path.join(
        require.resolve(process.env.OKAM),
        '../package.json',
      ));
      api.logger.info(`Using mako@${pkg.version}`);
    } catch (e) {
      console.error(e);
    }
  });
};
