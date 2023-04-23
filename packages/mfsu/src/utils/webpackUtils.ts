import { Configuration, util as webpackUtil } from 'webpack';
import { lodash } from '@umijs/utils';
import enhancedResolve from 'enhanced-resolve';

const { property, compact, flatMap } = lodash;

export function extractBabelPluginImportOptions(
  webpackConfig: Configuration,
): Map<string, any> {
  const rules = webpackConfig.module?.rules || [];

  const uses = compact(flatMap(rules, property(['use']))).filter(
    (u: any) => u?.loader?.indexOf('babel-loader') >= 0,
  );

  const pluginConfigs = compact(
    flatMap(uses, property(['options', 'plugins'])),
  ).filter(
    (p) => Array.isArray(p) && p[0]?.indexOf?.('babel-plugin-import') >= 0,
  );

  const configs: Map<string, any> = new Map();

  for (const c of pluginConfigs) {
    // @ts-ignore
    !configs.has(c[1].libraryName) && configs.set(c[1].libraryName, c[1]);
  }

  return configs;
}

export function getResolver(opts: Configuration) {
  const context = opts.context ?? process.cwd();
  const resolveDefaults = {
    extensions: ['.tsx', '.ts', '.jsx', '.js'], // keep same with previous mfsu version
    roots: [context],
  };

  const mergedResolve = webpackUtil.cleverMerge(resolveDefaults, opts.resolve);
  const resolver = enhancedResolve.create.sync(mergedResolve);

  return (path: string) => {
    return resolver(context, path);
  };
}
