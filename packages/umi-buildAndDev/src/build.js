import { join } from 'path';
import { sync as rimraf } from 'rimraf';
import build from 'af-webpack/build';
import registerBabel from './registerBabel';
import { KOI_DIRECTORY, PAGES_PATH } from './constants';
import getWebpackConfig from './getWebpackConfig';
import generateHTML from './generateHTML';
import generateEntry from './generateEntry';
import getRouteConfig from './getRouteConfig';
import generateRenderConfig from './generateRenderConfig';
import send, { BUILD_DONE } from './send';
import { getConfig } from './getConfig';

const debug = require('debug')('umi-buildAndDev:build');

const cwd = process.cwd();
const entryPath = join(cwd, PAGES_PATH, KOI_DIRECTORY);

export default function(opts = {}) {
  const {
    cwd = process.cwd(),
    babel,
    enableCSSModules,
    extraResolveModules,
    hash,
  } = opts;

  function getChunkToFilesMap(chunks) {
    return chunks.reduce((memo, chunk) => {
      memo[chunk.name] = chunk.files;
      return memo;
    }, {});
  }

  return new Promise(resolve => {
    // 为配置注册 babel 解析
    registerBabel(babel, {
      configOnly: true,
    });

    // 获取用户配置
    const { config } = getConfig(cwd);

    debug(`清理临时文件夹 ${entryPath.replace(`${cwd}/`, '')}`);
    rimraf(entryPath);

    // 生成入口文件
    const { routeConfig } = generateEntry(cwd);

    // 获取 webpack 配置
    const webpackConfig = getWebpackConfig({
      cwd,
      config,
      babel,
      hash,
      enableCSSModules,
      extraResolveModules,
      routeConfig,
    });

    // af-webpack build
    build({
      webpackConfig,
      success({ stats }) {
        debug('打包 HTML...');
        let chunkToFilesMap = null;
        if (hash) {
          chunkToFilesMap = getChunkToFilesMap(stats.compilation.chunks);
          debug(`chunkToFilesMap: ${JSON.stringify(chunkToFilesMap)}`);
        }
        const routeConfig = getRouteConfig(join(cwd, PAGES_PATH));
        generateHTML(routeConfig, {
          cwd,
          config,
          chunkToFilesMap,
        });
        debug('打包 HTML 完成...');

        if (process.env.KOI_RENDER === 'true') {
          debug('生成 RenderConfig...');
          generateRenderConfig(routeConfig, {
            cwd,
          });
          debug('生成 RenderConfig 完成...');
        }
        send({ type: BUILD_DONE });
        resolve();
      },
    });
  });
}
