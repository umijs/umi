import type { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    enableBy() {
      return !!api.args.vite;
    },
  });

  // scan deps into api.appData by default for vite mode
  api.register({
    key: 'onBeforeCompiler',
    stage: Number.POSITIVE_INFINITY,
    async fn() {
      await api.applyPlugins({
        key: 'updateAppDataDeps',
        type: api.ApplyPluginsType.event,
      });
    },
  });

  // include extra monorepo package deps for vite pre-bundle
  api.modifyViteConfig((memo) => {
    memo.optimizeDeps = {
      ...(memo.optimizeDeps || {}),
      include: memo.optimizeDeps?.include?.concat(
        Object.values(api.appData.deps!)
          .map(({ matches }) => matches[0])
          .filter(
            (item) =>
              item?.startsWith('@fs') && !item?.includes('node_modules'),
          ),
      ),
    };

    return memo;
  });
};
