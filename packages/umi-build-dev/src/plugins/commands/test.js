import { statSync } from 'fs';

export default function(api) {
  api.registerCommand(
    'test',
    {
      webpack: true,
    },
    (args = {}) => {
      const { alias } = api.webpackConfig.resolve;
      const moduleNameMapper = Object.keys(alias).reduce((memo, key) => {
        if (key !== 'react' && key !== 'react-dom') {
          if (statSync(alias[key]).isDirectory()) {
            memo[`^${key}/(.*)$`] = `${alias[key]}/$1`;
            memo[`^${key}$`] = alias[key];
          } else {
            memo[`^${key}$`] = alias[key];
          }
        }
        return memo;
      }, {});

      require('umi-test').default({
        ...args,
        moduleNameMapper,
        watch: args.w || args.watch,
      });
    },
  );
}
