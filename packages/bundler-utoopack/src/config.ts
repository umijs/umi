import type { IOpts as IConfigOpts } from '@umijs/bundler-webpack';
import { getConfig } from '@umijs/bundler-webpack';
import { lodash } from '@umijs/utils';
import type { BundleOptions, WebpackConfig } from '@utoo/pack';
import { compatOptionsFromWebpack } from '@utoo/pack';
import fs from 'fs';
import { extname, resolve as pathResolve } from 'path';
import type { IOpts } from './types';

function normalizeDefineValue(val: any) {
  if (!lodash.isPlainObject(val)) {
    return JSON.stringify(val);
  } else {
    return Object.keys(val).reduce((obj: Record<string, any>, key: string) => {
      obj[key] = normalizeDefineValue(val[key]);
      return obj;
    }, {});
  }
}

function getModularizeImports(extraBabelPlugins: any[]) {
  return extraBabelPlugins
    .filter((p) => /^import$|babel-plugin-import/.test(p[0]))
    .reduce(
      (acc, [_, v]) => {
        const {
          libraryName,
          libraryDirectory,
          style,
          camel2DashComponentName,
          transformToDefaultImport,
          ...rest
        } = v;

        if (Object.keys(rest).length > 0) {
          throw new Error(
            `babel-plugin-import options ${Object.keys(
              rest,
            )} is not supported in utoopack bundler`,
          );
        }

        if (typeof style === 'function') {
          throw new Error(
            `babel-plugin-import style function is not supported in utoopack bundler`,
          );
        }

        let transformRule = '{{ kebabCase member }}';
        if (camel2DashComponentName === false) {
          transformRule = '{{ member }}';
        }

        const skipDefaultConversion =
          typeof transformToDefaultImport === 'undefined'
            ? false
            : !Boolean(transformToDefaultImport);

        acc[libraryName as string] = {
          transform: `${libraryName}/${libraryDirectory}/${transformRule}`,
          preventFullImport: false,
          skipDefaultConversion,
          style: typeof style === 'boolean' ? 'style' : style,
        };

        return acc;
      },
      {} as Record<
        string,
        {
          transform: string | Record<string, string>;
          preventFullImport?: boolean;
          skipDefaultConversion?: boolean;
          style?: string;
        }
      >,
    );
}

function getNormalizedAlias(
  alias: Record<string, string>,
  rootDir: string,
): Record<string, string> {
  const newAlias = { ...alias };

  // Add wildcard aliases for all aliases that point to directories (not files)
  // refer to: https://github.com/utooland/utoo/issues/2288
  // webpack alias: https://webpack.js.org/configuration/resolve/#resolvealias
  for (const [key, value] of Object.entries(newAlias)) {
    // Skip if already has wildcard
    if (
      key.endsWith('/*') ||
      value.endsWith('/*') ||
      key.endsWith('/') ||
      value.endsWith('/') ||
      key.endsWith('$')
    ) {
      continue;
    }

    // `path.extname()` can treat the last segment of a directory path as an
    // extension when the directory name contains a dot.
    // Example: `/path/to/foo.v1` (a directory) returns `.v1`, which would
    // incorrectly trigger `continue`.
    // Prefer filesystem checks first; if unresolved, keep the original behavior.
    const ext = extname(value);
    if (ext) {
      let isDirectory = false;
      const candidates = [...new Set([value, pathResolve(rootDir, value)])];

      for (const candidate of candidates) {
        try {
          const stat = fs.statSync(candidate);
          if (stat.isDirectory()) {
            // Directories should not be skipped because we need wildcard aliases.
            isDirectory = true;
            break;
          }
          // For files, keep isDirectory=false and skip below.
        } catch (e) {
          // ignore; if all candidates fail, fall back to old behavior below
        }
      }

      // If unresolved or confirmed as a file, preserve the original skip behavior.
      if (!isDirectory) continue;
    }
    // Add wildcard version for directory aliases
    newAlias[`${key}/*`] = `${value}/*`;
  }

  newAlias[`${rootDir}/*`] = `${rootDir}/*`;
  return newAlias;
}

// refer from: https://github.com/utooland/utoo/blob/master/packages/bundler-mako/index.js#L543-L564
function getNormalizedExternals(externals: Record<string, any>) {
  return Object.entries(externals || {}).reduce(
    (ret: Record<string, any>, [k, v]) => {
      // handle [string] with script type
      if (Array.isArray(v)) {
        const [url, ...members] = v;
        const containsScript = url.startsWith('script');
        const script = url.replace('script ', '');
        if (containsScript) {
          ret[k] = {
            // ['antd', 'Button'] => `antd.Button`
            root: members.join('.'),
            type: 'script',
            // `script https://example.com/lib/script.js` => `https://example.com/lib/script.js`
            script,
          };
        } else {
          ret[k] = {
            root: members.join('.'),
            script,
          };
        }
      } else if (typeof v === 'string') {
        // 'window.antd' or 'window antd' => 'antd'
        ret[k] = v.replace(/^window(\s+|\.)/, '');
      } else {
        // other types except boolean has been checked before
        // so here only ignore invalid boolean type
      }
      return ret;
    },
    {},
  );
}

/**
 * Get SVG module rules configuration for utoopack
 * This generates rules that use svgr-loader and url-loader to support both
 * ReactComponent export and default URL export for SVG files
 */
function getSvgModuleRules(opts: {
  svgr?: Record<string, any>;
  svgo?: Record<string, any> | false;
  inlineLimit?: number;
}) {
  const { svgr, svgo = {} } = opts;

  if (!svgr) {
    return {};
  }

  return {
    module: {
      rules: {
        '*.svg': {
          loaders: [
            {
              loader: require.resolve(
                '@umijs/bundler-webpack/dist/loader/svgr',
              ),
              options: {
                svgoConfig: {
                  plugins: [
                    {
                      name: 'preset-default',
                      params: {
                        overrides: {
                          removeTitle: false,
                        },
                      },
                    },
                    'prefixIds',
                  ],
                  ...(typeof svgo === 'object' ? svgo : {}),
                },
                ...svgr,
                svgo: !!svgo,
              },
            },
            {
              loader: require.resolve(
                '@umijs/bundler-webpack/compiled/url-loader',
              ),
            },
          ],
          as: '*.js',
        },
      },
    },
  };
}

function appendPostcssPlugin(postcssConfig: any, plugin: [string, any]) {
  const [pluginName, pluginOptions = {}] = plugin;

  if (postcssConfig == null) {
    return {
      plugins: {
        [pluginName]: pluginOptions,
      },
    };
  }

  if (!lodash.isPlainObject(postcssConfig)) {
    throw new Error(
      `Utoopack styles.postcss must be an object when extraPostCSSPlugins is used.`,
    );
  }

  const existingPlugins = postcssConfig.plugins;
  if (existingPlugins != null && !lodash.isPlainObject(existingPlugins)) {
    throw new Error(
      `Utoopack styles.postcss.plugins must be an object when extraPostCSSPlugins is used.`,
    );
  }

  return {
    ...postcssConfig,
    plugins: {
      ...(existingPlugins || {}),
      [pluginName]: pluginOptions,
    },
  };
}

function normalizeExtraPostcssPlugin(plugin: any): [string, any][] {
  if (typeof plugin === 'string') {
    return [[plugin, {}]];
  }

  if (
    Array.isArray(plugin) &&
    typeof plugin[0] === 'string' &&
    plugin.length <= 2
  ) {
    return [[plugin[0], plugin[1] ?? {}]];
  }

  if (lodash.isPlainObject(plugin)) {
    return Object.entries(plugin);
  }

  throw new Error(
    `Utoopack only supports JSON-serializable extraPostCSSPlugins entries. Please use plugin names or [pluginName, options] tuples instead.`,
  );
}

export function mergeExtraPostcssPlugins(
  postcssConfig: any,
  extraPlugins: any[] = [],
) {
  return extraPlugins.reduce((memo, plugin) => {
    return normalizeExtraPostcssPlugin(plugin).reduce(
      (ret, normalizedPlugin) => {
        return appendPostcssPlugin(ret, normalizedPlugin);
      },
      memo,
    );
  }, postcssConfig);
}

export async function getProdUtooPackConfig(
  opts: IOpts,
): Promise<BundleOptions> {
  const webpackConfig = await getConfig({
    cwd: opts.cwd,
    rootDir: opts.rootDir,
    env: 'production' as any,
    entry: opts.entry,
    userConfig: opts.config,
    analyze: process.env.ANALYZE,
    babelPreset: opts.babelPreset,
    extraBabelPlugins: [
      ...(opts.beforeBabelPlugins || []),
      ...(opts.extraBabelPlugins || []),
    ],
    extraBabelPresets: [
      ...(opts.beforeBabelPresets || []),
      ...(opts.extraBabelPresets || []),
    ],
    extraBabelIncludes: opts.config.extraBabelIncludes,
    chainWebpack: opts.chainWebpack,
    modifyWebpackConfig: opts.modifyWebpackConfig,
    pkg: opts.pkg,
    disableCopy: opts.disableCopy,
  });

  let utooBundlerOpts = compatOptionsFromWebpack({
    ...lodash.omit(webpackConfig, ['target', 'module', 'externals']),
    webpackMode: true,
  } as WebpackConfig);

  const extraBabelPlugins = [
    ...(opts.extraBabelPlugins || []),
    ...(opts.config.extraBabelPlugins || []),
  ];

  const modularizeImports = getModularizeImports(extraBabelPlugins);
  const emotion = extraBabelPlugins.some((p) => {
    return p === '@emotion' || p === '@emotion/babel-plugin';
  });
  const define: Record<string, any> = {};
  if (opts.config.define) {
    for (const key of Object.keys(opts.config.define)) {
      define[key] = normalizeDefineValue(opts.config.define[key]);
    }
  }

  if (process.env.SOCKET_SERVER) {
    define['process.env.SOCKET_SERVER'] = normalizeDefineValue(
      process.env.SOCKET_SERVER,
    );
  }
  // const normalizedPostcssConfig = opts.config.extraPostCSSPlugins?.length
  //   ? mergeExtraPostcssPlugins(undefined, opts.config.extraPostCSSPlugins)
  //   : undefined;

  const {
    publicPath,
    runtimePublicPath,
    externals: userExternals,
    copy = [],
    svgr,
    svgo = {},
    inlineLimit,
  } = opts.config;

  utooBundlerOpts = {
    ...utooBundlerOpts,
    config: lodash.merge(
      lodash.omit(utooBundlerOpts.config, ['define']),
      {
        output: {
          clean: opts.clean,
          publicPath: runtimePublicPath ? 'runtime' : publicPath || '/',
          ...(opts.disableCopy
            ? { copy: [] }
            : { copy: ['public'].concat(copy) }),
        },
        optimization: {
          modularizeImports,
          concatenateModules: true,
        },
        resolve: {
          alias: getNormalizedAlias(
            utooBundlerOpts.config.resolve?.alias as Record<string, string>,
            opts.rootDir,
          ),
        },
        styles: {
          less: {
            modifyVars: opts.config.theme,
            javascriptEnabled: true,
            ...opts.config.lessLoader,
          },
          // postcss: normalizedPostcssConfig,
          sass: opts.config.sassLoader ?? undefined,
          emotion: emotion || undefined,
        },
        define,
        nodePolyfill: true,
        externals: getNormalizedExternals(userExternals),
        ...getSvgModuleRules({ svgr, svgo, inlineLimit }),
      },
      opts.config.utoopack || {},
    ),
  } as BundleOptions;

  return utooBundlerOpts;
}

export type IDevOpts = {
  afterMiddlewares?: any[];
  beforeMiddlewares?: any[];
  onDevCompileDone?: Function;
  onProgress?: Function;
  onMFSUProgress?: Function;
  port?: number;
  host?: string;
  ip?: string;
  babelPreset?: any;
  chainWebpack?: Function;
  modifyWebpackConfig?: Function;
  beforeBabelPlugins?: any[];
  beforeBabelPresets?: any[];
  extraBabelPlugins?: any[];
  extraBabelPresets?: any[];
  cwd: string;
  rootDir: string;
  config: Record<string, any>;
  entry: Record<string, string>;
  mfsuStrategy?: 'eager' | 'normal';
  mfsuInclude?: string[];
  srcCodeCache?: any;
  startBuildWorker?: (deps: any[]) => Worker;
  onBeforeMiddleware?: Function;
  disableCopy?: boolean;
  clean?: boolean;
} & Pick<IConfigOpts, 'cache' | 'pkg'>;

export async function getDevUtooPackConfig(
  opts: IDevOpts,
): Promise<BundleOptions> {
  let webpackConfig = await getConfig({
    cwd: opts.cwd,
    rootDir: opts.rootDir,
    env: 'development' as any,
    entry: opts.entry,
    userConfig: opts.config,
    babelPreset: opts.babelPreset,
    extraBabelPlugins: [
      ...(opts.beforeBabelPlugins || []),
      ...(opts.extraBabelPlugins || []),
    ],
    extraBabelPresets: [
      ...(opts.beforeBabelPresets || []),
      ...(opts.extraBabelPresets || []),
    ],
    extraBabelIncludes: opts.config.extraBabelIncludes,
    chainWebpack: opts.chainWebpack,
    modifyWebpackConfig: opts.modifyWebpackConfig,
    // TO avoild bundler webpack add extra entry.
    hmr: false,
    analyze: process.env.ANALYZE,
  });

  let utooBundlerOpts = compatOptionsFromWebpack({
    ...lodash.omit(webpackConfig, ['target', 'module', 'externals']),
    webpackMode: true,
  } as WebpackConfig);

  const extraBabelPlugins = [
    ...(opts.extraBabelPlugins || []),
    ...(opts.config.extraBabelPlugins || []),
  ];

  const modularizeImports = getModularizeImports(extraBabelPlugins);
  const emotion = extraBabelPlugins.some((p) => {
    return p === '@emotion' || p === '@emotion/babel-plugin';
  });

  const define: Record<string, any> = {};
  if (opts.config.define) {
    for (const key of Object.keys(opts.config.define)) {
      define[key] = normalizeDefineValue(opts.config.define[key]);
    }
  }

  if (process.env.SOCKET_SERVER) {
    define['process.env.SOCKET_SERVER'] = normalizeDefineValue(
      process.env.SOCKET_SERVER,
    );
  }
  // const normalizedPostcssConfig = opts.config.extraPostCSSPlugins?.length
  //   ? mergeExtraPostcssPlugins(undefined, opts.config.extraPostCSSPlugins)
  //   : undefined;

  const {
    publicPath,
    runtimePublicPath,
    externals: userExternals,
    copy = [],
    svgr,
    svgo = {},
    inlineLimit,
  } = opts.config;

  utooBundlerOpts = {
    ...utooBundlerOpts,
    config: lodash.merge(
      lodash.omit(utooBundlerOpts.config, ['define']),
      {
        output: {
          clean: opts.clean === undefined ? true : opts.clean,
          publicPath: runtimePublicPath ? 'runtime' : publicPath || '/',
          ...(opts.disableCopy
            ? { copy: [] }
            : { copy: ['public'].concat(copy) }),
        },
        resolve: {
          alias: getNormalizedAlias(
            utooBundlerOpts.config.resolve?.alias as Record<string, string>,
            opts.rootDir,
          ),
        },
        optimization: {
          modularizeImports,
        },
        styles: {
          less: {
            modifyVars: opts.config.theme,
            javascriptEnabled: true,
            ...opts.config.lessLoader,
          },
          // postcss: normalizedPostcssPlugin,
          sass: opts.config.sassLoader ?? undefined,
          emotion: emotion || undefined,
        },
        define,
        // dev enable persistent cache by default
        persistentCaching: true,
        nodePolyfill: true,
        externals: getNormalizedExternals(userExternals),
        ...getSvgModuleRules({ svgr, svgo, inlineLimit }),
      },
      opts.config.utoopack || {},
    ),
    watch: {
      enable: true,
    },
    dev: true,
  };

  return utooBundlerOpts;
}
