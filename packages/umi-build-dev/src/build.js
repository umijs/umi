import { join } from 'path';
import { sync as rimraf } from 'rimraf';
import build from 'af-webpack/build';
import { resolvePlugins, applyPlugins } from 'umi-plugin';
import registerBabel, { registerBabelForConfig } from './registerBabel';
import getWebpackConfig from './getWebpackConfig';
import generateHTML from './generateHTML';
import generateEntry from './generateEntry';
import getRouteConfig from './getRouteConfig';
import send, { BUILD_DONE } from './send';
import { getConfig } from './getConfig';
import getWebpackRCConfig from 'af-webpack/getUserConfig';
import getPaths from './getPaths';
import resolvePlugin from './resolvePlugin';

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
    registerBabelForConfig(babel);

    // 获取 .webpackrc 配置
    const { config: webpackRCConfig } = getWebpackRCConfig({
      cwd,
      disabledConfigs: ['entry', 'outputPath', 'hash'],
    });

    // 获取用户配置
    const { config } = getConfig(cwd);
    const configPlugins = (config.plugins || []).map(p => {
      return resolvePlugin(p, { cwd });
    });
    if (configPlugins.length) {
      registerBabel(babel, {
        only: [new RegExp(`(${configPlugins.join('|')})`)],
      });
    }
    const plugins = resolvePlugins([
      ...configPlugins,
      ...(pluginsFromOpts || []),
    ]);

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
