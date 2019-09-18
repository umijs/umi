import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import assert from 'assert';
import stripJsonComments from 'strip-json-comments';
import didyoumean from 'didyoumean';
import chalk from 'chalk';
import { isPlainObject, isEqual } from 'lodash';
import { clearConsole } from '../reactDevUtils';
import { watch, unwatch } from './watch';
import getPlugins from './getPlugins';

const debug = require('debug')('af-webpack:getUserConfig');

const plugins = getPlugins();
const pluginNames = plugins.map(p => p.name);
const pluginsMapByName = plugins.reduce((memo, p) => {
  memo[p.name] = p;
  return memo;
}, {});

let devServer = null;
const USER_CONFIGS = 'USER_CONFIGS';

function throwError(msg) {
  printError(msg);
  throw new Error(msg);
}

function printError(messages) {
  if (devServer) {
    devServer.sockWrite(
      devServer.sockets,
      'errors',
      typeof messages === 'string' ? [messages] : messages,
    );
  }
}

function reload() {
  devServer.sockWrite(devServer.sockets, 'content-changed');
}

function restart(why) {
  clearConsole();
  console.log(chalk.green(`Since ${why}, try to restart the server`));
  unwatch();
  devServer.close();
  process.send({ type: 'RESTART' });
}

function merge(oldObj, newObj) {
  for (const key in newObj) {
    if (Array.isArray(newObj[key]) && Array.isArray(oldObj[key])) {
      oldObj[key] = oldObj[key].concat(newObj[key]);
    } else if (isPlainObject(newObj[key]) && isPlainObject(oldObj[key])) {
      oldObj[key] = Object.assign(oldObj[key], newObj[key]);
    } else {
      oldObj[key] = newObj[key];
    }
  }
}

function replaceNpmVariables(value, pkg) {
  if (typeof value === 'string') {
    return value
      .replace('$npm_package_name', pkg.name)
      .replace('$npm_package_version', pkg.version);
  } else {
    return value;
  }
}

export default function getUserConfig(opts = {}) {
  const {
    cwd = process.cwd(),
    configFile = '.webpackrc',
    disabledConfigs = [],
    preprocessor,
  } = opts;

  // TODO: 支持数组的形式？\

  // Read config from configFile and `${configFile}.js`
  const rcFile = resolve(cwd, configFile);
  const jsRCFile = resolve(cwd, `${configFile}.js`);

  assert(
    !(existsSync(rcFile) && existsSync(jsRCFile)),
    `${configFile} file and ${configFile}.js file can not exist at the same time.`,
  );

  let config = {};
  if (existsSync(rcFile)) {
    config = JSON.parse(stripJsonComments(readFileSync(rcFile, 'utf-8')));
  }
  if (existsSync(jsRCFile)) {
    // no cache
    delete require.cache[jsRCFile];
    config = require(jsRCFile); // eslint-disable-line
    if (config.default) {
      config = config.default;
    }
  }
  if (typeof preprocessor === 'function') {
    config = preprocessor(config);
  }

  // Context for validate function
  const context = {
    cwd,
  };

  // Validate
  let errorMsg = null;
  Object.keys(config).forEach(key => {
    // 禁用项
    if (disabledConfigs.includes(key)) {
      errorMsg = `Configuration item ${key} is disabled, please remove it.`;
    }
    // 非法的项
    if (!pluginNames.includes(key)) {
      const guess = didyoumean(key, pluginNames);
      const affix = guess ? `do you meen ${guess} ?` : 'please remove it.';
      errorMsg = `Configuration item ${key} is not valid, ${affix}`;
    } else {
      // run config plugin's validate
      const plugin = pluginsMapByName[key];
      if (plugin.validate) {
        try {
          plugin.validate.call(context, config[key]);
        } catch (e) {
          errorMsg = e.message;
        }
      }
    }
  });

  // 确保不管校验是否出错，下次 watch 判断时能拿到正确的值
  if (errorMsg) {
    if (/* from watch */ opts.setConfig) {
      opts.setConfig(config);
    }
    throwError(errorMsg);
  }

  // Merge config with current env
  if (config.env) {
    if (config.env[process.env.NODE_ENV]) {
      merge(config, config.env[process.env.NODE_ENV]);
    }
    delete config.env;
  }

  // Replace npm variables
  const pkgFile = resolve(cwd, 'package.json');
  if (Object.keys(config).length && existsSync(pkgFile)) {
    const pkg = JSON.parse(readFileSync(pkgFile, 'utf-8'));
    config = Object.keys(config).reduce((memo, key) => {
      memo[key] = replaceNpmVariables(config[key], pkg);
      return memo;
    }, {});
  }

  let configFailed = false;
  function watchConfigsAndRun(_devServer, watchOpts = {}) {
    devServer = _devServer;

    const watcher = watchConfigs(opts);
    watcher.on('all', () => {
      try {
        if (watchOpts.beforeChange) {
          watchOpts.beforeChange();
        }

        const { config: newConfig } = getUserConfig({
          ...opts,
          setConfig(newConfig) {
            config = newConfig;
          },
        });

        // 从失败中恢复过来，需要 reload 一次
        if (configFailed) {
          configFailed = false;
          reload();
        }

        // 比较，然后执行 onChange
        for (const plugin of plugins) {
          const { name, onChange } = plugin;

          if (!isEqual(newConfig[name], config[name])) {
            debug(
              `Config ${name} changed, from ${JSON.stringify(config[name])} to ${JSON.stringify(
                newConfig[name],
              )}`,
            );
            (onChange || restart.bind(null, `${name} changed`)).call(null, {
              name,
              val: config[name],
              newVal: newConfig[name],
              config,
              newConfig,
            });
          }
        }
      } catch (e) {
        configFailed = true;
        console.error(chalk.red(`Watch handler failed, since ${e.message}`));
        console.error(e);
      }
    });
    return watcher;
  }

  debug(`UserConfig: ${JSON.stringify(config)}`);

  return { config, watch: watchConfigsAndRun };
}

export function watchConfigs(opts = {}) {
  const { cwd = process.cwd(), configFile = '.webpackrc' } = opts;

  const rcFile = resolve(cwd, configFile);
  const jsRCFile = resolve(cwd, `${configFile}.js`);

  return watch(USER_CONFIGS, [rcFile, jsRCFile]);
}

export function unwatchConfigs() {
  unwatch(USER_CONFIGS);
}
