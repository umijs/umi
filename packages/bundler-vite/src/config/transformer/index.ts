import { mergeConfig } from 'vite';
import rename from './rename';
import devServer from './devServer';
import css from './css';
import rollup from './rollup';
import babel from './babel';

import type { InlineConfig as ViteInlineConfig } from 'vite';

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
  const transformers = [rename, devServer, css, rollup, babel];

  return transformers.reduce<ViteInlineConfig>(
    (memo, transformer) =>
      mergeConfig(memo, transformer(userConfig, memo)),
    {},
  );
};
