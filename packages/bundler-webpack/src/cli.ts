import {
  BabelRegister,
  compatESModuleRequire,
  getFile,
  rimraf,
  yParser,
} from '@umijs/utils';
import { basename, extname, join } from 'path';
import assert from 'assert';
import { Bundler } from './index';
import { existsSync } from 'fs';
import { ConfigType } from './enums';

const args = yParser(process.argv.slice(2), {
  alias: {
    version: ['v'],
    help: ['h'],
  },
  boolean: ['version'],
});

const cwd = join(process.cwd(), args.cwd || '');
const env = args.env || 'production';
process.env.NODE_ENV = env;

(async () => {
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

  const configPath = join(cwd, args.config || 'config.ts');
  const babelRegister = new BabelRegister();
  babelRegister.setOnlyMap({
    key: 'config',
    value: [configPath],
  });
  const config = existsSync(configPath)
    ? compatESModuleRequire(require(configPath))
    : {};

  const bundler = new Bundler({
    cwd,
    config,
  });

  const webpackConfig = bundler.getConfig({
    env,
    type: ConfigType.csr,
    entry: {
      [basename(entry, extname(entry))]: entry,
    },
  });

  rimraf.sync(join(cwd, 'dist'));
  const { stats } = await bundler.build({
    bundleConfigs: [webpackConfig],
  });
  console.log(stats.toString('normal'));
})();
