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

export default function ({ config, type }: IOpts) {
  let targets: ITargets = config.targets || {};

  targets = Object.keys(targets)
    .filter((key) => {
      // filter false and 0 targets
      if (targets[key] === false) return false;
      else return key !== 'node';
    })
    .reduce((memo, key) => {
      memo[key] = targets[key];
      return memo;
    }, {} as any);

  const browserslist =
    targets.browsers ||
    Object.keys(targets).map((key) => {
      return `${key} >= ${targets[key] === true ? '0' : targets[key]}`;
    });

  // targets ssr
  if (type === BundlerConfigType.ssr) {
    targets = Object.keys(targets)
      .filter((key) => key === 'node')
      .reduce((memo, key) => {
        memo[key] = targets[key];
        return memo;
      }, {} as any);
  }

  return {
    targets,
    browserslist,
  };
}
