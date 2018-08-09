export default function(api) {
  const { service } = api;
  api.registerCommand(
    'test',
    {
      webpack: true,
    },
    (args = {}) => {
      const { alias } = service.webpackConfig.resolve;
      const newAlias = Object.keys(alias).reduce((memo, key) => {
        if (key !== 'react' && key !== 'react-dom') {
          memo[key] = alias[key];
        }
        return memo;
      }, {});
      require('umi-test').default({
        ...args,
        moduleNameMapper: newAlias,
        watch: args.w || args.watch,
      });
    },
  );
}
