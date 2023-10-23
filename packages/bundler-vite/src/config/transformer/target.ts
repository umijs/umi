import { lodash } from '@umijs/utils';
import type { IConfigProcessor } from '.';
import legacyPlugin from '../../../compiled/@vitejs/plugin-legacy';
import * as lite from '../../../compiled/caniuse-lite';
import { getBrowserlist } from './css';

/**
 * transform umi targets to vite build.target
 */
export default (function target(userConfig) {
  const config: ReturnType<IConfigProcessor> = { build: {}, plugins: [] };
  const userTargets = userConfig.targets;
  if (lodash.isEmpty(userTargets)) {
    return config;
  }

  const { features, feature: unpackFeature } = lite;
  const { stats } = unpackFeature(features['es6-module']);

  // targets: {} => false
  // targets: { edge: 11 } => true
  // targets: { edge: 20 } => false
  // refer: https://caniuse.com/?search=esm
  function isLegacyBrowser(targets: Record<string, number>) {
    for (const browserName of Object.keys(targets)) {
      const version = targets[browserName];
      if (version && stats[browserName]?.[version] === 'n') {
        return true;
      }
    }
    return false;
  }

  const isLegacy = isLegacyBrowser(userTargets);

  // convert { ie: 11 } to ['ie11']
  // 低版本浏览器需要使用 legacy 插件 同时设置会有 warning
  if (lodash.isObject(userTargets) && !isLegacy) {
    config.build!.target = Object.entries(userTargets)
      .filter(([name]) => {
        // refer: https://esbuild.github.io/api/#target
        return ['chrome', 'edge', 'firefox', 'node', 'safari'].includes(name);
      })
      .map(([name, ver]) => `${name}${ver}`);
  }

  if (userTargets && isLegacy) {
    const legacyOpts: any = {
      targets: getBrowserlist(userTargets),
      // 需要有值 否则无法生成 systemjs
      polyfills: ['es.promise.finally'],
      ignoreBrowserslistConfig: true,
      ...userConfig.viteLegacy,
    };

    config.plugins!.push(legacyPlugin(legacyOpts));
  }
  return config;
} as IConfigProcessor);
