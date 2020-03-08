module.exports = function(context, opts) {
  return {
    presets: [
      [
        require('./lib').default,
        require('@umijs/utils').deepmerge(
          {
            typescript: true,
            react: true,
            env: {
              targets: {
                node: 'current',
              },
              modules: 'commonjs',
            },
          },
          opts,
        ),
      ],
    ],
  };
};
