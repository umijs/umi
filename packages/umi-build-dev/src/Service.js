import chalk from 'chalk';
import { join, dirname } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import assert from 'assert';
import mkdirp from 'mkdirp';
import { assign, cloneDeep } from 'lodash';
import { parse } from 'dotenv';
import signale from 'signale';
import { deprecate } from 'umi-utils';
import getPaths from './getPaths';
import getPlugins from './getPlugins';
import PluginAPI from './PluginAPI';
import UserConfig from './UserConfig';
import registerBabel from './registerBabel';
import getCodeFrame from './utils/getCodeFrame';

const debug = require('debug')('umi-build-dev:Service');

export default class Service {
  constructor({ cwd }) {
    this.cwd = cwd || process.cwd();
    try {
      this.pkg = require(join(this.cwd, 'package.json')); // eslint-disable-line
    } catch (e) {
      this.pkg = {};
    }

    registerBabel({
      cwd: this.cwd,
    });

    this.commands = {};
    this.pluginHooks = {};
    this.pluginMethods = {};
    this.generators = {};

    // resolve user config
    this.config = UserConfig.getConfig({
      cwd: this.cwd,
      service: this,
    });
    debug(`user config: ${JSON.stringify(this.config)}`);

    // resolve plugins
    this.plugins = this.resolvePlugins();
    this.extraPlugins = [];
    debug(`plugins: ${this.plugins.map(p => p.id).join(' | ')}`);

    // resolve paths
    this.paths = getPaths(this);
  }

  resolvePlugins() {
    try {
      assert(
        Array.isArray(this.config.plugins || []),
        `Configure item ${chalk.underline.cyan(
          'plugins',
        )} should be Array, but got ${chalk.red(typeof this.config.plugins)}`,
      );
      return getPlugins({
        cwd: this.cwd,
        plugins: this.config.plugins || [],
      });
    } catch (e) {
      if (process.env.UMI_TEST) {
        throw new Error(e);
      } else {
        signale.error(e);
        process.exit(1);
      }
    }
  }

  initPlugin(plugin) {
    const { id, apply, opts } = plugin;
    try {
      assert(
        typeof apply === 'function',
        `
plugin must export a function, e.g.

  export default function(api) {
    // Implement functions via api
  }
        `.trim(),
      );
      const api = new Proxy(new PluginAPI(id, this), {
        get: (target, prop) => {
          if (this.pluginMethods[prop]) {
            return this.pluginMethods[prop];
          }
          if (
            [
              // methods
              'changePluginOption',
              'applyPlugins',
              '_applyPluginsAsync',
              'writeTmpFile',
              // properties
              'cwd',
              'config',
              'webpackConfig',
              'pkg',
              'paths',
              'routes',
              // dev methods
              'restart',
              'printError',
              'printWarn',
              'refreshBrowser',
              'rebuildTmpFiles',
              'rebuildHTML',
            ].includes(prop)
          ) {
            if (typeof this[prop] === 'function') {
              return this[prop].bind(this);
            } else {
              return this[prop];
            }
          } else {
            return target[prop];
          }
        },
      });
      api.onOptionChange = fn => {
        assert(
          typeof fn === 'function',
          `The first argument for api.onOptionChange should be function in ${id}.`,
        );
        plugin.onOptionChange = fn;
      };
      apply(api, opts);
      plugin._api = api;
    } catch (e) {
      if (process.env.UMI_TEST) {
        throw new Error(e);
      } else {
        signale.error(
          `
Plugin ${chalk.cyan.underline(id)} initialize failed

${getCodeFrame(e, { cwd: this.cwd })}
        `.trim(),
        );
        debug(e);
        process.exit(1);
      }
    }
  }

  initPlugins() {
    this.plugins.forEach(plugin => {
      this.initPlugin(plugin);
    });

    let count = 0;
    while (this.extraPlugins.length) {
      const extraPlugins = cloneDeep(this.extraPlugins);
      this.extraPlugins = [];
      extraPlugins.forEach(plugin => {
        this.initPlugin(plugin);
        this.plugins.push(plugin);
      });
      count += 1;
      assert(count <= 10, `插件注册死循环？`);
    }

    // Throw error for methods that can't be called after plugins is initialized
    this.plugins.forEach(plugin => {
      [
        'onOptionChange',
        'register',
        'registerMethod',
        'registerPlugin',
      ].forEach(method => {
        plugin._api[method] = () => {
          throw new Error(
            `api.${method}() should not be called after plugin is initialized.`,
          );
        };
      });
    });
  }

  changePluginOption(id, newOpts) {
    assert(id, `id must supplied`);
    const plugin = this.plugins.filter(p => p.id === id)[0];
    assert(plugin, `plugin ${id} not found`);
    plugin.opts = newOpts;
    if (plugin.onOptionChange) {
      plugin.onOptionChange(newOpts);
    } else {
      this.restart(`plugin ${id}'s option changed`);
    }
  }

  applyPlugins(key, opts = {}) {
    debug(`apply plugins ${key}`);
    return (this.pluginHooks[key] || []).reduce((memo, { fn }) => {
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

  async _applyPluginsAsync(key, opts = {}) {
    debug(`apply plugins async ${key}`);
    const hooks = this.pluginHooks[key] || [];
    let memo = opts.initialValue;
    for (const hook of hooks) {
      const { fn } = hook;
      memo = await fn({
        memo,
        args: opts.args,
      });
    }
    return memo;
  }

  loadEnv() {
    const basePath = join(this.cwd, '.env');
    const localPath = `${basePath}.local`;

    const load = path => {
      if (existsSync(path)) {
        debug(`load env from ${path}`);
        const parsed = parse(readFileSync(path, 'utf-8'));
        Object.keys(parsed).forEach(key => {
          if (!process.env.hasOwnProperty(key)) {
            process.env[key] = parsed[key];
          }
        });
      }
    };

    load(basePath);
    load(localPath);
  }

  writeTmpFile(file, content) {
    const { paths } = this;
    const path = join(paths.absTmpDirPath, file);
    mkdirp.sync(dirname(path));
    writeFileSync(path, content, 'utf-8');
  }

  init() {
    // load env
    this.loadEnv();

    // init plugins
    this.initPlugins();

    // reload user config
    const userConfig = new UserConfig(this);
    const config = userConfig.getConfig({ force: true });
    mergeConfig(this.config, config);
    this.userConfig = userConfig;
    if (config.browserslist) {
      deprecate('config.browserslist', 'use config.targets instead');
    }
    debug('got user config');
    debug(this.config);

    // assign user's outputPath config to paths object
    if (config.outputPath) {
      const { paths } = this;
      paths.outputPath = config.outputPath;
      paths.absOutputPath = join(paths.cwd, config.outputPath);
    }
    debug('got paths');
    debug(this.paths);
  }

  registerCommand(name, opts, fn) {
    if (typeof opts === 'function') {
      fn = opts;
      opts = null;
    }
    opts = opts || {};
    assert(
      !(name in this.commands),
      `Command ${name} exists, please select another one.`,
    );
    this.commands[name] = { fn, opts };
  }

  run(name = 'help', args) {
    this.init();
    return this.runCommand(name, args);
  }

  runCommand(rawName, rawArgs) {
    debug(`raw command name: ${rawName}, args: ${JSON.stringify(rawArgs)}`);
    const { name, args } = this.applyPlugins('_modifyCommand', {
      initialValue: {
        name: rawName,
        args: rawArgs,
      },
    });
    debug(`run ${name} with args ${JSON.stringify(args)}`);

    const command = this.commands[name];
    if (!command) {
      signale.error(`Command ${chalk.underline.cyan(name)} does not exists`);
      process.exit(1);
    }

    const { fn, opts } = command;
    if (opts.webpack) {
      // webpack config
      this.webpackConfig = require('./getWebpackConfig').default(this);
    }

    return fn(args);
  }
}

function mergeConfig(oldConfig, newConfig) {
  Object.keys(oldConfig).forEach(key => {
    if (!(key in newConfig)) {
      delete oldConfig[key];
    }
  });
  assign(oldConfig, newConfig);
  return oldConfig;
}
