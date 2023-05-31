import { IApi } from '../../types';
import { defaultRenameVisitor } from './babelPlugin';

export default function (api: IApi) {
  api.describe({
    key: 'hmrGuardian',
    config: {
      schema: ({ zod }) => zod.boolean(),
    },
    enableBy: ({ env }) => {
      if (
        env === 'production' ||
        process.env.HMR === 'none' ||
        process.env.IS_UMI_BUILD_WORKER
      ) {
        return false;
      }

      return api.config.hmrGuardian;
    },
  });

  api.onCheckConfig(({ userConfig }) => {
    userConfig.headScripts?.some((script: string | { src?: string }) => {
      const url = typeof script === 'string' ? script : script.src;

      if (url?.includes('react.production')) {
        api.logger.warn(
          'Using react/react-dom production scripts, HMR will not work.',
        );
        api.logger.warn(
          'Use ternary expression to use development scripts in dev environment',
        );
      }
    });
  });

  api.addBeforeBabelPlugins(() => {
    return [defaultRenameVisitor()];
  });
}
