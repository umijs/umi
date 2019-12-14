import { mergeConfig } from '@umijs/utils';

interface IOpts {
  typescript?: boolean;
  react?: boolean;
  debug?: boolean;
  env?: object;
  plugins?: {};
}

export default (context: any, opts: IOpts = {}) => {
  const defaultEnvConfig = {
    exclude: [
      'transform-typeof-symbol',
      'transform-unicode-regex',
      'transform-sticky-regex',
      'transform-new-target',
      'transform-modules-umd',
      'transform-modules-systemjs',
      'transform-modules-amd',
      'transform-literals',
    ],
  };

  return {
    presets: [
      [
        require('@babel/preset-env').default,
        {
          ...mergeConfig(defaultEnvConfig, opts.env || {}),
          debug: opts.debug,
        },
      ],
      opts.react && [require('@babel/preset-react').default],
      opts.typescript && [require('@babel/preset-typescript').default],
    ].filter(Boolean),
    plugins: [],
  };
};
