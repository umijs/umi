import { logger } from '@umijs/utils';
import path from 'path';
import { addUnWatch } from '../../commands/dev/watch';
import { IApi, IOnGenerateFiles } from '../../types';

export default (api: IApi) => {
  api.register({
    key: 'onGenerateFiles',
    async fn({ isFirstTime }: IOnGenerateFiles) {
      if (!isFirstTime) return;
      logger.info('Prepare...');
      const entryFile = path.join(api.paths.absTmpPath, 'umi.ts');
      const { build } = await import('./build.js');
      const watch = api.name === 'dev';
      const plugins = await api.applyPlugins({
        key: 'addPrepareBuildPlugins',
        initialValue: [],
      });
      const buildResult = await build({
        entryPoints: [entryFile],
        watch: watch && {
          onRebuildSuccess({ result }) {
            api.applyPlugins({
              key: 'onPrepareBuildSuccess',
              args: {
                isWatch: true,
                result,
              },
            });
          },
        },
        config: {
          alias: api.config.alias,
        },
        plugins,
      });
      if (watch) {
        addUnWatch(() => {
          buildResult.stop?.();
        });
      }
      await api.applyPlugins({
        key: 'onPrepareBuildSuccess',
        args: {},
      });
    },
    stage: Infinity,
  });
};
