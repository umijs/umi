import { statSync, existsSync } from 'fs';

function getAliasPathWithKey(alias, key) {
  const thePath = alias[key];
  if (alias[thePath]) {
    return getAliasPathWithKey(alias, thePath);
  }
  return thePath;
}

export default function(api) {
  api.registerCommand(
    'test',
    {
      webpack: true,
      description: 'run test files *.test.js and *.e2e.js',
    },
    (args = {}) => {
      const { alias } = api.webpackConfig.resolve;
      const moduleNameMapper = Object.keys(alias).reduce((memo, key) => {
        if (key !== 'react' && key !== 'react-dom') {
          const aliasPath = getAliasPathWithKey(alias, key);
          if (existsSync(aliasPath) && statSync(aliasPath).isDirectory()) {
            memo[`^${key}/(.*)$`] = `${aliasPath}/$1`;
            memo[`^${key}$`] = aliasPath;
          } else {
            memo[`^${key}$`] = aliasPath;
          }
        }
        return memo;
      }, {});

      args._ = args._.slice(1);
      require('umi-test').default({
        cwd: api.cwd,
        moduleNameMapper,
        ...args,
      });
    },
  );
}
