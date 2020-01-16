import { IConfig } from '@umijs/types';

type env = 'development' | 'production';

interface IOpts {
  config: IConfig;
  env: 'development' | 'production';
  targets?: object;
}

const basicBabelLoaderOpts = {
  // Tell babel to guess the type, instead assuming all files are modules
  // https://github.com/webpack/webpack/issues/4039#issuecomment-419284940
  sourceType: 'unambiguous',
  babelrc: false,
  cacheDirectory: process.env.BABEL_CACHE !== 'none',
};

export function getBabelPresetOpts(opts: IOpts) {
  return {
    // @ts-ignore
    nodeEnv: opts.env,
    dynamicImportNode: opts.config.disableDynamicImport,
    autoCSSModules: true,
    svgr: true,
    env: {
      targets: opts.targets,
    },
    import: [],
  };
}

export function getBabelOpts({
  config,
  presetOpts,
}: {
  config: IConfig;
  presetOpts: object;
}) {
  return {
    ...basicBabelLoaderOpts,
    presets: [
      [require.resolve('@umijs/babel-preset-umi/app'), presetOpts],
      ...(config.extraBabelPresets || []),
    ],
    plugins: [...(config.extraBabelPlugins || [])].filter(Boolean),
  };
}

export function getBabelDepsOpts({ env }: { env: env }) {
  return {
    ...basicBabelLoaderOpts,
    presets: [
      [
        require.resolve('@umijs/babel-preset-umi/dependency', {
          // @ts-ignore
          nodeEnv: env,
        }),
      ],
    ],
  };
}
