// [x] get config file
// [x] support .local and UMI_ENV
// [x] read config
// [x] validate config
// watch config
// note: 不支持没有 config 文件启动后，新增 config 文件的监听

import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { lodash, register } from '@umijs/utils';
import assert from 'assert';
import { existsSync } from 'fs';
import { join } from 'path';
import joi from '../../compiled/@hapi/joi';
import { DEFAULT_CONFIG_FILES, LOCAL_EXT, SHORT_ENV } from '../constants';
import { Env } from '../types';
import { addExt } from './utils';

interface IOpts {
  cwd: string;
  env: Env;
}

export class Config {
  public opts: IOpts;
  constructor(opts: IOpts) {
    this.opts = opts;
  }

  static getMainConfigFile(opts: { cwd: string }) {
    let mainConfigFile;
    for (const configFile of DEFAULT_CONFIG_FILES) {
      const absConfigFile = join(opts.cwd, configFile);
      if (existsSync(absConfigFile)) {
        mainConfigFile = absConfigFile;
        break;
      }
    }
    return mainConfigFile;
  }

  static getConfigFiles(opts: {
    mainConfigFile: string;
    env: Env;
    specifiedEnv: string;
  }) {
    const ret: string[] = [];
    const { mainConfigFile, specifiedEnv } = opts;
    if (mainConfigFile) {
      const env = SHORT_ENV[opts.env] || opts.env;
      ret.push(
        ...[
          mainConfigFile,
          specifiedEnv &&
            addExt({ file: mainConfigFile, ext: `.${specifiedEnv}` }),
          addExt({ file: mainConfigFile, ext: `.${env}` }),
          specifiedEnv &&
            addExt({
              file: mainConfigFile,
              ext: `.${env}.${specifiedEnv}`,
            }),
          addExt({ file: mainConfigFile, ext: LOCAL_EXT }),
        ].filter(Boolean),
      );
    }
    return ret;
  }

  static getUserConfig(opts: { configFiles: string[] }) {
    let config = {};
    let files: string[] = [];

    for (const configFile of opts.configFiles) {
      files.push(configFile);
      if (existsSync(configFile)) {
        register.register({
          implementor: esbuild,
        });
        register.clearFiles();
        config = lodash.merge(config, require(configFile).default);
        files.push(...register.getFiles());
      }
    }

    return {
      config,
      files,
    };
  }

  static validateConfig(opts: { config: any; schemas: Record<string, any> }) {
    const errors = new Map<string, Error>();
    const configKeys = new Set(Object.keys(opts.config));
    for (const key of Object.keys(opts.schemas)) {
      configKeys.delete(key);
      if (!opts.config[key]) continue;
      const schema = opts.schemas[key](joi);
      // invalid schema
      assert(joi.isSchema(schema), `schema for config ${key} is not valid.`);
      const { error } = schema.validate(opts.config[key]);
      errors.set(key, error);
    }
    // invalid config values
    assert(
      errors.size === 0,
      `Invalid config values: ${Array.from(errors.keys()).join(', ')}
${Array.from(errors.keys()).map((key) => {
  return `Invalid value for ${key}:\n${errors.get(key)!.message}`;
})}`,
    );
    // invalid config keys
    assert(
      configKeys.size === 0,
      `Invalid config keys: ${Array.from(configKeys).join(', ')}`,
    );
  }
}
