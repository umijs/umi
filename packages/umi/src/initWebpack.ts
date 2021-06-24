import { init as initRequreHook } from '@umijs/bundler-webpack/lib/requireHook';
import { init } from '@umijs/deps/compiled/webpack';
import { createDebug } from '@umijs/utils';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

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

  // TODO: detect with ast
  const haveWebpack5 =
    (configContent.includes('webpack5:') &&
      !configContent.includes('// webpack5:') &&
      !configContent.includes('//webpack5:')) ||
    (configContent.includes('mfsu:') &&
      !configContent.includes('// mfsu:') &&
      !configContent.includes('//mfsu:'));

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
