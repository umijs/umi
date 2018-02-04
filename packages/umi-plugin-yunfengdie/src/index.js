import addBacon from './addBacon';
import addMetaInfo from './addMetaInfo';
import generateRenderConfig from './generateRenderConfig';

export default function(api) {
  if (!process.env.FD_RENDER) return;

  const { debug } = api.utils;

  api.register('modifyAFWebpackOpts', ({ memo }) => {
    memo.publicPath = '{{ publicPath }}';
    return memo;
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
