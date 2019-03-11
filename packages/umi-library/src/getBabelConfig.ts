interface IGetBabelConfigOpts {
  target: 'browser' | 'node';
  type?: 'esm' | 'cjs';
  typescript: boolean;
  runtimeHelpers?: boolean;
}

export default function(opts: IGetBabelConfigOpts) {
  const { target, typescript, type, runtimeHelpers } = opts;
  const isBrowser = target === 'browser';
  const targets = isBrowser
    ? { browsers: ['last 2 versions', 'IE 10'] }
    : { node: 6 };

  return {
    presets: [
      ...(typescript ? [require.resolve('@babel/preset-typescript')] : []),
      [
        require.resolve('@babel/preset-env'),
        { targets, modules: type === 'esm' ? false : 'auto' },
      ],
      ...(isBrowser ? [require.resolve('@babel/preset-react')] : []),
    ],
    plugins: [
      require.resolve('babel-plugin-react-require'),
      require.resolve('@babel/plugin-syntax-dynamic-import'),
      require.resolve('@babel/plugin-proposal-export-default-from'),
      require.resolve('@babel/plugin-proposal-export-namespace-from'),
      require.resolve('@babel/plugin-proposal-do-expressions'),
      [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
      [
        require.resolve('@babel/plugin-proposal-class-properties'),
        { loose: true },
      ],
      ...(runtimeHelpers
        ? [
            [
              require.resolve('@babel/plugin-transform-runtime'),
              { useESModules: true },
            ],
          ]
        : []),
    ],
  };
}
