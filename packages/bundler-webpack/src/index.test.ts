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

  const fn = fixture.includes('-only')
    ? test.only
    : fixture.startsWith('x-')
    ? xtest
    : test;
  fn(fixture, async () => {
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
    const env = fixture.includes('-production') ? 'production' : 'development';
    const webpackConfig = bundler.getConfig({
      env,
      type: ConfigType.csr,
      entry: {
        index: getFile({
          base: cwd,
          fileNameWithoutExt: 'index',
          type: 'javascript',
        })!.path,
      },
    });
    webpackConfig.devtool = false;

    // build
    rimraf.sync(join(cwd, 'dist'));
    await bundler.build({
      bundleConfigs: [webpackConfig],
    });

    // expect
    let indexCSS = '';
    try {
      indexCSS = readFileSync(join(cwd, 'dist/index.css'), 'utf-8');
    } catch (e) {}
    require(join(cwd, 'expect.ts')).default({
      indexJS: readFileSync(join(cwd, 'dist/index.js'), 'utf-8'),
      indexCSS,
      files: readdirSync(join(cwd, 'dist')).filter(f => f.charAt(0) !== '.'),
      cwd,
    });
  });
});
