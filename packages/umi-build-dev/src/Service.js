import chalk from 'chalk';
import { join } from 'path';
import getPaths from './getPaths';
import getPlugins from './getPlugins';
import PluginAPI from './PluginAPI';
import UserConfig from './UserConfig';
import registerBabel from './registerBabel';
import getWebpackConfig from './getWebpackConfig';

const debug = require('debug')('umi-build-dev:Service');

export default class Service {
  constructor({ cwd, plugins }) {
    this.cwd = cwd || process.cwd();
    try {
      this.pkg = require(join(this.cwd, 'package.json'));
    } catch (e) {
      this.pkg = {};
    }

    registerBabel({
      cwd: this.cwd,
    });

    this.pluginMethods = {};
    this.commands = {};
    this.plugins = this.resolvePlugins({
      plugins,
    });
    debug(`plugins: ${this.plugins.map(p => p.id).join(' | ')}`);

    // resolve paths after resolvePlugins, since it needs this.config
    this.paths = getPaths(this);
  }

  resolvePlugins({ plugins }) {
    const config = UserConfig.getConfig({
      cwd: this.cwd,
      service: this,
    });
    debug(`user config: ${JSON.stringify(config)}`);

    this.config = config;

    try {
      return getPlugins({
        configPlugins: config.plugins || [],
        pluginsFromOpts: plugins,
        cwd: this.cwd,
      });
    } catch (e) {
      console.error(chalk.red(e.message));
      console.error(e);
      process.exit(1);
    }
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

  init() {
    // load env

    // load user config

    // init plugins
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

    // webpack config
    this.webpackConfig = getWebpackConfig(this);
  }

  run(name, args = {}) {
    this.init();
    debug(`run ${name} with args ${args}`);

    const command = this.commands[name];
    if (!command && name) {
      console.error(chalk.red(`command "${name}" does not exists.`));
      process.exit(1);
    }

    const { fn } = command;
    return fn(args);
  }
}
