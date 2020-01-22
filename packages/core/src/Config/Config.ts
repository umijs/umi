import { existsSync } from 'fs';
import { extname, join } from 'path';
import {
  chalk,
  chokidar,
  compatESModuleRequire,
  deepmerge,
  lodash,
  parseRequireDeps,
  winPath,
} from '@umijs/utils';
import assert from 'assert';
import joi from '@hapi/joi';
import Service from '../Service/Service';
import { ServiceStage } from '../Service/enums';
import {
  getUserConfigWithKey,
  updateUserConfigWithKey,
} from './utils/configUtils';
import isEqual from './utils/isEqual';
import mergeDefault from './utils/mergeDefault';

interface IChanged {
  key: string;
  pluginId: string;
}

interface IOpts {
  cwd: string;
  service: Service;
  localConfig?: boolean;
}

const CONFIG_FILES = [
  '.umirc.ts',
  '.umirc.js',
  'config/config.ts',
  'config/config.js',
];

// TODO:
// 1. custom config file
// 2. watch mode
export default class Config {
  cwd: string;
  service: Service;
  config?: object;
  localConfig?: boolean;
  configFile?: string | null;

  constructor(opts: IOpts) {
    this.cwd = opts.cwd || process.cwd();
    this.service = opts.service;
    this.localConfig = opts.localConfig;
  }

  getConfig() {
    assert(
      this.service.stage >= ServiceStage.pluginReady,
      `Config.getConfig() failed, it should not be executed before plugin is ready.`,
    );

    const userConfig = this.getUserConfig();
    // 用于提示用户哪些 key 是未定义的
    // TODO: 考虑不排除 false 的 key
    const userConfigKeys = Object.keys(userConfig).filter(key => {
      return userConfig[key] !== false;
    });
    Object.keys(this.service.plugins).forEach(pluginId => {
      const { key, config = {} } = this.service.plugins[pluginId];
      // recognize as key if have schema config
      if (!config.schema) return;

      const value = getUserConfigWithKey({ key, userConfig });

      // do validate
      const schema = config.schema(joi);
      assert(
        joi.isSchema(schema),
        `schema return from plugin ${pluginId} is not valid schema.`,
      );
      const { error } = schema.validate(value);
      if (error) {
        const e = new Error(
          `Validate config "${key}" failed, ${error.message}`,
        );
        e.stack = error.stack;
        throw e;
      }

      // remove key
      const index = userConfigKeys.indexOf(key.split('.')[0]);
      if (index !== -1) {
        userConfigKeys.splice(index, 1);
      }

      // update userConfig with defaultConfig
      if (config.default) {
        const newValue = mergeDefault({
          defaultConfig: config.default,
          config: value,
        });
        updateUserConfigWithKey({
          key,
          value: newValue,
          userConfig,
        });
      }
    });

    if (userConfigKeys.length) {
      const keys = userConfigKeys.length > 1 ? 'keys' : 'key';
      throw new Error(`Invalid config ${keys}: ${userConfigKeys.join(', ')}`);
    }

    return userConfig;
  }

  getUserConfig() {
    const configFile = this.getConfigFile();
    this.configFile = configFile;
    // 潜在问题：
    // .local 和 .env 的配置必须有 configFile 才有效
    if (configFile) {
      let envConfigFile;
      if (process.env.UMI_ENV) {
        envConfigFile = this.addAffix(configFile, process.env.UMI_ENV);
        if (!existsSync(join(this.cwd, envConfigFile))) {
          throw new Error(
            `get user config failed, ${envConfigFile} does not exist, but process.env.UMI_ENV is set to ${process.env.UMI_ENV}.`,
          );
        }
      }
      const files = [
        configFile,
        envConfigFile,
        this.localConfig && this.addAffix(configFile, 'local'),
      ]
        .filter((f): f is string => !!f)
        .map(f => join(this.cwd, f))
        .filter(f => existsSync(f));

      // clear require cache and set babel register
      const requireDeps = files.reduce((memo: string[], file) => {
        memo = memo.concat(parseRequireDeps(file));
        return memo;
      }, []);
      requireDeps.forEach(f => {
        // TODO: potential windows path problem?
        if (require.cache[f]) {
          delete require.cache[f];
        }
      });
      this.service.babelRegister.setOnlyMap({
        key: 'config',
        value: requireDeps,
      });

      // require config and merge
      return this.mergeConfig(...this.requireConfigs(files));
    } else {
      return {};
    }
  }

  addAffix(file: string, affix: string) {
    const ext = extname(file);
    return file.replace(new RegExp(`${ext}$`), `.${affix}${ext}`);
  }

  requireConfigs(configFiles: string[]) {
    return configFiles.map(f => compatESModuleRequire(require(f)));
  }

  mergeConfig(...configs: object[]) {
    let ret = {};
    for (const config of configs) {
      // TODO: 精细化处理，比如处理 dotted config key
      ret = deepmerge(ret, config);
    }
    return ret;
  }

  getConfigFile(): string | null {
    // TODO: support custom config file
    const configFile = CONFIG_FILES.find(f => existsSync(join(this.cwd, f)));
    return configFile ? winPath(configFile) : null;
  }

  getWatchFilesAndDirectories() {
    const umiEnv = process.env.UMI_ENV;
    const configFiles = lodash.clone(CONFIG_FILES);
    CONFIG_FILES.forEach(f => {
      if (this.localConfig) configFiles.push(this.addAffix(f, 'local'));
      if (umiEnv) configFiles.push(this.addAffix(f, umiEnv));
    });

    const configDir = winPath(join(this.cwd, 'config'));

    const files = configFiles
      .reduce<string[]>((memo, f) => {
        const file = winPath(join(this.cwd, f));
        if (existsSync(file)) {
          memo = memo.concat(parseRequireDeps(file));
        } else {
          memo.push(file);
        }
        return memo;
      }, [])
      .filter(f => !f.startsWith(configDir));

    return [configDir].concat(files);
  }

  watch(opts: {
    userConfig: object;
    onChange: (args: {
      userConfig: any;
      pluginChanged: IChanged[];
      valueChanged: IChanged[];
    }) => void;
  }) {
    let paths = this.getWatchFilesAndDirectories();
    let userConfig = opts.userConfig;
    const watcher = chokidar.watch(paths, {
      ignoreInitial: true,
      cwd: this.cwd,
    });
    watcher.on('all', (event, path) => {
      console.log(chalk.green(`[${event}] ${path}`));
      const newPaths = this.getWatchFilesAndDirectories();
      const diffs = lodash.difference(newPaths, paths);
      if (diffs.length) {
        watcher.add(diffs);
        paths = paths.concat(diffs);
      }

      const newUserConfig = this.getUserConfig();
      const pluginChanged: IChanged[] = [];
      const valueChanged: IChanged[] = [];
      Object.keys(this.service.plugins).forEach(pluginId => {
        const { key, config = {} } = this.service.plugins[pluginId];
        // recognize as key if have schema config
        if (!config.schema) return;
        if (!isEqual(newUserConfig[key], userConfig[key])) {
          const changed = {
            key,
            pluginId: pluginId,
          };
          if (newUserConfig[key] === false || userConfig[key] === false) {
            pluginChanged.push(changed);
          } else {
            valueChanged.push(changed);
          }
        }
      });

      if (pluginChanged.length || valueChanged.length) {
        opts.onChange({
          userConfig: newUserConfig,
          pluginChanged,
          valueChanged,
        });
      }
      userConfig = newUserConfig;
    });

    return () => {
      watcher.close();
    };
  }
}
