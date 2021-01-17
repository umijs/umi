import { IConfig } from '@umijs/types';
import { winPath } from '@umijs/utils';
import { existsSync } from 'fs';
import { join } from 'path';

type env = 'development' | 'production';

interface IOpts {
  config: IConfig;
  env: 'development' | 'production';
  targets?: object;
}

function getBasicBabelLoaderOpts({ cwd }: { cwd: string }) {
  const prefix = existsSync(join(cwd, 'src')) ? join(cwd, 'src') : cwd;
  return {
    // Tell babel to guess the type, instead assuming all files are modules
    // https://github.com/webpack/webpack/issues/4039#issuecomment-419284940
    sourceType: 'unambiguous',
    babelrc: false,
    cacheDirectory:
      process.env.BABEL_CACHE !== 'none'
        ? winPath(`${prefix}/.umi/.cache/babel-loader`)
        : false,
  };
}

export function getBabelPresetOpts(opts: IOpts) {
  const { config } = opts;
  return {
    // @ts-ignore
    nodeEnv: opts.env,
    dynamicImportNode: !config.dynamicImport && !config.dynamicImportSyntax,
    autoCSSModules: true,
    svgr: true,
    env: {
      targets: opts.targets,
    },
    import: [],
  };
}

export function getBabelOpts({
  cwd,
  config,
  presetOpts,
}: {
  cwd: string;
  config: IConfig;
  presetOpts: object;
}) {
  return {
    ...getBasicBabelLoaderOpts({ cwd }),
    presets: [
      [require.resolve('@umijs/babel-preset-umi/app'), presetOpts],
      ...(config.extraBabelPresets || []),
    ],
    plugins: [...(config.extraBabelPlugins || [])].filter(Boolean),
  };
}

export function getBabelDepsOpts({
  env,
  cwd,
  config,
}: {
  env: env;
  cwd: string;
  config: IConfig;
}) {
  return {
    ...getBasicBabelLoaderOpts({ cwd }),
    presets: [
      [
        require.resolve('@umijs/babel-preset-umi/dependency'),
        {
          nodeEnv: env,
          dynamicImportNode:
            !config.dynamicImport && !config.dynamicImportSyntax,
        },
      ],
    ],
  };
}
