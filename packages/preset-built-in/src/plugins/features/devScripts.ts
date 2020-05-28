import { IApi } from '@umijs/types';
import { readFileSync } from 'fs';

export default (api: IApi) => {
  api.describe({
    key: 'devScripts',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
    enableBy() {
      return api.env === 'development';
    },
  });

  api.addBeforeMiddewares(() => {
    return (req, res, next) => {
      if (req.path.includes('@@/devScripts.js')) {
        api
          .applyPlugins({
            key: 'addDevScripts',
            type: api.ApplyPluginsType.add,
            initialValue:
              process.env.HMR !== 'none'
                ? [
                    readFileSync(
                      require.resolve(
                        '@umijs/bundler-webpack/bundled/webpackHotDevClient',
                      ),
                      'utf-8',
                    ),
                  ]
                : [],
          })
          .then((scripts) => {
            res.end(scripts.join('\r\n\r\n'));
          });
      } else {
        next();
      }
    };
  });

  api.addHTMLHeadScripts(() => [
    {
      src: `${api.config.publicPath}@@/devScripts.js`,
    },
  ]);

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: './core/devScripts.ts',
      content:
        process.env.HMR !== 'none'
          ? `
if (window.g_initWebpackHotDevClient) {
  window.g_initWebpackHotDevClient({
    tryApplyUpdates(onHotUpdateSuccess?: Function) {
      // @ts-ignore
      if (!module.hot) {
        window.location.reload();
        return;
      }

      function isUpdateAvailable() {
        // @ts-ignore
        return window.g_getMostRecentCompilationHash() !== __webpack_hash__;
      }

      // TODO: is update available?
      // @ts-ignore
      if (!isUpdateAvailable() || module.hot.status() !== 'idle') {
        return;
      }

      function handleApplyUpdates(err: Error | null, updatedModules: any) {
        if (err || !updatedModules || window.g_getHadRuntimeError()) {
          window.location.reload();
          return;
        }

        onHotUpdateSuccess?.();

        if (isUpdateAvailable()) {
          // While we were updating, there was a new update! Do it again.
          tryApplyUpdates();
        }
      }

      // @ts-ignore
      module.hot.check(true).then(
        function (updatedModules: any) {
          handleApplyUpdates(null, updatedModules);
        },
        function (err: Error) {
          handleApplyUpdates(err, null);
        },
      );
    }
  });
}
      `
          : '',
    });
  });

  api.addEntryImportsAhead(() => [{ source: '@@/core/devScripts' }]);
};
