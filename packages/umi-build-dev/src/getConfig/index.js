import { existsSync } from 'fs';
import { join } from 'path';
import { clearConsole } from 'af-webpack/react-dev-utils';
import chalk from 'chalk';
import isEqual from 'lodash.isequal';
import didyoumean from 'didyoumean';
import requireindex from 'requireindex';
import { CONFIG_FILES } from '../constants';
import { watch, unwatch } from './watch';
import { setConfig } from '../createRouteMiddleware';

const pluginsMap = requireindex(join(__dirname, './configPlugins'));
const plugins = Object.keys(pluginsMap).map(key => {
  return pluginsMap[key].default();
});
let devServer = null;

function printError(messages) {
  if (devServer) {
    devServer.sockWrite(
      devServer.sockets,
      'errors',
      typeof messages === 'string' ? [messages] : messages,
    );
  }
}

function printWarn(messages) {
  if (devServer) {
    devServer.sockWrite(
      devServer.sockets,
      'warns',
      typeof messages === 'string' ? [messages] : messages,
    );
  }
}

function reload() {
  if (devServer) {
    devServer.sockWrite(devServer.sockets, 'content-changed');
  }
}

function restart(why) {
  if (devServer) {
    clearConsole();
    console.log(chalk.green(`Since ${why}, try to restart server`));
    unwatch();
    devServer.close();
    process.send({ type: 'RESTART' });
  }
}

export function getConfig(cwd, opts = {}) {
  const files = CONFIG_FILES.filter(file => existsSync(join(cwd, file))).map(
    file => join(cwd, file),
  );

  // 从两个地方读取配置，但只允许有一个
  if (files.length === 2) {
    printWarn(
      `
你有两个配置文件，${files[0]} 和 ${
        files[1]
      }，请删除其中一个，我们会使用其中的 ${files[0]}。
    `.trim(),
    );
  }

  let file = null;
  let config = {};

  // 执行插件方法时的上下文
  const context = {
    cwd,
    file,
    printError,
    printWarn,
    restart,
    reload,
  };

  if (files.length) {
    file = files[0];
    const relativeFile = file.replace(`${cwd}/`, '');
    context.relativeFile = relativeFile;

    // 强制读取，不走 require 缓存
    if (opts.force) {
      CONFIG_FILES.forEach(configFile => {
        delete require.cache[join(cwd, configFile)];
      });
    }

    try {
      config = require(file); // eslint-disable-line
    } catch (e) {
      const msg = `配置文件 "${relativeFile}" 解析出错，请检查语法。
\r\n${e.toString()}`;
      printError(msg);
      throw new Error(msg);
    }

    if (config.default) {
      config = config.default;
    }

    // 把外层 context 的内容复制进来，用内层的覆盖它
    if (config.context && config.pages) {
      Object.keys(config.pages).forEach(key => {
        const page = config.pages[key];
        page.context = { ...config.context, ...page.context };
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
        // Remove it if no break
        // if (newKey === '/') {
        //   newKey = '/index.html';
        // }
        if (htmlSuffix && newKey.slice(-5) !== '.html') {
          newKey = `${newKey}.html`;
        }
        if (newKey.charAt(0) !== '/') {
          newKey = `/${newKey}`;
        }
        memo[newKey] = config.pages[key];
        return memo;
      }, {});
    }

    // 校验
    for (const plugin of plugins) {
      const { name } = plugin;
      if (config[name] && plugin.validate) {
        try {
          plugin.validate.call(
            {
              ...context,
              plugin,
              name,
              watch: watch.bind(null, name),
              unwatch: unwatch.bind(null, name),
            },
            config[name],
            config,
          );
        } catch (e) {
          // 校验出错后要把值设到缓存的 config 里，确保 watch 判断时才能拿到正确的值
          if (opts.setConfig) {
            opts.setConfig(config);
          }
          printError(e.message);
          throw new Error(`配置 ${name} 校验失败, ${e.message}`);
        }
      }
    }

    // 找下不匹配的 name
    const pluginNames = plugins.map(p => p.name);
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
  }

  let configFailed = false;
  return {
    file,
    config,
    watch: _devServer => {
      devServer = _devServer;

      // 配置插件的监听
      for (const plugin of plugins) {
        const { name } = plugin;
        if (plugin.watch) {
          plugin.watch.call(
            {
              ...context,
              plugin,
              name,
              watch: watch.bind(null, name),
              unwatch: unwatch.bind(null, name),
            },
            config[name],
            config,
          );
        }
      }

      // 配置文件的监听
      watch('CONFIG_FILES', CONFIG_FILES).on('all', (event, path) => {
        console.log(`[DEBUG] [${event}] ${path}`);
        try {
          const { config: newConfig } = getConfig(cwd, {
            force: true,
            setConfig(newConfig) {
              config = newConfig;
            },
          });

          // 更新 middleware 的配置
          setConfig(newConfig);

          // 从失败中恢复过来，需要 reload 一次
          if (configFailed) {
            configFailed = false;
            reload();
          }

          for (const plugin of plugins) {
            const { name, onChange } = plugin;
            if (!isEqual(newConfig[name], config[name])) {
              if (onChange) {
                onChange.call(
                  {
                    ...context,
                    plugin,
                    name,
                    watch: watch.bind(null, name),
                    unwatch: unwatch.bind(null, name),
                  },
                  newConfig[name],
                  config[name],
                  newConfig,
                );
              }
            }
          }
          config = newConfig;
        } catch (e) {
          configFailed = true;
          console.error(chalk.red(`watch handler failed, since ${e.message}`));
          console.error(e);
        }
      });
    },
  };
}

export function watchConfigs() {
  return watch('CONFIG_FILES', CONFIG_FILES);
}
