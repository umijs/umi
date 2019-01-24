import { join, relative } from 'path';
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
      };
    };
  });

  function writeTmpFile() {
    const tpl = readFileSync(
      join(__dirname, '../../template/polyfills.js.tpl'),
      'utf-8',
    );
    const result = api.Mustache.render(tpl, {
      url:
        api.config.targets &&
        api.config.targets.ie &&
        api.config.targets.ie <= 11,
      url_polyfill_path: winPath(
        relative(paths.absTmpDirPath, require.resolve('url-polyfill')),
      ),
    });
    api.debug(`write tmp file: polyfills.js, content: ${result}`);
    api.writeTmpFile('polyfills.js', result);
  }

  api.onGenerateFiles(() => {
    writeTmpFile();
  });

  api.addEntryPolyfillImports(() => {
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
    config.resolve.alias.set(
      '@babel/polyfill',
      require.resolve('@babel/polyfill'),
    );
  });
}
