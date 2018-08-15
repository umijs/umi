import { statSync, existsSync } from 'fs';

function getAliasPathWith(alias, key) {
  const thePath = alias[key];
  if (alias[thePath]) {
    return getAliasPathWith(alias, thePath);
  }
  return thePath;
}

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
          const aliasPath = getAliasPathWith(alias, key);
          if (existsSync(aliasPath) && statSync(aliasPath).isDirectory()) {
            memo[`^${key}/(.*)$`] = `${aliasPath}/$1`;
            memo[`^${key}$`] = aliasPath;
          } else {
            memo[`^${key}$`] = aliasPath;
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
