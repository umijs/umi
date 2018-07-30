const env = process.env.NODE_ENV;

export default function(context, opts = {}) {
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
    require.resolve('@babel/plugin-proposal-export-namespace'),
    require.resolve('@babel/plugin-proposal-export-default'),
    require.resolve('@babel/plugin-proposal-export-namespace-from'),
    require.resolve('@babel/plugin-proposal-export-default-from'),
    require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
    require.resolve('@babel/plugin-proposal-optional-chaining'),
    require.resolve('@babel/plugin-proposal-pipeline-operator'),
    require.resolve('@babel/plugin-proposal-do-expressions'),
    require.resolve('@babel/plugin-proposal-function-bind'),
  ];

  if (opts.commonjs) {
    plugins.push(require.resolve('@babel/plugin-transform-modules-commonjs'));
  }

  if (env !== 'test' && !opts.disableTransform) {
    plugins.push(require.resolve('@babel/plugin-transform-runtime'));
  }

  if (env === 'production') {
    plugins.push.apply(plugins, [
      require.resolve('babel-plugin-transform-react-remove-prop-types'),
    ]);
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
          modules: false,
          exclude: [
            'transform-typeof-symbol',
            'transform-unicode-regex',
            'transform-sticky-regex',
            'transform-object-super',
            'transform-new-target',
            'transform-modules-umd',
            'transform-modules-systemjs',
            'transform-modules-amd',
            'transform-literals',
            'transform-duplicate-keys',
          ],
        },
      ],
      require.resolve('@babel/preset-react'),
    ],
    plugins,
  };
}
