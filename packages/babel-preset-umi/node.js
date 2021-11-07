const { semver } = require('@umijs/utils')

const isReact17 = () => {
  let _react;
  try {
    _react = require(require.resolve('react', {paths: [api.cwd]}));
  } catch (e) {
  }
  return (
    semver.valid(_react && _react.version) &&
    semver.gte(_react.version, '17.0.0-alpha.0')
  );
};

module.exports = function (api, opts) {
  return {
    presets: [
      [
        require('./lib').default,
        require('@umijs/utils').deepmerge(
          {
            typescript: true,
            react: isReact17() ? {runtime: 'automatic'} : true,
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
