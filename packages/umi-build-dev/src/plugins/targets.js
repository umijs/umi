import { join, relative, dirname } from 'path';
import { readFileSync } from 'fs';
import chalk from 'chalk';
import { isPlainObject } from 'lodash';
import assert from 'assert';

export default function(api) {
  const { paths, winPath, log } = api;

  api._registerConfig(() => {
    return () => {
      return {
        name: 'targets',
        validate(val) {
          assert(
            isPlainObject(val),
            `Configure item targets should be Plain Object, but got ${val}.`,
          );
        },
        onChange() {
          api.service.restart(/* why */ 'Config targets Changed');
        },
        type: 'object',
        default: {
          chrome: 49,
          firefox: 64,
          safari: 10,
          edge: 13,
          ios: 10,
        },
        choices: ['chrome', 'opera', 'edge', 'firefox', 'safari', 'ie', 'ios', 'android'],
        group: 'webpack',
        title: {
          'zh-CN': '浏览器兼容性',
          'en-US': 'Browser Compatibility',
        },
        description: {
          'zh-CN': '选择需要兼容的浏览器最低版本，会自动引入 Polyfill 和做语法转换。',
          'en-US': 'The minimum version of browsers you want to compatible with.',
        },
      };
    };
  });

  function writeTmpFile() {
    const tpl = readFileSync(join(__dirname, '../../template/polyfills.js.tpl'), 'utf-8');
    const result = api.Mustache.render(tpl, {
      url: api.config.targets && api.config.targets.ie && api.config.targets.ie <= 11,
      url_polyfill_path: winPath(relative(paths.absTmpDirPath, require.resolve('url-polyfill'))),
    });
    api.debug(`write tmp file: polyfills.js, content: ${result}`);
    api.writeTmpFile('polyfills.js', result);
  }

  api.onGenerateFiles(() => {
    writeTmpFile();
  });

  api.addEntryPolyfillImports(() => {
    // BABEL_POLYFILL 的判断得放里面，允许插件里通过此环境变量禁用内置的补丁方案
    if (process.env.BABEL_POLYFILL !== 'none') {
      return [
        {
          source: './polyfills',
        },
      ];
    } else {
      log.warn(
        chalk.yellow(
          `Since you have configured the environment variable ${chalk.bold(
            'BABEL_POLYFILL',
          )} to none, no patches will be included.`,
        ),
      );
      return [];
    }
  });

  api.chainWebpackConfig(config => {
    if (process.env.BABEL_POLYFILL !== 'none') {
      // 不启用 BABEL_POLYFILL 时不锁 regenerator-runtime
      config.resolve.alias.set(
        'regenerator-runtime',
        dirname(require.resolve('regenerator-runtime/package')),
      );
    }
  });
}
