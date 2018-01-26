import addBacon from './addBacon';
import addMetaInfo from './addMetaInfo';
import generateRenderConfig from './generateRenderConfig';

const debug = require('debug')('umi:plugin-yunfengdie');

const isFDRender = !!process.env.FD_RENDER;

export function generateHTML(memo, opts = {}) {
  if (isFDRender) {
    const { route } = opts;
    let path = route.path.slice(1);
    if (path === '') {
      path = 'index.html';
    }
    memo = addBacon(memo, route.path.slice(1));
    memo = addMetaInfo(memo);
  }
  return memo;
}

export function buildSuccess(memo, opts = {}) {
  if (isFDRender) {
    debug('generate render config...');
    generateRenderConfig(opts);
    debug('generate render config complete');
  }
}

export function updateWebpackConfig(memo) {
  if (isFDRender) {
    memo.output.publicPath = '{{ publicPath }}';
  }
  return memo;
}
