import type { IConfigProcessor } from '.';
import type { Options } from '../../../compiled/@vitejs/plugin-legacy';
import legacyPlugin from '../../../compiled/@vitejs/plugin-legacy';
import * as lite from '../../../compiled/caniuse-lite';
import { getBrowserlist } from './css';

/**
 * transform umi targets to vite build.target
 */
export default (function target(userConfig) {
  const config: ReturnType<IConfigProcessor> = { build: {}, plugins: [] };

  // convert { ie: 11 } to ['ie11']
  if (typeof userConfig.targets === 'object') {
    config.build!.target = Object.entries(userConfig.targets)
      .filter(([name]) => {
        // refer: https://esbuild.github.io/api/#target
        return ['chrome', 'edge', 'firefox', 'node', 'safari'].includes(name);
      })
      .map(([name, ver]) => `${name}${ver}`);
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
  if (userConfig.targets && isLegacyBrowser(userConfig.targets)) {
    const legacyOpts: Options = {
      targets: getBrowserlist(userConfig.targets),
      polyfills: false,
      ignoreBrowserslistConfig: true,
    };

    config.plugins!.push(legacyPlugin(legacyOpts));
  }
  return config;
} as IConfigProcessor);
