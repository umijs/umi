import { join } from 'path';
import { readdirSync, readFileSync, statSync } from 'fs';
import { getFile, rimraf } from '@umijs/utils';
import { Bundler } from './index';
import { ConfigType } from './enums';

const fixtures = join(__dirname, 'fixtures');

readdirSync(fixtures).forEach(fixture => {
  const cwd = join(fixtures, fixture);
  if (fixture.startsWith('.')) return;
  if (statSync(cwd).isFile()) return;

  test(fixture, async () => {
    // get user config
    let config = {};
    try {
      config = require(join(cwd, 'config.ts')).default;
    } catch (e) {}

    // init bundler
    const bundler = new Bundler({
      config,
      cwd,
    });

    // get config
    const webpackConfig = bundler.getConfig({
      env: 'development',
      type: ConfigType.csr,
    });
    webpackConfig.entry = {
      index: getFile({
        base: cwd,
        fileNameWithoutExt: 'index',
        type: 'javascript',
      })!.path,
    };
    webpackConfig.devtool = false;

    // build
    rimraf.sync(join(cwd, 'dist'));
    await bundler.build({
      bundleConfigs: [webpackConfig],
    });

    // expect
    require(join(cwd, 'expect.ts')).default({
      indexContent: readFileSync(join(cwd, 'dist/index.js'), 'utf-8'),
      files: readdirSync(join(cwd, 'dist')).filter(f => f.charAt(0) !== '.'),
      cwd,
    });
  });
});
