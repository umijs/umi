module.exports = function(opts) {
  const { nodeEnv } = opts;
  delete opts['nodeEnv'];

  return {
    presets: [
      [
        require('./lib').default,
        require('@umijs/utils').deepmerge(
          {
            env: {
              useBuiltIns: 'entry',
              corejs: 3,
              modules: false,
            },
            react: {
              development: nodeEnv === 'development',
            },
            transformRuntime: {},
            reactRemovePropTypes: nodeEnv === 'production',
          },
          opts,
        ),
      ],
    ],
  };
};
