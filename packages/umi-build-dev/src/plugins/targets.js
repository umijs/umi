import { join, relative } from 'path';
import { writeFileSync, readFileSync } from 'fs';
import Mustache from 'mustache';
import assert from 'assert';
import mkdirp from 'mkdirp';
import isPlainObject from 'is-plain-object';

export default function(api) {
  const { paths, winPath } = api;

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
    console.log('write tmp file');
    const tpl = readFileSync(
      join(__dirname, '../../template/polyfills.js.tpl'),
      'utf-8',
    );
    const result = Mustache.render(tpl, {
      url:
        api.config.targets &&
        api.config.targets.ie &&
        api.config.targets.ie <= 11,
      url_polyfill_path: winPath(
        relative(paths.absTmpDirPath, require.resolve('url-polyfill')),
      ),
    });
    console.log(2, join(paths.absTmpDirPath, 'polyfills.js'), result);
    mkdirp.sync(paths.absTmpDirPath);
    writeFileSync(join(paths.absTmpDirPath, 'polyfills.js'), result, 'utf-8');
  }
  writeTmpFile();

  api.addEntryPolyfillImports(() => [
    {
      source: './polyfills',
    },
  ]);

  api.chainWebpackConfig(config => {
    config.resolve.alias.set(
      '@babel/polyfill',
      require.resolve('@babel/polyfill'),
    );
  });
}
