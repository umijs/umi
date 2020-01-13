import { IConfig, ITargets } from '@umijs/types';
import { ConfigType } from '../enums';

interface IOpts {
  config: IConfig;
  type: ConfigType;
}

export default function({ config, type }: IOpts) {
  let targets: ITargets = {
    node: true,
    chrome: 49,
    firefox: 64,
    safari: 10,
    edge: 13,
    ios: 10,
    ...config.targets,
  };

  targets = Object.keys(targets)
    .filter(key => {
      // filter false and 0 targets
      if (targets[key] === false) return false;
      if (type === ConfigType.ssr) return key === 'node';
      else return key !== 'node';
    })
    .reduce((memo, key) => {
      memo[key] = targets[key];
      return memo;
    }, {} as any);

  const browserslist =
    targets.browsers ||
    Object.keys(targets).map(key => {
      return `${key} >= ${targets[key] === true ? '0' : targets[key]}`;
    });

  return {
    targets,
    browserslist,
  };
}
