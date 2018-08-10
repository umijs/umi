export default function(context, opts = {}) {
  const env = process.env.NODE_ENV;

  const plugins = [
    // adds React import declaration if file contains JSX tags
    require.resolve('babel-plugin-react-require'),
    require.resolve('@babel/plugin-syntax-dynamic-import'),
    require.resolve('@babel/plugin-proposal-object-rest-spread'),
    require.resolve('@babel/plugin-proposal-optional-catch-binding'),
    require.resolve('@babel/plugin-proposal-async-generator-functions'),
    [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
    [
      require.resolve('@babel/plugin-proposal-class-properties'),
      { loose: true },
    ],
    require.resolve('@babel/plugin-proposal-export-namespace-from'),
    require.resolve('@babel/plugin-proposal-export-default-from'),
    require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
    require.resolve('@babel/plugin-proposal-optional-chaining'),
    [
      require.resolve('@babel/plugin-proposal-pipeline-operator'),
      {
        proposal: 'minimal',
      },
    ],
    require.resolve('@babel/plugin-proposal-do-expressions'),
    require.resolve('@babel/plugin-proposal-function-bind'),
  ];

  if (env !== 'test' && !opts.disableTransform) {
    plugins.push(require.resolve('@babel/plugin-transform-runtime'));
  }
  if (env === 'production') {
    plugins.push(
      require.resolve('babel-plugin-transform-react-remove-prop-types'),
    );
  }

  const browsers = opts.browsers || ['last 2 versions'];
  return {
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          targets: opts.targets || { browsers },
          debug: opts.debug,
          useBuiltIns: opts.useBuiltIns,
          modules: 'commonjs',
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
        },
      ],
      require.resolve('@babel/preset-react'),
    ],
    plugins,
  };
}
