import { Server } from '@umijs/server';
import { BundlerConfigType } from '@umijs/types';
import {
  BabelRegister,
  chalk,
  compatESModuleRequire,
  getFile,
  portfinder,
  rimraf,
  yParser,
} from '@umijs/utils';
import assert from 'assert';
import { existsSync } from 'fs';
import { basename, extname, join } from 'path';
import DevCompileDonePlugin from './DevCompileDonePlugin';
import { Bundler } from './index';

const args = yParser(process.argv.slice(2), {
  alias: {
    version: ['v'],
    help: ['h'],
  },
  boolean: ['version'],
});

const command = args._[0];
const cwd = join(process.cwd(), args.cwd || '');
const env = args.env || (command === 'dev' ? 'development' : 'production');
process.env.NODE_ENV = env;

if (args.version && !command) {
  args._[0] = 'version';
  const local = existsSync(join(__dirname, '../.local'))
    ? chalk.cyan('@local')
    : '';
  console.log(`bundler-webpack@${require('../package.json').version}${local}`);
  process.exit(0);
}

(async () => {
  const configPath = join(cwd, args.config || 'config.ts');
  const babelRegister = new BabelRegister();
  babelRegister.setOnlyMap({
    key: 'config',
    value: [configPath],
  });
  const config = existsSync(configPath)
    ? compatESModuleRequire(require(configPath))
    : {};

  let entry: string = args.entry;
  if (entry) {
    entry = join(cwd, entry);
  } else {
    const files = [
      getFile({
        base: cwd,
        fileNameWithoutExt: 'src/index',
        type: 'javascript',
      }),
      getFile({
        base: cwd,
        fileNameWithoutExt: 'index',
        type: 'javascript',
      }),
    ].filter(Boolean);
    assert(files.length, `Can't find the default entry.`);
    entry = files[0]?.path!;
  }

  const bundler = new Bundler({
    cwd,
    config,
  });

  // @ts-ignore
  const webpackConfig = await bundler.getConfig({
    env,
    type: BundlerConfigType.csr,
    hot: args.hot,
    entry: config.entry || {
      [basename(entry, extname(entry))]: entry,
    },
  });

  if (command === 'build') {
    rimraf.sync(join(cwd, 'dist'));
    const { stats } = await bundler.build({
      bundleConfigs: [webpackConfig],
    });
    // @ts-ignore
    console.log(stats.toString('normal'));
  } else if (command === 'dev') {
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
  } else {
    throw new Error(`Unsupported command ${command}.`);
  }
})();
