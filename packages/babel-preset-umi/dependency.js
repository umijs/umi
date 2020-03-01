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
            transformRuntime: {},
          },
          opts,
        ),
      ],
    ],
  };
};
