import { join } from 'path';
import { existsSync } from 'fs';
import requireindex from 'requireindex';
import chalk from 'chalk';
import didyoumean from 'didyoumean';
import isEqual from 'lodash.isequal';
import clone from 'lodash.clonedeep';
import { CONFIG_FILES } from './constants';
import { watch, unwatch } from './getConfig/watch';
import { setConfig as setMiddlewareConfig } from './createRouteMiddleware';

function normalizeConfig(config) {
  config = config.default || config;

  if (config.context && config.pages) {
    Object.keys(config.pages).forEach(key => {
      const page = config.pages[key];
      page.context = {
        ...config.context,
        ...page.context,
      };
    });
  }

  // pages 配置补丁
  // /index -> /index.html
  // index -> /index.html
  if (config.pages) {
    const htmlSuffix = !!(
      config.exportStatic &&
      typeof config.exportStatic === 'object' &&
      config.exportStatic.htmlSuffix
    );
    config.pages = Object.keys(config.pages).reduce((memo, key) => {
      let newKey = key;
      if (
        htmlSuffix &&
        newKey.slice(-1) !== '/' &&
        newKey.slice(-5) !== '.html'
      ) {
        newKey = `${newKey}.html`;
      }
      if (newKey.charAt(0) !== '/') {
        newKey = `/${newKey}`;
      }
      memo[newKey] = config.pages[key];
      return memo;
    }, {});
  }

  return config;
}

class UserConfig {
  static getConfig(opts = {}) {
    const { cwd } = opts;
    const absConfigPath = join(cwd, CONFIG_FILES[0]);
    if (existsSync(absConfigPath)) {
      try {
        const config = require(absConfigPath) || {}; // eslint-disable-line
        return normalizeConfig(config);
      } catch (e) {
        console.error(e);
        return {};
      }
    } else {
      return {};
    }
  }

  constructor(service) {
    this.service = service;
    this.configFailed = false;
    this.config = null;
    this.file = null;
    this.relativeFile = null;
    this.watch = watch;
    this.unwatch = unwatch;
    this.initConfigPlugins();
  }

  initConfigPlugins() {
    const map = requireindex(join(__dirname, 'getConfig/configPlugins'));
    let plugins = Object.keys(map).map(key => {
      return map[key].default;
    });
    plugins = this.service.applyPlugins('modifyConfigPlugins', {
      initialValue: plugins,
    });
    this.plugins = plugins.map(p => p(this));
  }

  getConfigFile() {
    const { paths, printWarn } = this.service;
    const files = CONFIG_FILES.map(file => join(paths.cwd, file)).filter(file =>
      existsSync(file),
    );

    if (files.length > 1) {
      printWarn(
        `Muitiple config files ${files.join(', ')} detected, umi will use ${
          files[0]
        }.`,
      );
    }

    return files[0];
  }

  getConfig(opts = {}) {
    const { paths, printError } = this.service;
    const { force, setConfig } = opts;

    const file = this.getConfigFile();
    this.file = file;
    if (!file) {
      return {};
    }

    // 强制读取，不走 require 缓存
    if (force) {
      CONFIG_FILES.forEach(file => {
        delete require.cache[join(paths.cwd, file)];
      });
    }

    let config = null;
    const relativeFile = file.replace(`${paths.cwd}/`, '');
    this.relativeFile = relativeFile;
    try {
      config = require(file); // eslint-disable-line
    } catch (e) {
      const msg = `配置文件 "${relativeFile}" 解析出错，请检查语法。
\r\n${e.toString()}`;
      printError(msg);
      throw new Error(msg);
    }

    config = normalizeConfig(config);

    // Validate
    for (const plugin of this.plugins) {
      const { name, validate } = plugin;
      if (config[name] && validate) {
        try {
          plugin.validate(config[name]);
        } catch (e) {
          // 校验出错后要把值设到缓存的 config 里，确保 watch 判断时才能拿到正确的值
          if (setConfig) {
            setConfig(config);
          }
          printError(e.message);
          throw new Error(`配置 ${name} 校验失败, ${e.message}`);
        }
      }
    }

    // 找下不匹配的 name
    const pluginNames = this.plugins.map(p => p.name);
    Object.keys(config).forEach(key => {
      if (!pluginNames.includes(key)) {
        if (opts.setConfig) {
          opts.setConfig(config);
        }
        const affixmsg = `选择 "${pluginNames.join(
          ', ',
        )}" 中的一项，详见 https://fengdie.alipay-eco.com/doc/h5app/configuration`;
        const guess = didyoumean(key, pluginNames);
        const midMsg = guess ? `你是不是想配置 "${guess}" ？ 或者` : '请';
        const msg = `"${relativeFile}" 中配置的 "${key}" 并非约定的配置项，${midMsg}${affixmsg}`;
        printError(msg);
        throw new Error(msg);
      }
    });

    return config;
  }

  setConfig(config) {
    this.config = config;
  }

  watchWithDevServer() {
    // 配置插件的监听
    for (const plugin of this.plugins) {
      if (plugin.watch) {
        plugin.watch();
      }
    }

    // 配置文件的监听
    this.watchConfigs((event, path) => {
      console.log(`[DEBUG] [${event}] ${path}`);
      try {
        const newConfig = this.getConfig({
          force: true,
          setConfig: newConfig => {
            console.log('set config');
            this.config = newConfig;
          },
        });

        // 更新 middleware 的配置
        setMiddlewareConfig(newConfig);

        // 从失败中恢复过来，需要 reload 一次
        if (this.configFailed) {
          this.configFailed = false;
          this.service.reload();
        }

        const oldConfig = clone(this.config);
        this.config = newConfig;
        for (const plugin of this.plugins) {
          const { name } = plugin;
          if (!isEqual(newConfig[name], oldConfig[name])) {
            if (plugin.onChange) {
              plugin.onChange(newConfig);
            }
          }
        }
      } catch (e) {
        this.configFailed = true;
        console.error(chalk.red(`watch handler failed, since ${e.message}`));
        console.error(e);
      }
    });
  }

  watchConfigs(handler) {
    return this.watch('CONFIG_FILES', CONFIG_FILES).on('all', handler);
  }
}

export default UserConfig;
