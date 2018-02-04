import { sync as rimraf } from 'rimraf';
import { existsSync, renameSync } from 'fs';
import { join } from 'path';
import getWebpackRCConfig, {
  watchConfigs as watchWebpackRCConfig,
  unwatchConfigs as unwatchWebpackRCConfig,
} from 'af-webpack/getUserConfig';
import chalk from 'chalk';
import getPaths from './getPaths';
import getRouteConfig from './getRouteConfig';
import { registerBabelForConfig } from './registerBabel';
import { getConfig, watchConfigs } from './getConfig';
import { unwatch } from './getConfig/watch';
import getPlugins from './getPlugins';
import getWebpackConfig from './getWebpackConfig';
import chunksToMap from './utils/chunksToMap';
import send, { PAGE_LIST, BUILD_DONE } from './send';
import FilesGenerator from './FilesGenerator';
import HtmlGenerator from './HtmlGenerator';
import createRouteMiddleware from './createRouteMiddleware';
import PluginAPI from './PluginAPI';

const debug = require('debug')('umi-build-dev:Service');

export default class Service {
  constructor(
    cwd,
    {
      pluginFiles,
      babel,
      entryJSTpl,
      routerTpl,
      hash,
      preact,
      extraResolveModules,
      libraryName = 'umi',
      staticDirectory = 'static',
      tmpDirectory = '.umi',
      outputPath = './dist',
    },
  ) {
    this.cwd = cwd || process.cwd();

    this.pluginFiles = pluginFiles;
    this.babel = babel;
    this.entryJSTpl = entryJSTpl;
    this.routerTpl = routerTpl;
    this.hash = hash;
    this.preact = preact;
    this.extraResolveModules = extraResolveModules;
    this.libraryName = libraryName;
    this.staticDirectory = staticDirectory;
    this.tmpDirectory = tmpDirectory;
    this.outputPath = outputPath;

    this.paths = getPaths(this);
    this.pluginMethods = {};

    this.registerBabel();
  }

  registerBabel() {
    registerBabelForConfig(this.babel, {
      paths: this.paths,
    });
  }

  setRoutes(routes) {
    this.routes = routes;
  }

  getWebpackRCConfig() {
    return getWebpackRCConfig({
      cwd: this.cwd,
      disabledConfigs: ['entry', 'outputPath', 'hash'],
    });
  }

  dev() {
    // 获取 .webpackrc 配置
    let returnedWatchWebpackRCConfig = null;
    try {
      const configObj = this.getWebpackRCConfig();
      this.webpackRCConfig = configObj.config;
      returnedWatchWebpackRCConfig = configObj.watch;
    } catch (e) {
      console.error(chalk.red(e.message));
      debug('Get .webpackrc config failed, watch config and reload');

      // 监听配置项变更，然后重新执行 dev 逻辑
      watchWebpackRCConfig().on('all', (event, path) => {
        debug(`[${event}] ${path}, unwatch and reload`);
        // 重新执行 dev 逻辑
        unwatchWebpackRCConfig();
        this.dev();
      });
      return;
    }

    // 获取用户 config.js 配置
    let returnedWatchConfig = null;
    try {
      const configObj = getConfig(this.cwd, { force: true });
      this.config = configObj.config;
      returnedWatchConfig = configObj.watch;
    } catch (e) {
      console.error(chalk.red(e.message));
      debug('Get config failed, watch config and reload');

      // 监听配置项变更，然后重新执行 dev 逻辑
      watchConfigs().on('all', (event, path) => {
        debug(`[${event}] ${path}, unwatch and reload`);
        // 重新执行 dev 逻辑
        unwatch();
        this.dev();
      });
      return;
    }

    this.initPlugins();
    this.initRoutes();

    // 生成入口文件
    const filesGenerator = new FilesGenerator(this);
    try {
      filesGenerator.generate({
        onChange: () => {
          this.sendPageList();
        },
      });
    } catch (e) {
      console.error(chalk.red(e.message));
      console.error(chalk.red(e.stack));
      debug('Generate entry failed, watch pages and reload');
      filesGenerator.watch({
        onChange: () => {
          filesGenerator.unwatch();
          this.dev();
        },
      });
      return;
    }

    const webpackConfig = getWebpackConfig(this);
    this.webpackConfig = webpackConfig;

    let isCompileDone = false;
    let onCompileDone = () => {
      isCompileDone = true;
    };

    const extraMiddlewares = this.applyPlugins('modifyMiddlewares', {
      initialValue: [
        createRouteMiddleware(this, {
          rebuildEntry() {
            if (!isCompileDone) {
              // 改写
              const defaultOnCompileDone = onCompileDone;
              onCompileDone = () => {
                debug('new compile done');
                filesGenerator.rebuild();
                defaultOnCompileDone();
                // 再次改写
                onCompileDone = () => {};
              };
            } else {
              filesGenerator.rebuild();
            }
          },
        }),
      ],
    });

    require('af-webpack/dev').default({
      webpackConfig,
      extraMiddlewares,
      afterServer: devServer => {
        this.devServer = devServer;
        this.applyPlugins('afterServer', {
          args: {
            devServer,
          },
        });

        returnedWatchWebpackRCConfig(devServer, {
          beforeChange: () => {
            this.registerBabel();
          },
        });
        returnedWatchConfig(devServer);
        filesGenerator.watch();
      },
      onCompileDone: stats => {
        onCompileDone();
        this.applyPlugins('onCompileDone', {
          args: {
            stats,
          },
        });
      },
      proxy: this.webpackRCConfig.proxy || {},
      // 支付宝 IDE 里不自动打开浏览器
      openBrowser: !process.env.ALIPAY_EDITOR,
    });
  }

  initRoutes() {
    this.routes = this.applyPlugins('modifyRoutes', {
      initialValue: getRouteConfig(this.paths, this.config),
    });
  }

  initPlugins() {
    // TODO: getPlugins 的出错处理
    this.plugins = getPlugins({
      configPlugins: this.config.plugins,
      pluginsFromOpts: this.pluginFiles,
      cwd: this.cwd,
      babel: this.babel,
    });
    this.plugins.forEach(({ id, apply }) => {
      apply(new PluginAPI(id, this));
    });
  }

  applyPlugins(key, opts = {}) {
    return (this.pluginMethods[key] || []).reduce((memo, { fn }) => {
      return fn({
        memo,
        args: opts.args,
      });
    }, opts.initialValue);
  }

  sendPageList() {
    const pageList = this.routes.map(route => {
      return { path: route.path };
    });
    send({
      type: PAGE_LIST,
      payload: pageList,
    });
  }

  build() {
    this.webpackRCConfig = this.getWebpackRCConfig().config;
    this.config = getConfig(this.cwd).config;
    this.initPlugins();
    this.initRoutes();

    debug(`Clean tmp dir ${this.paths.tmpDirPath}`);
    rimraf(this.paths.absTmpDirPath);
    debug(`Clean output path ${this.paths.outputPath}`);
    rimraf(this.paths.absOutputPath);
    debug('Generate entry');
    const filesGenerator = new FilesGenerator(this);
    filesGenerator.generate();

    const webpackConfig = getWebpackConfig(this);
    this.webpackConfig = webpackConfig;
    return new Promise(resolve => {
      require('af-webpack/build').default({
        webpackConfig,
        success: ({ stats }) => {
          if (process.env.RM_TMPDIR === 'none') {
            debug(`Clean tmp dir ${this.paths.tmpDirPath}`);
            rimraf(this.paths.absTmpDirPath);
          }

          debug(`Bundle html files`);
          const chunksMap = chunksToMap(stats.compilation.chunks);
          try {
            const hg = new HtmlGenerator(this, {
              chunksMap,
            });
            hg.generate();
          } catch (e) {
            console.log(e);
          }

          debug('Move service-worker.js');
          const sourceSW = join(
            this.paths.absOutputPath,
            this.staticDirectory,
            'service-worker.js',
          );
          const targetSW = join(this.paths.absOutputPath, 'service-worker.js');
          if (existsSync(sourceSW)) {
            renameSync(sourceSW, targetSW);
          }

          this.applyPlugins('buildSuccess');
          send({
            type: BUILD_DONE,
          });
          resolve();
        },
      });
    });
  }
}
