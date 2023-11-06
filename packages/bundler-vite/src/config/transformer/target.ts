import type { IConfigProcessor } from '.';
import legacyPlugin from '../../../compiled/@vitejs/plugin-legacy';
import * as lite from '../../../compiled/caniuse-lite';
import { getBrowserlist } from './css';

/**
 * transform umi targets to vite build.target
 */
export default (function target(userConfig) {
  const config: ReturnType<IConfigProcessor> = { build: {}, plugins: [] };
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

  const isLegacy = isLegacyBrowser(userConfig.targets);

  // convert { ie: 11 } to ['ie11']
  // 低版本浏览器需要使用 legacy 插件 同时设置会有 warning
  if (typeof userConfig.targets === 'object' && !isLegacy) {
    config.build!.target = Object.entries(userConfig.targets)
      .filter(([name]) => {
        // refer: https://esbuild.github.io/api/#target
        return ['chrome', 'edge', 'firefox', 'node', 'safari'].includes(name);
      })
      .map(([name, ver]) => `${name}${ver}`);
  }

  if (userConfig.targets && isLegacy) {
    const legacyOpts: any = {
      targets: getBrowserlist(userConfig.targets),
      // 需要有值 否则无法生成 systemjs
      polyfills: ['es.promise.finally'],
      ignoreBrowserslistConfig: true,
      ...userConfig.viteLegacy,
    };

    config.plugins!.push(legacyPlugin(legacyOpts));
  }
  return config;
} as IConfigProcessor);
