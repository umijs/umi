import { join } from 'path';
import { sync as rimraf } from 'rimraf';
import build from 'af-webpack/build';
import { resolvePlugins, applyPlugins } from 'umi-plugin';
import registerBabel from './registerBabel';
import { KOI_DIRECTORY, PAGES_PATH } from './constants';
import getWebpackConfig from './getWebpackConfig';
import generateHTML from './generateHTML';
import generateEntry from './generateEntry';
import getRouteConfig from './getRouteConfig';
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
    libraryName = 'umi',
    staticDirectory = 'static',
    plugins: pluginFiles,
  } = opts;
  const plugins = resolvePlugins(pluginFiles);

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
    debug(`libraryName: ${libraryName}`);
    const { routeConfig } = generateEntry({
      cwd,
      plugins,
      routerTpl: opts.routerTpl,
      entryJSTpl: opts.entryJSTpl,
      libraryName,
    });

    // 获取 webpack 配置
    const webpackConfig = getWebpackConfig({
      cwd,
      config,
      babel,
      hash,
      enableCSSModules,
      extraResolveModules,
      routeConfig,
      libraryName,
      staticDirectory,
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
        generateHTML({
          cwd,
          routeConfig,
          config,
          chunkToFilesMap,
          plugins,
          staticDirectory,
          libraryName,
        });
        debug('打包 HTML 完成...');

        applyPlugins(plugins, 'buildSuccess', null, {
          routeConfig,
          cwd,
        });
        send({ type: BUILD_DONE });
        resolve();
      },
    });
  });
}
