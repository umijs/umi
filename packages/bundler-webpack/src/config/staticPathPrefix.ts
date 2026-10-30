import type { IConfig } from '../types';

export const DEFAULT_STATIC_PATH_PREFIX = 'static/';

/**
 * Resolve webpack assetModuleFilename directory prefix.
 * opts.staticPathPrefix wins (used by mfsu dep builds); otherwise userConfig;
 * default remains `static/` for backward compatibility.
 */
export function resolveStaticPathPrefix(opts: {
  staticPathPrefix?: string;
  userConfig?: Pick<IConfig, 'staticPathPrefix'>;
}): string {
  if (opts.staticPathPrefix !== undefined) {
    return opts.staticPathPrefix;
  }
  if (opts.userConfig?.staticPathPrefix !== undefined) {
    return opts.userConfig.staticPathPrefix;
  }
  return DEFAULT_STATIC_PATH_PREFIX;
}
