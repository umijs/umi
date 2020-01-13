import { IConfig } from '@umijs/types';

interface IOpts {
  config: IConfig;
  env: 'development' | 'production';
}

const basicBabelLoaderOpts = {
  // Tell babel to guess the type, instead assuming all files are modules
  // https://github.com/webpack/webpack/issues/4039#issuecomment-419284940
  sourceType: 'unambiguous',
  babelrc: false,
  cacheDirectory: process.env.BABEL_CACHE !== 'none',
};

export function getBabelOpts({ config, env }: IOpts) {
  return {
    ...basicBabelLoaderOpts,
    presets: [
      [
        require.resolve('@umijs/babel-preset-umi/app'),
        {
          // @ts-ignore
          nodeEnv: env,
          dynamicImportNode: config.disableDynamicImport,
          autoCSSModules: true,
          svgr: true,
        },
      ],
      ...(config.extraBabelPresets || []),
    ],
    plugins: [...(config.extraBabelPlugins || [])].filter(Boolean),
  };
}

export function getBabelDepsOpts({ env }: IOpts) {
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
