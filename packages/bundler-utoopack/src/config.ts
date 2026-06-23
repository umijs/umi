import type { IOpts as IConfigOpts } from '@umijs/bundler-webpack';
import { getConfig } from '@umijs/bundler-webpack';
import { lodash } from '@umijs/utils';
import type { BundleOptions, WebpackConfig } from '@utoo/pack';
import { compatOptionsFromWebpack } from '@utoo/pack';
import fs from 'fs';
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  join,
  relative,
  resolve as pathResolve,
} from 'path';
import type { IOpts } from './types';

const DEFAULT_STATIC_PATH_PREFIX = 'static/';

const UTOOPACK_OVERLAY_CLIENT_ENTRY = normalizeUtoopackPath(
  require.resolve('../client/client/client.js'),
);

function getAssetModuleFilename(staticPathPrefix?: string) {
  const prefix =
    staticPathPrefix !== undefined
      ? staticPathPrefix
      : DEFAULT_STATIC_PATH_PREFIX;

  return `${prefix}[name].[contenthash:8]`;
}

function getUtoopackDefine(opts: { config: Record<string, any> }) {
  const define = Object.fromEntries(
    Object.entries(opts.config.define || {}).map(([key, value]) => {
      return [key, normalizeUtoopackDefineValue(value)];
    }),
  );

  // Utoopack parses define strings as JavaScript expressions, so top-level
  // string values must be quoted to become string literals at runtime.
  if (process.env.SOCKET_SERVER) {
    define['process.env.SOCKET_SERVER'] = JSON.stringify(
      process.env.SOCKET_SERVER,
    );
  }

  return define;
}

function normalizeUtoopackDefineValue(value: any) {
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }

  return value;
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

function getBabelPluginName(plugin: any) {
  const name = Array.isArray(plugin) ? plugin[0] : plugin;

  return typeof name === 'string' ? name : '';
}

function isModularizeImportPlugin(plugin: any) {
  return /^import$|babel-plugin-import/.test(getBabelPluginName(plugin));
}

function isEmotionBabelPlugin(plugin: any) {
  const name = getBabelPluginName(plugin);

  return name === '@emotion' || name.endsWith('@emotion/babel-plugin');
}

function getExtraBabelPlugins(opts: {
  beforeBabelPlugins?: any[];
  extraBabelPlugins?: any[];
  config: Record<string, any>;
}) {
  return [
    ...(opts.beforeBabelPlugins || []),
    ...(opts.extraBabelPlugins || []),
    ...(opts.config.extraBabelPlugins || []),
  ]
    .filter(Boolean)
    .filter(isSerializableBabelItem);
}

function getExtraBabelPresets(opts: {
  beforeBabelPresets?: any[];
  extraBabelPresets?: any[];
  config: Record<string, any>;
}) {
  return [
    ...(opts.beforeBabelPresets || []),
    ...(opts.extraBabelPresets || []),
    ...(opts.config.extraBabelPresets || []),
  ]
    .filter(Boolean)
    .filter(isSerializableBabelItem);
}

function dropUndefinedValues<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(dropUndefinedValues) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, dropUndefinedValues(item)]),
    ) as T;
  }

  return value;
}

function isSerializableBabelItem(item: any) {
  const normalized = dropUndefinedValues(item);

  try {
    return lodash.isEqual(normalized, JSON.parse(JSON.stringify(normalized)));
  } catch (e) {
    return false;
  }
}

function isReactCompilerEnabled(config: Record<string, any>) {
  if ('reactCompiler' in config) {
    return config.reactCompiler !== false;
  }

  return 'forget' in config;
}

function shouldAddBabelLoaderRules(config: Record<string, any>) {
  return (
    config.utoopack?.babelLoader === true || isReactCompilerEnabled(config)
  );
}

function getExtraBabelModuleRules(opts: {
  babelPreset?: any;
  beforeBabelPlugins?: any[];
  beforeBabelPresets?: any[];
  extraBabelPlugins?: any[];
  extraBabelPresets?: any[];
  config: Record<string, any>;
}) {
  if (!shouldAddBabelLoaderRules(opts.config)) {
    return {};
  }

  const plugins = getExtraBabelPlugins(opts).filter((plugin) => {
    return !isModularizeImportPlugin(plugin) && !isEmotionBabelPlugin(plugin);
  });
  const extraPresets = getExtraBabelPresets(opts);

  if (!plugins.length && !extraPresets.length) {
    return {};
  }

  const presets = [opts.babelPreset, ...extraPresets].filter(Boolean);

  const rule = {
    condition: {
      all: [
        { not: 'foreign' },
        {
          not: {
            path: /[\\/]src[\\/]\.umi(?:-[^\\/]*)?[\\/]/,
          },
        },
      ],
    },
    loaders: [
      {
        loader: require.resolve('@umijs/bundler-webpack/compiled/babel-loader'),
        options: dropUndefinedValues({
          sourceType: 'unambiguous',
          babelrc: false,
          configFile: false,
          cacheDirectory: false,
          browserslistConfigFile: false,
          targets: opts.config.targets,
          customize: opts.config.babelLoaderCustomize,
          presets,
          plugins,
        }),
      },
    ],
    as: '*.js',
  };

  return {
    module: {
      rules: Object.fromEntries(
        ['js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx'].map((ext) => [
          `**/*.${ext}`,
          rule,
        ]),
      ),
    },
  };
}

export function normalizeUtoopackPath(path: string) {
  return path.replace(/\\/g, '/');
}

function normalizeUtoopackEntry<T>(entry: T): T {
  if (typeof entry === 'string') {
    return normalizeUtoopackPath(entry) as T;
  }

  if (Array.isArray(entry)) {
    return entry.map(normalizeUtoopackEntry) as T;
  }

  if (entry && typeof entry === 'object') {
    return Object.fromEntries(
      Object.entries(entry).map(([key, value]) => [
        key,
        normalizeUtoopackEntry(value),
      ]),
    ) as T;
  }

  return entry;
}

function getRelativeImportSpecifier(fromFile: string, toFile: string) {
  const relativePath = normalizeUtoopackPath(
    relative(dirname(fromFile), toFile),
  );

  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
}

function getOverlayEntryImport(request: string, cwd: string, fromFile: string) {
  if (request.startsWith('.') || isAbsolute(request)) {
    return getRelativeImportSpecifier(
      fromFile,
      normalizeUtoopackPath(pathResolve(cwd, request)),
    );
  }

  return request;
}

function getOverlayEntryPath(cwd: string, entryName: string) {
  const safeEntryName = entryName.replace(/[^a-zA-Z0-9_-]/g, '_');
  return normalizeUtoopackPath(
    join(
      cwd,
      'node_modules/.cache/umi/utoopack-overlay',
      `${safeEntryName}.js`,
    ),
  );
}

function createDynamicImportChain(imports: string[]) {
  return `void ${imports
    .map((item, index) =>
      index === 0
        ? `import(${JSON.stringify(item)})`
        : `.then(() => import(${JSON.stringify(item)}))`,
    )
    .join('')};\n`;
}

function writeUtoopackOverlayEntry(opts: {
  cwd: string;
  entryName: string;
  imports: string[];
}) {
  const entryPath = getOverlayEntryPath(opts.cwd, opts.entryName);
  const overlayClientPath = normalizeUtoopackPath(
    join(dirname(entryPath), 'client.js'),
  );
  fs.mkdirSync(dirname(entryPath), { recursive: true });
  fs.copyFileSync(UTOOPACK_OVERLAY_CLIENT_ENTRY, overlayClientPath);
  fs.writeFileSync(
    entryPath,
    createDynamicImportChain([
      getRelativeImportSpecifier(entryPath, overlayClientPath),
      ...opts.imports.map((item) =>
        getOverlayEntryImport(item, opts.cwd, entryPath),
      ),
    ]),
    'utf-8',
  );
  return entryPath;
}

function prependUtoopackOverlayClient<T>(
  entry: T,
  cwd: string,
  entryName = 'umi',
): T {
  if (typeof entry === 'string') {
    return writeUtoopackOverlayEntry({
      cwd,
      entryName,
      imports: [entry],
    }) as T;
  }

  if (Array.isArray(entry)) {
    return writeUtoopackOverlayEntry({
      cwd,
      entryName,
      imports: entry as string[],
    }) as T;
  }

  if (entry && typeof entry === 'object') {
    if ('import' in entry) {
      return {
        ...entry,
        import: prependUtoopackOverlayClient(
          (entry as { import: string | string[] }).import,
          cwd,
          entryName,
        ),
      } as T;
    }

    return Object.fromEntries(
      Object.entries(entry).map(([key, value]) => [
        key,
        prependUtoopackOverlayClient(value, cwd, key),
      ]),
    ) as T;
  }

  return entry;
}

function normalizeUtoopackOpts<
  T extends { cwd: string; rootDir: string; entry: any },
>(opts: T): T {
  return {
    ...opts,
    cwd: normalizeUtoopackPath(opts.cwd),
    rootDir: normalizeUtoopackPath(opts.rootDir),
    entry: normalizeUtoopackEntry(opts.entry),
  };
}

function getNormalizedAlias(
  alias: Record<string, string | false | undefined> | undefined,
  rootDir: string,
): Record<string, string> {
  const newAlias = Object.fromEntries(
    Object.entries(alias || {})
      .filter((entry): entry is [string, string] => {
        return typeof entry[1] === 'string';
      })
      .map(([key, value]) => [
        normalizeUtoopackPath(key),
        normalizeUtoopackPath(value),
      ]),
  );
  const normalizedRootDir = normalizeUtoopackPath(rootDir);

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
      const candidates = [
        ...new Set([value, pathResolve(normalizedRootDir, value)]),
      ];

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

  newAlias[`${normalizedRootDir}/*`] = `${normalizedRootDir}/*`;
  return newAlias;
}

// refer from: https://github.com/utooland/utoo/blob/master/packages/bundler-mako/index.js#L543-L564
function normalizeExternalValue(v: any) {
  if (Array.isArray(v)) {
    const [url, ...members] = v;
    const scriptPrefix = /^script\s+/.exec(url);
    const script = scriptPrefix ? url.slice(scriptPrefix[0].length) : url;
    if (scriptPrefix) {
      return {
        // ['antd', 'Button'] => `antd.Button`
        root: members.join('.'),
        type: 'script',
        // `script https://example.com/lib/script.js` => `https://example.com/lib/script.js`
        script,
      };
    } else if (url === 'promise' && typeof members[0] === 'string') {
      return `promise ${members[0]}`;
    } else {
      return {
        root: members.join('.'),
        script,
      };
    }
  } else if (typeof v === 'string') {
    // 'window.antd' or 'window antd' => 'antd'
    return v.replace(/^window(\s+|\.)/, '');
  }
}

function toWildcardExternalConfig(value: any) {
  const normalized = normalizeExternalValue(value);

  if (typeof normalized === 'string') {
    const externalType = /^(commonjs|esm|promise)\s+/.exec(normalized);
    if (externalType) {
      return {
        root: normalized.slice(externalType[0].length),
        type: externalType[1],
      };
    }

    return {
      root: normalized,
    };
  }
}

function getExternalSubPathGlob(externalKey: string) {
  if (!externalKey.includes('*')) return;

  const parts = externalKey.split('/');
  const packageName = externalKey.startsWith('@')
    ? parts.slice(0, 2).join('/')
    : parts[0];
  const subPathGlob = externalKey.slice(packageName.length);

  if (!packageName || !subPathGlob.startsWith('/')) return;

  return {
    packageName,
    subPathGlob,
  };
}

function escapeRegexChar(char: string) {
  return /[|\\{}()[\]^$+?.]/.test(char) ? `\\${char}` : char;
}

function globToSubPathRegex(glob: string) {
  let regex = '^';

  for (const char of glob) {
    if (char === '*') {
      regex += '.+';
    } else if (char === '/') {
      regex += '\\/';
    } else {
      regex += escapeRegexChar(char);
    }
  }

  return `/${regex}$/`;
}

function addWildcardSubPath(config: Record<string, any>, subPathGlob: string) {
  return {
    ...config,
    subPath: {
      ...(config.subPath || {}),
      rules: [
        ...(config.subPath?.rules || []),
        {
          regex: globToSubPathRegex(subPathGlob),
          target: '',
        },
      ],
    },
  };
}

function getNormalizedExternals(externals: Record<string, any>) {
  const ret = Object.entries(externals || {}).reduce(
    (memo: Record<string, any>, [k, v]) => {
      if (!getExternalSubPathGlob(k)) {
        const normalized = normalizeExternalValue(v);
        if (normalized !== undefined) {
          memo[k] = normalized;
        }
      }
      return memo;
    },
    {},
  );

  Object.entries(externals || {}).forEach(([k, v]) => {
    const externalSubPathGlob = getExternalSubPathGlob(k);
    if (!externalSubPathGlob) return;

    const normalized = toWildcardExternalConfig(v);
    if (!normalized) return;

    ret[externalSubPathGlob.packageName] = addWildcardSubPath(
      ret[externalSubPathGlob.packageName] &&
        typeof ret[externalSubPathGlob.packageName] === 'object'
        ? ret[externalSubPathGlob.packageName]
        : normalized,
      externalSubPathGlob.subPathGlob,
    );
  });

  return ret;
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

function getUserUtoopackConfig(
  utoopackConfig: Record<string, any> = {},
  opts: {
    config: Record<string, any>;
    modularizeImports: Record<string, any>;
  },
) {
  const userUtoopackConfig = lodash.omit(utoopackConfig, [
    'babelLoader',
    'root',
  ]);
  const packageImports = userUtoopackConfig.optimization?.packageImports || [];

  if (
    opts.config.antd?.import &&
    opts.modularizeImports.antd &&
    Array.isArray(packageImports) &&
    packageImports.includes('antd')
  ) {
    return {
      ...userUtoopackConfig,
      optimization: {
        ...userUtoopackConfig.optimization,
        packageImports: packageImports.filter((pkg) => pkg !== 'antd'),
      },
    };
  }

  return userUtoopackConfig;
}

function getDefaultPersistentCaching() {
  return process.platform !== 'win32';
}

export async function getProdUtooPackConfig(
  rawOpts: IOpts,
): Promise<BundleOptions> {
  const opts = normalizeUtoopackOpts(rawOpts);

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
    staticPathPrefix: opts.staticPathPrefix,
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
  const define = getUtoopackDefine(opts);
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
    mdx,
  } = opts.config;
  const userUtoopackConfig = getUserUtoopackConfig(opts.config.utoopack, {
    config: opts.config,
    modularizeImports,
  });

  utooBundlerOpts = {
    ...utooBundlerOpts,
    tracing: false,
    config: lodash.merge(
      lodash.omit(utooBundlerOpts.config, ['define', 'resolve']),
      {
        output: {
          clean: opts.clean,
          publicPath: runtimePublicPath ? 'runtime' : publicPath || '/',
          assetModuleFilename: getAssetModuleFilename(opts.staticPathPrefix),
          ...(opts.disableCopy
            ? { copy: [] }
            : { copy: ['public'].concat(copy) }),
        },
        optimization: {
          modularizeImports,
          concatenateModules: true,
        },
        resolve: {
          ...(utooBundlerOpts.config.resolve || {}),
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
          emotion,
        },
        define,
        nodePolyfill: true,
        mdx: !!mdx,
        externals: getNormalizedExternals(userExternals),
      },
      getExtraBabelModuleRules(opts),
      getSvgModuleRules({ svgr, svgo, inlineLimit }),
      userUtoopackConfig,
    ),
  } as BundleOptions;

  return utooBundlerOpts;
}

export async function getSSRUtooPackConfig(
  rawOpts: IOpts & {
    serverBuildPath: string;
    useHash?: boolean;
    isDev?: boolean;
  },
): Promise<BundleOptions> {
  const opts = normalizeUtoopackOpts(rawOpts);

  const utooBundlerOpts = await getProdUtooPackConfig({
    ...opts,
    clean: false,
    disableCopy: true,
  });
  const entry = Object.entries(opts.entry)[0];
  const entryName = entry?.[0] || 'umi.server';
  const entryPath = entry?.[1];
  const filename = opts.useHash
    ? '[name].[contenthash:8].js'
    : basename(opts.serverBuildPath);

  utooBundlerOpts.config = {
    ...utooBundlerOpts.config,
    entry: [
      {
        name: entryName,
        import: entryPath,
        library: {},
      },
    ],
    output: {
      ...utooBundlerOpts.config.output,
      path: dirname(opts.serverBuildPath),
      filename,
      chunkFilename: filename,
      clean: true,
      copy: [],
      publicPath: '/',
    },
    target: 'node',
    sourceMaps: false,
    stats: true,
    pluginRuntimeStrategy: 'childProcesses',
    nodePolyfill: false,
    optimization: {
      ...utooBundlerOpts.config.optimization,
      minify: false,
    },
  };

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
} & Pick<IConfigOpts, 'cache' | 'pkg' | 'staticPathPrefix'>;

export async function getDevUtooPackConfig(
  rawOpts: IDevOpts,
): Promise<BundleOptions> {
  const opts = normalizeUtoopackOpts(rawOpts);

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
    staticPathPrefix: opts.staticPathPrefix,
    // TO avoild bundler webpack add extra entry.
    hmr: false,
    analyze: process.env.ANALYZE,
  });
  webpackConfig = {
    ...webpackConfig,
    entry: prependUtoopackOverlayClient(webpackConfig.entry, opts.cwd),
  };

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

  const define = getUtoopackDefine(opts);
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
    mdx,
  } = opts.config;
  const userUtoopackConfig = getUserUtoopackConfig(opts.config.utoopack, {
    config: opts.config,
    modularizeImports,
  });

  utooBundlerOpts = {
    ...utooBundlerOpts,
    ...(process.env.SOCKET_SERVER
      ? {
          processEnv: {
            ...(utooBundlerOpts.processEnv || {}),
            'process.env.SOCKET_SERVER': process.env.SOCKET_SERVER,
          },
        }
      : {}),
    config: lodash.merge(
      lodash.omit(utooBundlerOpts.config, ['define', 'resolve']),
      {
        output: {
          clean: opts.clean === undefined ? true : opts.clean,
          publicPath: runtimePublicPath ? 'runtime' : publicPath || '/',
          assetModuleFilename: getAssetModuleFilename(opts.staticPathPrefix),
          ...(opts.disableCopy
            ? { copy: [] }
            : { copy: ['public'].concat(copy) }),
        },
        resolve: {
          ...(utooBundlerOpts.config.resolve || {}),
          alias: getNormalizedAlias(
            utooBundlerOpts.config.resolve?.alias as Record<string, string>,
            opts.rootDir,
          ),
        },
        optimization: {
          modularizeImports,
          // Disable the options under dev for utoopack
          // otherwise it will affect react-refresh
          removeUnusedExports: false,
          removeUnusedImports: false,
        },
        styles: {
          less: {
            modifyVars: opts.config.theme,
            javascriptEnabled: true,
            ...opts.config.lessLoader,
          },
          // postcss: normalizedPostcssPlugin,
          sass: opts.config.sassLoader ?? undefined,
          emotion,
        },
        define,
        stats: true,
        // Windows persistent cache restore is currently unstable in utoopack dev.
        persistentCaching: getDefaultPersistentCaching(),
        nodePolyfill: true,
        mdx: !!mdx,
        externals: getNormalizedExternals(userExternals),
        ...(opts.config.clickToComponent
          ? {
              // clickToComponent relies on source filename metadata in dev.
              react: {
                absoluteSourceFilename: true,
              },
            }
          : {}),
      },
      getExtraBabelModuleRules(opts),
      getSvgModuleRules({ svgr, svgo, inlineLimit }),
      userUtoopackConfig,
    ),
    watch: {
      enable: true,
    },
    dev: true,
    tracing: false,
  };

  return utooBundlerOpts;
}
