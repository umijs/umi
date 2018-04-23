import { sync as rimraf } from 'rimraf';
import { existsSync, renameSync } from 'fs';
import { join } from 'path';
import getWebpackRCConfig, {
  watchConfigs as watchWebpackRCConfig,
  unwatchConfigs as unwatchWebpackRCConfig,
} from 'af-webpack/getUserConfig';
import { clearConsole } from 'af-webpack/react-dev-utils';
import chalk from 'chalk';
import getPaths from './getPaths';
import getRouteConfig from './getRouteConfig';
import registerBabel from './registerBabel';
import { unwatch } from './getConfig/watch';
import UserConfig from './UserConfig';
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
      plugins: pluginFiles,
      babel,
      entryJSTpl,
      routerTpl,
      hash,
      preact,
      extraResolveModules,
      libraryAlias = {},
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
    this.libraryAlias = libraryAlias;
    this.libraryName = libraryName;
    this.staticDirectory = staticDirectory;
    this.tmpDirectory = tmpDirectory;
    this.outputPath = outputPath;

    this.paths = getPaths(this);
    this.pluginMethods = {};

    registerBabel(this.babel, {
      cwd: this.cwd,
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

  async dev() {
    this.initPlugins();

    // 获取用户 config.js 配置
    const userConfig = new UserConfig(this);
    try {
      this.config = userConfig.getConfig({ force: true });
    } catch (e) {
      console.error(chalk.red(e.message));
      debug('Get config failed, watch config and reload');

      // 监听配置项变更，然后重新执行 dev 逻辑
      userConfig.watchConfigs((event, path) => {
        debug(`[${event}] ${path}, unwatch and reload`);
        // 重新执行 dev 逻辑
        userConfig.unwatch();
        this.dev();
      });
      return;
    }

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

    this.applyPlugins('onStart');
    this.initRoutes();

    // 生成入口文件
    const filesGenerator = (this.filesGenerator = new FilesGenerator(this));
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

    const extraMiddlewares = this.applyPlugins('modifyMiddlewares', {
      initialValue: [
        createRouteMiddleware(this, {
          rebuildEntry() {
            filesGenerator.rebuild();
          },
        }),
      ],
    });

    await this.applyPluginsAsync('beforeDevAsync');

    require('af-webpack/dev').default({
      // eslint-disable-line
      webpackConfig,
      extraMiddlewares,
      beforeServer: devServer => {
        this.applyPlugins('beforeServer', {
          args: {
            devServer,
          },
        });
      },
      afterServer: devServer => {
        this.devServer = devServer;
        this.applyPlugins('afterServer', {
          args: {
            devServer,
          },
        });

        returnedWatchWebpackRCConfig(devServer);
        userConfig.setConfig(this.config);
        userConfig.watchWithDevServer();
        filesGenerator.watch();
      },
      onCompileDone: stats => {
        this.applyPlugins('onCompileDone', {
          args: {
            stats,
          },
        });
      },
      proxy: this.webpackRCConfig.proxy || {},
      // 支付宝 IDE 里不自动打开浏览器
      openBrowser: !process.env.ALIPAY_EDITOR,
      historyApiFallback: false,
    });
  }

  initRoutes() {
    this.routes = this.applyPlugins('modifyRoutes', {
      initialValue: getRouteConfig(this.paths, this.config),
    });
  }

  initPlugins() {
    const config = UserConfig.getConfig({
      cwd: this.cwd,
    });
    debug(`user config: ${JSON.stringify(config)}`);
    try {
      this.plugins = getPlugins({
        configPlugins: config.plugins || [],
        pluginsFromOpts: this.pluginFiles,
        cwd: this.cwd,
        babel: this.babel,
      });
    } catch (e) {
      console.error(chalk.red(e.message));
      process.exit(1);
    }
    this.config = config;
    debug(`plugins: ${this.plugins.map(p => p.id).join(' | ')}`);
    this.plugins.forEach(({ id, apply, opts }) => {
      try {
        apply(new PluginAPI(id, this), opts);
      } catch (e) {
        console.error(
          chalk.red(`Plugin ${id} initialize failed, ${e.message}`),
        );
        console.error(e);
        process.exit(1);
      }
    });
  }

  applyPlugins(key, opts = {}) {
    return (this.pluginMethods[key] || []).reduce((memo, { fn }) => {
      try {
        return fn({
          memo,
          args: opts.args,
        });
      } catch (e) {
        console.error(chalk.red(`Plugin apply failed: ${e.message}`));
        throw e;
      }
    }, opts.initialValue);
  }

  async applyPluginsAsync(key, opts = {}) {
    const plugins = this.pluginMethods[key] || [];
    let memo = opts.initialValue;
    for (const plugin of plugins) {
      const { fn } = plugin;
      memo = await fn({
        memo,
        args: opts.args,
      });
    }
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

  reload = () => {
    if (!this.devServer) return;
    this.devServer.sockWrite(this.devServer.sockets, 'content-changed');
  };

  printWarn = messages => {
    if (!this.devServer) return;
    messages = typeof messages === 'string' ? [messages] : messages;
    this.devServer.sockWrite(this.devServer.sockets, 'warns', messages);
  };

  printError = messages => {
    if (!this.devServer) return;
    messages = typeof messages === 'string' ? [messages] : messages;
    this.devServer.sockWrite(this.devServer.sockets, 'errors', messages);
  };

  restart = why => {
    if (!this.devServer) return;
    clearConsole();
    console.log(chalk.green(`Since ${why}, try to restart server`));
    unwatch();
    this.devServer.close();
    process.send({ type: 'RESTART' });
  };

  build() {
    this.initPlugins();

    const userConfig = new UserConfig(this);
    this.config = userConfig.getConfig();

    this.webpackRCConfig = this.getWebpackRCConfig().config;

    this.applyPlugins('onStart');
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
        // eslint-disable-line
        webpackConfig,
        success: ({ stats }) => {
          if (process.env.RM_TMPDIR !== 'none') {
            debug(`Clean tmp dir ${this.paths.tmpDirPath}`);
            rimraf(this.paths.absTmpDirPath);
          }

          this.applyPlugins('beforeGenerateHTML');

          if (process.env.HTML !== 'none') {
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
            const targetSW = join(
              this.paths.absOutputPath,
              'service-worker.js',
            );
            if (existsSync(sourceSW)) {
              renameSync(sourceSW, targetSW);
            }
          }

          this.applyPlugins('buildSuccess');
          this.sendPageList();
          send({
            type: BUILD_DONE,
          });
          resolve();
        },
      });
    });
  }
}
