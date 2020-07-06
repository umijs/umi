import {
  IConfig,
  ITargets,
  BundlerConfigType,
  IBundlerConfigType,
} from '@umijs/types';

interface IOpts {
  config: IConfig;
  type: IBundlerConfigType;
}

/**
 * set default browserslist using `targets` config
 * client bundle: without node
 * server bundle: `targets` with node, `browserslist` without node
 *
 * @param param0
 */
export default function ({ config, type }: IOpts) {
  const configTargets: ITargets = config.targets || {};

  const targets = Object.keys(configTargets)
    .filter((key) => {
      // filter false and 0 targets
      if (configTargets[key] === false) return false;
      if (type === BundlerConfigType.ssr) {
        return key === 'node';
      }
      return key !== 'node';
    })
    .reduce((memo, key) => {
      memo[key] = configTargets[key];
      return memo;
    }, {} as any);

  const browserTargets = Object.keys(configTargets)
    .filter((key) => {
      // filter false and 0 targets
      if (configTargets[key] === false) return false;
      return key !== 'node';
    })
    .reduce((memo, key) => {
      memo[key] = configTargets[key];
      return memo;
    }, {} as any);
  const browserslist =
    configTargets.browsers ||
    Object.keys(browserTargets).map((key) => {
      return `${key} >= ${
        browserTargets[key] === true ? '0' : browserTargets[key]
      }`;
    });

  return {
    targets,
    browserslist,
  };
}
