import addBacon from './addBacon';
import addMetaInfo from './addMetaInfo';
import generateRenderConfig from './generateRenderConfig';

export default function(api) {
  if (!process.env.FD_RENDER) return;

  const { debug } = api.utils;
  const { config } = api.service;

  if (!config.exportStatic || !config.exportStatic.htmlSuffix) {
    api.register('onStart', () => {
      throw new Error(
        `
云凤蝶发布的项目，请在 .umirc.js 里配置：

"exportStatic": {
  "htmlSuffix": true
}
        `.trim(),
      );
    });
  }

  if (!config.disableServiceWorker) {
    api.register('onStart', () => {
      throw new Error(
        `
云凤蝶暂不支持 ServiceWorker，请在 .umirc.js 里配置：

"disableServiceWorker": true
        `.trim(),
      );
    });
  }

  api.register('modifyAFWebpackOpts', ({ memo }) => {
    // publicPath for CSS
    memo.publicPath = './';
    return memo;
  });

  api.register('beforeGenerateHTML', () => {
    // publicPath for JS
    api.service.webpackConfig.output.publicPath = '{{ publicPath }}';
  });

  api.register('modifyHTML', ({ memo, args }) => {
    const { route } = args;
    let path = route.path.slice(1);
    if (path === '') {
      path = 'index.html';
    }
    memo = addBacon(memo, path);
    memo = addMetaInfo(memo);
    return memo;
  });

  api.register('buildSuccess', () => {
    debug('generate render config...');
    generateRenderConfig(api.service);
    debug('generate render config complete');
  });
}
