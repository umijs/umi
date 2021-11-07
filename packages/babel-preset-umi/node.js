const { semver } = require('@umijs/utils')

const isReact17 = () => {
  let react;
  try {
    react = require(require.resolve('react', {paths: [api.cwd]}));
  } catch (e) {
  }
  return (
    semver.valid(react.version) &&
    semver.gte(react.version, '17.0.0-alpha.0')
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
