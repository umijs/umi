import { Server } from '@umijs/server';
import { BundlerConfigType } from '@umijs/types';
import { getFile, portfinder, rimraf } from '@umijs/utils';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import DevCompileDonePlugin from './DevCompileDonePlugin';
import { Bundler } from './index';

const fixtures = join(__dirname, 'fixtures');

readdirSync(fixtures).forEach((fixture) => {
  const cwd = join(fixtures, fixture);
  if (fixture.startsWith('.')) return;
  if (statSync(cwd).isFile()) return;

  const fn = fixture.includes('-only')
    ? describe.only
    : fixture.startsWith('x-')
    ? xdescribe
    : describe;
  fn(fixture, () => {
    // get user config
    let config = {
      outputPath: 'dist',
    };
    try {
      config = Object.assign(
        {},
        config,
        require(join(cwd, 'config.ts')).default,
      );
    } catch (e) {}
    // init bundler
    const bundler = new Bundler({
      config,
      cwd,
    });

    beforeAll(async () => {
      // get config
      const env = fixture.includes('-production')
        ? 'production'
        : 'development';
      const webpackConfig = await bundler.getConfig({
        env,
        type: BundlerConfigType.csr,
        entry: {
          index: getFile({
            base: cwd,
            fileNameWithoutExt: 'index',
            type: 'javascript',
          })!.path,
        },
      });

      // build
      rimraf.sync(join(cwd, 'dist'));
      await bundler.build({
        bundleConfigs: [webpackConfig],
      });
    }, 100000);

    it(fixture, () => {
      // expect
      let indexCSS = '';
      let indexCSSMap = '';
      try {
        indexCSS = readFileSync(
          join(cwd, config.outputPath, 'index.css'),
          'utf-8',
        );
        indexCSSMap = readFileSync(
          join(cwd, config.outputPath, 'index.css.map'),
          'utf-8',
        );
      } catch (e) {}
      require(join(cwd, 'expect.ts')).default({
        indexJS: readFileSync(
          join(cwd, config.outputPath, 'index.js'),
          'utf-8',
        ),
        indexCSS,
        indexCSSMap,
        files: readdirSync(join(cwd, config.outputPath)).filter(
          (f) => f.charAt(0) !== '.',
        ),
        cwd,
        ignored: bundler.getIgnoredWatchRegExp(),
      });
    });
  });
});

// TODO:
// Module '/private/tmp/sorrycc-Vtm508/umi-next/node_modules/babel-loader/lib/index.js' is not a loader
test.skip('dev', async () => {
  const cwd = join(fixtures, 'alias');

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
  const webpackConfig = await bundler.getConfig({
    env: 'development',
    type: BundlerConfigType.csr,
    entry: {
      index: getFile({
        base: cwd,
        fileNameWithoutExt: 'index',
        type: 'javascript',
      })!.path,
    },
  });
  const port = await portfinder.getPortPromise({
    port: 8000,
  });
  // @ts-ignore
  webpackConfig.plugins!.push(new DevCompileDonePlugin({ port }));
  const devServerOpts = bundler.setupDevServerOpts({
    bundleConfigs: [webpackConfig],
  });
  const server = new Server({
    ...devServerOpts,
    compress: true,
    headers: {
      'access-control-allow-origin': '*',
    },
  });
  await server.listen({
    port,
    hostname: '127.0.0.1',
  });
  process.on('message', (message) => {
    console.log('message', message);
  });
});
