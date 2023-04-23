import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { lodash } from '@umijs/utils';
import assert from 'assert';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { update as appJSUpdate } from '../appJSUpdater';
import { update } from '../configUpdater';
import { info } from '../logger';
import { Context } from '../types';

const { get } = lodash;

const KEYS_TO_DELETE = [
  'nodeModulesTransform',
  'devServer',
  'dynamicImportSyntax',
  'esbuild',
  'fastRefresh',
  'runtimeHistory',
  'singular',
  'webpack5',
  'workerLoader',

  // 暂不支持，以后会支持
  'dynamicImport',
  'analyze',
  'exportStatic',
  // 'mpa',
  // 'ssr',
];
const KEYS_TO_DELETE_IF_VALUE_MATCH: Record<string, string> = {
  devtool: 'eval-cheap-module-source-map',
};
const KEYS_FROM_BOOLEAN_TO_OBJECT = { runtimePublicPath: {}, ctoken: {} };
const KEYS_CHANGE_NAME: [string, string][] = [
  ['antd.config', 'antd.configProvider'],
];

export class Runner {
  cwd: string;
  context: Context;
  constructor(opts: { cwd: string; context: Context }) {
    this.cwd = opts.cwd;
    this.context = opts.context;
  }

  run() {
    // config/config.ts
    const { config } = this.context;

    // deleteKeys
    const deleteKeys: string[] = [];
    KEYS_TO_DELETE.forEach((key) => {
      if (config[key]) {
        deleteKeys.push(key);
      }
    });
    Object.keys(KEYS_TO_DELETE_IF_VALUE_MATCH).forEach((key) => {
      if (config[key] === KEYS_TO_DELETE_IF_VALUE_MATCH[key]) {
        deleteKeys.push(key);
      }
    });

    // setKeys
    const setKeys: Record<string, any> = {};
    Object.keys(KEYS_FROM_BOOLEAN_TO_OBJECT).forEach((key) => {
      // true > object
      if (config[key] === true) {
        // @ts-ignore
        setKeys[key] = KEYS_FROM_BOOLEAN_TO_OBJECT[key];
      }
    });
    KEYS_CHANGE_NAME.forEach(([currKey, newKey]) => {
      const currValue = get(config, currKey);
      if (currValue !== undefined) {
        deleteKeys.push(currKey);
        setKeys[newKey] = currValue;
      }
    });

    // delete empty proxy
    const { proxy = {} } = config;
    Object.keys(proxy).forEach((key) => {
      if (!Object.keys(proxy[key] || {}).length) {
        deleteKeys.push(`proxy.${key}`);
      }
    });

    // favicon > favicons
    const { favicon } = config;
    if (favicon) {
      setKeys.favicons = [favicon];
      deleteKeys.push('favicon');
    }

    // layout.name > layout.title
    if (config.layout?.name) {
      setKeys['layout.title'] = config.layout?.name;
      deleteKeys.push('layout.name');
    }

    // unexpected layout config > app.ts
    if (this.context.unexpectedLayoutConfig.length) {
      const appJSSet: Record<string, any> = {};
      this.context.unexpectedLayoutConfig.forEach((key) => {
        deleteKeys.push(`layout.${key}`);
        appJSSet[key] = config.layout[key];
      });
      const { absAppJSPath } = this.context;
      const { code } = appJSUpdate({
        code: existsSync(absAppJSPath)
          ? readFileSync(absAppJSPath, 'utf-8')
          : '',
        filePath: absAppJSPath,
        updates: { set: { layout: appJSSet } },
      });
      writeFileSync(absAppJSPath, code, 'utf-8');
      info(`Set ${JSON.stringify({ layout: appJSSet })} to ${absAppJSPath}`);
    }

    // disable locale if locale is not set
    if (config.layout && !config.layout?.locale) {
      setKeys['layout.locale'] = false;
    }

    const configFile = join(this.cwd, 'config/config.ts');
    assert(
      existsSync(configFile),
      `Could not find config file at ${configFile}`,
    );
    const {
      config: { code },
      routesConfig: { filePath: routeFilePath, code: routeCode } = {} as any,
    } = update({
      code: readFileSync(configFile, 'utf-8'),
      filePath: configFile,
      updates: {
        del: deleteKeys,
        set: setKeys,
      },
      routesUpdates: {
        del: [],
        handler: {
          path: (current: t.ObjectProperty, node: t.ObjectExpression) => {
            const exactFalseIndex = node.properties.findIndex(
              (prop) =>
                // @ts-ignore
                prop.key.name === 'exact' && prop.value.value === false,
            );
            if (exactFalseIndex > -1) {
              // remove exact=false
              node.properties.splice(exactFalseIndex, 1);
              // add '/*' to path
              // @ts-ignore
              current.value.value += '/*';
            }
            // path '/'|'.' to ''
            // @ts-ignore
            if (['/', '.'].includes(current.value.value)) {
              // @ts-ignore
              current.value.value = '';
            }
          },
        },
      },
    });
    writeFileSync(configFile, code);
    if (routeCode) {
      writeFileSync(routeFilePath, routeCode);
    }
  }
}
