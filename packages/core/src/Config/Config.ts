import { existsSync } from 'fs';
import { extname, join } from 'path';
import {
  compatESModuleRequire,
  deepmerge,
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

interface IOpts {
  cwd: string;
  service: Service;
  localConfig?: boolean;
}

// TODO:
// 1. custom config file
// 2. watch mode
export default class Config {
  cwd: string;
  service: Service;
  config?: object;
  localConfig?: boolean;

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
    const userConfigKeys = Object.keys(userConfig).filter(key => {
      // ignore plugin disable config
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
        updateUserConfigWithKey({
          key,
          // TODO: 确认 deepmerge 是否可应用于任何类型，不能的话还得再封一层
          value: config.default
            ? deepmerge(config.default, value ?? {})
            : value,
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
    const configFiles = [
      '.umirc.ts',
      '.umirc.js',
      'config/config.ts',
      'config/config.js',
    ];
    const configFile = configFiles.find(f => existsSync(join(this.cwd, f)));
    return configFile ? winPath(configFile) : null;
  }
}
