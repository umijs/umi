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
        require.resolve('@umijs/babel-preset-umi/app', {
          // @ts-ignore
          nodeEnv: env,
        }),
      ],
      ...(config.extraBabelPresets || []),
    ],
    plugins: [
      [
        require.resolve('babel-plugin-named-asset-import'),
        {
          loaderMap: {
            svg: {
              ReactComponent: `${require.resolve(
                '@svgr/webpack',
              )}?-svgo,+titleProp,+ref![path]`,
            },
          },
        },
      ],
      [require.resolve('@umijs/babel-plugin-css-modules'), {}],
      ...(config.extraBabelPlugins || []),
    ],
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
