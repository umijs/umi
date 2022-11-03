import type { IApi } from 'umi';

export default (api: IApi) => {
  api.modifyHTML(($) => {
    return $;
  });
  api.addHTMLMetas(() => [{ name: 'foo', content: 'bar' }]);
  api.addHTMLLinks(() => [{ rel: 'foo', content: 'bar' }]);
  api.addHTMLStyles(() => [`body { color: #333; }`]);
  api.addHTMLHeadScripts(() => [`console.log('hello world from head')`]);
  api.addHTMLScripts(() => [`console.log('hello world')`]);
  api.addEntryCodeAhead(() => [`console.log('entry code ahead')`]);
  api.addEntryCode(() => [`console.log('entry code')`]);
  api.onDevCompileDone((opts) => {
    opts;
    // console.log('> onDevCompileDone', opts.isFirstCompile);
  });
  api.onBuildComplete((opts) => {
    opts;
    // console.log('> onBuildComplete', opts.isFirstCompile);
  });
  api.chainWebpack((memo) => {
    memo;
  });
  api.onStart(() => {});
  api.onCheckCode((args) => {
    args;
    // console.log('> onCheckCode', args);
  });

  api.onBeforeMiddleware(({ app }) => {
    app.get('/some/path', function (req, res) {
      res.json({ custom: 'response' });
    });
    console.log('> onBeforeMiddleware', typeof app);
  });
};
