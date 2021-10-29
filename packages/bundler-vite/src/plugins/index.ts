import type { InlineConfig as ViteInlineConfig } from 'vite';
import type { IConfig } from '../types';
import autoCSSModulePlugin from './autoCSSModule';
import svgrPlugin from './svgr';

/**
 * config with plugins
 */
export default (userConfig: IConfig): ViteInlineConfig => {
  return {
    plugins: [
      svgrPlugin({
        ...userConfig.svgr,
      }),
      ...(userConfig.autoCSSModules ? [autoCSSModulePlugin()] : []),
    ],
  };
};
