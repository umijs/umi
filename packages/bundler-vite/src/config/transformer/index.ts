import type { InlineConfig as ViteInlineConfig } from '../../../compiled/vite';
import { mergeConfig } from '../../../compiled/vite';
import alias from './alias';
import css from './css';
import define from './define';
import devServer from './devServer';
import merge from './merge';
import optimizeDeps from './optimizeDeps';
import react from './react';
import rename from './rename';
import rollup from './rollup';
import target from './target';

// FIXME: replace with real user config types
type ITmpUserConfig = Record<string, any>;

/**
 * type of config processor
 */
export type IConfigProcessor = (
  userConfig: ITmpUserConfig,
  currentViteConfig: Partial<ViteInlineConfig>,
) => Partial<ViteInlineConfig>;

/**
 * config transformer
 */
export default (userConfig: ITmpUserConfig): ViteInlineConfig => {
  const transformers = [
    rename,
    devServer,
    alias, // must before css for support ~ prefix from less-loader
    css,
    rollup,
    react,
    optimizeDeps,
    target,
    define,
    merge,
  ];

  return transformers.reduce<ViteInlineConfig>(
    (memo, transformer) => mergeConfig(memo, transformer(userConfig, memo)),
    {},
  );
};
