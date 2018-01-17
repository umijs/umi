import { resolve } from 'path';
import addBacon from './addBacon';
import addMetaInfo from './addMetaInfo';
import generateRenderConfig from './generateRenderConfig';

const debug = require('debug')('umi:plugin-yunfengdie');

const isFDRender = !!process.env.FD_RENDER;

export function getConfigScript(memo, opts = {}) {
  const { entry } = opts;
  if (isFDRender) {
    memo = `
<script>
  window.routerBase = location.pathname.split('/').slice(0, -${
    entry.split('/').length
  }).concat('').join('/');
  window.resourceBaseUrl = '{{ publicPath }}';
</script>
  `;
  }

  return memo;
}

export function generateHTML(memo, opts = {}) {
  const { route } = opts;

  if (isFDRender) {
    memo = addBacon(memo, route.slice(1));
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
    return memo;
  }
}
