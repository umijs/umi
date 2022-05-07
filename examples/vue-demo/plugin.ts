import { IApi } from 'umi';
import { createStyleImportPlugin, VantResolve } from 'vite-plugin-style-import';

export default (api: IApi) => {
  api.modifyHTML(($) => {
    return $;
  });
  api.addHTMLMetas(() => [{ name: 'foo', content: 'bar' }]);
  api.addHTMLLinks(() => [{ rel: 'foo', content: 'bar' }]);
  api.addHTMLStyles(() => [`body { color: red; }`]);
  api.addHTMLHeadScripts(() => [`console.log('hello world from head')`]);
  api.addHTMLScripts(() => [`console.log('hello world')`]);
  api.addEntryCodeAhead(() => [`console.log('entry code ahead')`]);
  api.addEntryCode(() => [`console.log('entry code')`]);
  api.chainWebpack((memo) => {
    memo;
  });

  api.modifyViteConfig((config) => {
    config.plugins?.push(
      createStyleImportPlugin({
        resolves: [VantResolve()],
      }),
    );
    return config;
  });

  // babel-plugin-import
  api.addExtraBabelPlugins(() => {
    return !api.appData.vite
      ? [
          [
            require.resolve('babel-plugin-import'),
            {
              libraryName: 'vant',
              libraryDirectory: 'es',
              style: true,
            },
          ],
        ]
      : [];
  });
};
