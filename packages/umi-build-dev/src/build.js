import { join } from 'path';
import { existsSync, renameSync } from 'fs';
import { sync as rimraf } from 'rimraf';
import build from 'af-webpack/build';
import { applyPlugins } from 'umi-plugin';
import { registerBabelForConfig } from './registerBabel';
import getWebpackConfig from './getWebpackConfig';
import generateHTML from './generateHTML';
import generateEntry from './generateEntry';
import getRouteConfig from './getRouteConfig';
import send, { BUILD_DONE } from './send';
import { getConfig } from './getConfig';
import getWebpackRCConfig from 'af-webpack/getUserConfig';
import getPaths from './getPaths';
import getPlugins from './getPlugins';

const debug = require('debug')('umi-build-dev:build');

export default function(opts = {}) {
  const {
    cwd = process.cwd(),
    babel,
    extraResolveModules,
    hash,
    libraryName = 'umi',
    staticDirectory = 'static',
    tmpDirectory = `.${libraryName}`,
    outputPath = './dist',
    plugins: pluginsFromOpts,
    preact,
  } = opts;
  const paths = getPaths({ cwd, tmpDirectory, outputPath });

  function getChunkToFilesMap(chunks) {
    return chunks.reduce((memo, chunk) => {
      memo[chunk.name] = chunk.files;
      return memo;
    }, {});
  }

  return new Promise(resolve => {
    // 为配置注册 babel 解析
    registerBabelForConfig(babel, {
      paths,
    });

    // 获取 .webpackrc 配置
    const { config: webpackRCConfig } = getWebpackRCConfig({
      cwd,
      disabledConfigs: ['entry', 'outputPath', 'hash'],
    });

    // 获取用户配置
    const { config } = getConfig(cwd);
    const plugins = getPlugins({
      configPlugins: config.plugins,
      pluginsFromOpts,
      cwd,
      babel,
    });

    debug(`清理临时文件夹 ${paths.tmpDirPath}`);
    rimraf(paths.absTmpDirPath);
    debug(`清理 outputPath ${paths.outputPath}`);
    rimraf(paths.absOutputPath);

    // 生成入口文件
    debug(`libraryName: ${libraryName}`);
    const { routeConfig } = generateEntry({
      cwd,
      config,
      plugins,
      routerTpl: opts.routerTpl,
      entryJSTpl: opts.entryJSTpl,
      libraryName,
      paths,
    });

    // 获取 webpack 配置
    const webpackConfig = getWebpackConfig({
      cwd,
      plugins,
      config,
      webpackRCConfig,
      babel,
      hash,
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
        if (!process.env.DISABLE_RM_TMPDIR) {
          debug(`删除临时文件夹 ${paths.tmpDirPath}`);
          rimraf(paths.absTmpDirPath);
        }

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
          webpackConfig,
        });
        debug('打包 HTML 完成...');

        debug('移动 service-worker.js 和 asset-manifest.json...');
        if (
          existsSync(
            join(paths.absOutputPath, staticDirectory, 'service-worker.js'),
          )
        ) {
          renameSync(
            join(paths.absOutputPath, staticDirectory, 'service-worker.js'),
            join(paths.absOutputPath, 'service-worker.js'),
          );
        }
        debug('移动 service-worker.js 和 asset-manifest.json 完成...');

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
