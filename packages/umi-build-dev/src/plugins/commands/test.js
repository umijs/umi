import { statSync, existsSync } from 'fs';
import getRouteManager from './getRouteManager';
import getFilesGenerator from './getFilesGenerator';

function getAliasPathWithKey(alias, key) {
  const thePath = alias[key];
  if (alias[thePath]) {
    return getAliasPathWithKey(alias, thePath);
  }
  return thePath;
}

function genTmpDir(service, config, debug) {
  debug('test required to generate absTmpDirPath');
  const RoutesManager = getRouteManager(service);
  RoutesManager.fetchRoutes();

  const filesGenerator = getFilesGenerator(service, {
    RoutesManager,
    mountElementId: config.mountElementId,
  });
  debug('generate files');
  filesGenerator.generate();
}

export default function(api) {
  const { service, config, paths, debug } = api;
  api.registerCommand(
    'test',
    {
      webpack: true,
      description: 'run test files *.test.js and *.e2e.js',
    },
    (args = {}) => {
      const { alias } = api.webpackConfig.resolve;
      const moduleNameMapper = Object.keys(alias).reduce((memo, key) => {
        const aliasPath = getAliasPathWithKey(alias, key);
        if (existsSync(aliasPath) && statSync(aliasPath).isDirectory()) {
          memo[`^${key}/(.*)$`] = `${aliasPath}/$1`;
          memo[`^${key}$`] = aliasPath;
        } else {
          memo[`^${key}$`] = aliasPath;
        }
        return memo;
      }, {});
      debug('moduleNameWrapper');
      debug(moduleNameMapper);

      if (!existsSync(paths.absTmpDirPath)) {
        genTmpDir(service, config, debug);
      }

      args._ = args._.slice(1);
      if (args.w) args.watch = args.w;
      require('umi-test')
        .default({
          moduleNameMapper,
          ...args,
        })
        .catch(e => {
          debug(e);
          process.exit(1);
        });
    },
  );
}
