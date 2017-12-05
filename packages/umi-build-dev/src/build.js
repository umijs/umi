import { join } from 'path';
import { sync as rimraf } from 'rimraf';
import build from 'af-webpack/build';
import { resolvePlugins, applyPlugins } from 'umi-plugin';
import registerBabel from './registerBabel';
import getWebpackConfig from './getWebpackConfig';
import generateHTML from './generateHTML';
import generateEntry from './generateEntry';
import getRouteConfig from './getRouteConfig';
import send, { BUILD_DONE } from './send';
import { getConfig } from './getConfig';
import getPaths from './getPaths';

const debug = require('debug')('umi-build-dev:build');
const cwd = process.cwd();

export default function(opts = {}) {
  const {
    cwd = process.cwd(),
    babel,
    disableCSSModules,
    extraResolveModules,
    hash,
    libraryName = 'umi',
    staticDirectory = 'static',
    tmpDirectory = `.${libraryName}`,
    outputPath = './dist',
    plugins: pluginFiles,
    preact,
  } = opts;
  const plugins = resolvePlugins(pluginFiles);
  const paths = getPaths({ cwd, tmpDirectory, outputPath });

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

    debug(`清理临时文件夹 ${paths.tmpDirPath}`);
    rimraf(paths.absTmpDirPath);
    debug(`清理 outputPath ${paths.outputPath}`);
    rimraf(paths.absOutputPath);

    // 生成入口文件
    debug(`libraryName: ${libraryName}`);
    const { routeConfig } = generateEntry({
      cwd,
      plugins,
      routerTpl: opts.routerTpl,
      entryJSTpl: opts.entryJSTpl,
      libraryName,
      paths,
    });

    // 获取 webpack 配置
    const webpackConfig = getWebpackConfig({
      cwd,
      config,
      babel,
      hash,
      disableCSSModules,
      extraResolveModules,
      routeConfig,
      libraryName,
      staticDirectory,
      paths,
      preact,
    });

    // af-webpack build
    build({
      webpackConfig,
      success({ stats }) {
        debug(`删除临时文件夹 ${paths.tmpDirPath}`);
        rimraf(paths.absTmpDirPath);

        debug('打包 HTML...');
        const chunkToFilesMap = getChunkToFilesMap(stats.compilation.chunks);
        debug(`chunkToFilesMap: ${JSON.stringify(chunkToFilesMap)}`);

        const routeConfig = getRouteConfig(paths.absPagesPath);
        generateHTML({
          cwd,
          routeConfig,
          config,
          chunkToFilesMap,
          plugins,
          staticDirectory,
          libraryName,
          paths,
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
