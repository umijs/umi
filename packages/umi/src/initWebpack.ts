import { init as initRequreHook } from '@umijs/bundler-webpack/lib/requireHook';
import { init } from '@umijs/deps/compiled/webpack';
import { createDebug } from '@umijs/utils';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
const esprima = require('esprima');
const ts = require('typescript');
const debug = createDebug('umi:cli:initWebpack');

const DEFAULT_CONFIG_FILES = [
  '.umirc.ts',
  '.umirc.js',
  'config/config.ts',
  'config/config.js',
];

function getConfigFile(opts: { cwd: string }) {
  const configFile = DEFAULT_CONFIG_FILES.filter((file) => {
    return existsSync(join(opts.cwd, file));
  })[0];
  return configFile ? join(opts.cwd, configFile) : null;
}

export default () => {
  // 1. read user config
  // 2. if have webpack5:
  // 3. init webpack with webpack5 flag

  let cwd = process.cwd();
  if (process.env.APP_ROOT) {
    cwd = join(cwd, process.env.APP_ROOT);
  }
  const configFile = getConfigFile({ cwd });
  const configContent = configFile ? readFileSync(configFile, 'utf-8') : '';
  let haveWebpack5 = false;
  // TODO: detect with ast
  try {
    // 拿到js代码
    const jscode = ts.transpileModule(configContent, {}).outputText;
    // ast解析
    const ast = esprima.parseModule(jscode);

    // 循环ast节点, 判断是否有 mfsu 或者 webpack5
    for (let i = 0; i < ast.body.length; i++) {
      const node = ast.body[i];
      if (
        node.type === 'ExpressionStatement' &&
        node.expression.type === 'AssignmentExpression' &&
        node.expression.left.type === 'MemberExpression' &&
        node.expression.left.object.type === 'Identifier' &&
        node.expression.left.object.name === 'exports' &&
        node.expression.left.property.type === 'Identifier' &&
        node.expression.left.property.name === 'default'
      ) {
        // 深度优先 递归查找node.expression.right 下所有的属性, 看是否有key为name 值为mfsu 或者 webpack5的属性
        const find = (node: any) => {
          for (const key in node) {
            if (Object.hasOwnProperty.call(node, key)) {
              const element = node[key];
              if (
                key === 'name' &&
                (element === 'mfsu' || element === 'webpack5')
              ) {
                return true;
              } else if (typeof element === 'object') {
                const result = find(element);
                if (result) {
                  return true;
                }
              }
            }
          }
          return false;
        };
        const result = find(node.expression.right);
        if (result) {
          haveWebpack5 = true;
          break;
        }
      }
    }
  } catch (error) {
    console.log('error: ', error);
    haveWebpack5 =
      (configContent.includes('webpack5:') &&
        !configContent.includes('// webpack5:') &&
        !configContent.includes('//webpack5:')) ||
      (configContent.includes('mfsu:') &&
        !configContent.includes('// mfsu:') &&
        !configContent.includes('//mfsu:'));
  }

  debug(`haveWebpack5: ${haveWebpack5}`);
  debug(`process.env.USE_WEBPACK_5: ${process.env.USE_WEBPACK_5}`);

  if (haveWebpack5 || process.env.USE_WEBPACK_5) {
    process.env.USE_WEBPACK_5 = '1';
    init(true);
  } else {
    init();
  }

  initRequreHook();
};
