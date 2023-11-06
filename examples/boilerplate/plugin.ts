import { IApi } from 'umi';

export default (api: IApi) => {
  api.logger.profile('mark');

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
  api.onDevCompileDone((opts) => {
    opts;
    // console.log('> onDevCompileDone', opts.isFirstCompile);
  });
  api.onBuildComplete((opts) => {
    api.logger.profile('mark', 'end msg');
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

  api.addHTMLScripts({
    async fn() {
      return [`console.log('async scripts hello world')`];
    },
    stage: 100,
  });
};
