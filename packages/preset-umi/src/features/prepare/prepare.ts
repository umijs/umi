import type { BuildResult } from '@umijs/bundler-utils/compiled/esbuild';
import { aliasUtils, lodash, logger } from '@umijs/utils';
import path from 'path';
import { addUnWatch } from '../../commands/dev/watch';
import { IApi, IOnGenerateFiles } from '../../types';

export default (api: IApi) => {
  function updateAppdata(_buildResult: BuildResult) {
    const buildResult: BuildResult = lodash.cloneDeep(_buildResult);
    (buildResult.outputFiles || []).forEach((file) => {
      // @ts-ignore
      delete file?.contents;
    });
    api.appData.prepare = {
      buildResult,
    };
  }

  api.register({
    key: 'onGenerateFiles',
    async fn({ isFirstTime }: IOnGenerateFiles) {
      // do not support vue
      if (api.appData.framework === 'vue') {
        return;
      }
      if (!isFirstTime) return;
      logger.info('Preparing...');
      const entryFile = path.join(api.paths.absTmpPath, 'umi.ts');
      const { build } = await import('./build.js');
      const watch = api.name === 'dev';
      const plugins = await api.applyPlugins({
        key: 'addPrepareBuildPlugins',
        initialValue: [],
      });
      const unwrappedAlias = aliasUtils.parseCircleAlias({
        alias: api.config.alias,
      });
      const buildResult = await build({
        entryPoints: [entryFile],
        watch: watch && {
          onRebuildSuccess({ result }) {
            updateAppdata(result);
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
          alias: unwrappedAlias,
          cwd: api.paths.cwd,
        },
        plugins,
      });
      if (watch) {
        addUnWatch(() => {
          buildResult.stop?.();
        });
      }
      updateAppdata(buildResult);
      await api.applyPlugins({
        key: 'onPrepareBuildSuccess',
        args: {
          result: buildResult,
        },
      });
    },
    stage: Infinity,
  });
};
