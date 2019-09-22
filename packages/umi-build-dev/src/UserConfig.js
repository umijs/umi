import { join } from 'path';
import requireindex from 'requireindex';
import chalk from 'chalk';
import didyoumean from 'didyoumean';
import { cloneDeep } from 'lodash';
import signale from 'signale';
import getUserConfig, {
  getConfigPaths,
  getConfigFile,
  getConfigByConfigFile,
  cleanConfigRequireCache,
} from 'umi-core/lib/getUserConfig';
import { watch, unwatch } from './getConfig/watch';
import isEqual from './isEqual';

class UserConfig {
  static getConfig(opts = {}) {
    const { cwd, service } = opts;
    return getUserConfig({
      cwd,
      defaultConfig: service.applyPlugins('modifyDefaultConfig', {
        initialValue: {},
      }),
    });
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
    let plugins = Object.keys(map)
      .filter(key => !key.includes('.test.'))
      .map(key => {
        return map[key].default;
      });
    plugins = this.service.applyPlugins('_registerConfig', {
      initialValue: plugins,
    });
    this.plugins = plugins.map(p => p(this));
  }

  printError(messages) {
    if (this.service.printError) this.service.printError(messages);
  }

  getConfig(opts = {}) {
    const { paths, cwd } = this.service;
    const { force, setConfig } = opts;
    const defaultConfig = this.service.applyPlugins('modifyDefaultConfig', {
      initialValue: {},
    });

    const file = getConfigFile(cwd);
    this.file = file;
    if (!file) {
      return defaultConfig;
    }

    // 强制读取，不走 require 缓存
    if (force) {
      cleanConfigRequireCache(cwd);
    }

    let config = null;
    const relativeFile = file.replace(`${paths.cwd}/`, '');
    this.relativeFile = relativeFile;

    const onError = (e, file) => {
      const msg = `配置文件 "${file.replace(`${paths.cwd}/`, '')}" 解析出错，请检查语法。
\r\n${e.toString()}`;
      this.printError(msg);
      throw e;
    };

    config = getConfigByConfigFile(file, {
      defaultConfig,
      onError,
    });

    config = this.service.applyPlugins('_modifyConfig', {
      initialValue: config,
    });

    // Validate
    for (const plugin of this.plugins) {
      const { name, validate } = plugin;
      if (config[name] && validate) {
        try {
          plugin.validate.call({ cwd }, config[name]);
        } catch (e) {
          // 校验出错后要把值设到缓存的 config 里，确保 watch 判断时才能拿到正确的值
          if (setConfig) {
            setConfig(config);
          }
          this.printError(e.message);
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
        const affixmsg = `选择 "${pluginNames.join(', ')}" 中的一项`;
        const guess = didyoumean(key, pluginNames);
        const midMsg = guess ? `你是不是想配置 "${guess}" ？ 或者` : '请';
        const msg = `"${relativeFile}" 中配置的 "${key}" 并非约定的配置项，${midMsg}${affixmsg}`;
        this.printError(msg);
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
      signale.debug(`[${event}] ${path}`);
      try {
        const newConfig = this.getConfig({
          force: true,
          setConfig: newConfig => {
            this.config = newConfig;
          },
        });

        // 从失败中恢复过来，需要 reload 一次
        if (this.configFailed) {
          this.configFailed = false;
          this.service.refreshBrowser();
        }

        const oldConfig = cloneDeep(this.config);
        this.config = newConfig;

        for (const plugin of this.plugins) {
          const { name } = plugin;
          if (!isEqual(newConfig[name], oldConfig[name])) {
            this.service.config[name] = newConfig[name];
            this.service.applyPlugins('onConfigChange', {
              args: {
                newConfig,
              },
            });
            if (plugin.onChange) {
              plugin.onChange(newConfig, oldConfig);
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
    const { cwd } = this.service;
    const watcher = this.watch('CONFIG_FILES', getConfigPaths(cwd));
    if (watcher) {
      watcher.on('all', handler);
    }
  }
}

export default UserConfig;
