import type { InlineConfig as ViteInlineConfig } from '../../compiled/vite';
import type { IConfig } from '../types';
import autoCSSModulePlugin from './autoCSSModule';
import externals from './externals';
import svgrPlugin from './svgr';

/**
 * config with plugins
 */
export default (userConfig: IConfig): ViteInlineConfig => {
  return {
    plugins: [
      svgrPlugin(userConfig.svgr, userConfig.svgo),
      externals(userConfig.externals || {}),
      ...(userConfig.autoCSSModules ? [autoCSSModulePlugin()] : []),
    ],
  };
};
