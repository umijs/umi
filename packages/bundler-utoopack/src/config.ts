import type { IOpts as IConfigOpts } from '@umijs/bundler-webpack';
import { getConfig } from '@umijs/bundler-webpack';
import { lodash } from '@umijs/utils';
import type { BundleOptions, WebpackConfig } from '@utoo/pack';
import { compatOptionsFromWebpack } from '@utoo/pack';
import type { IOpts } from './types';

/**
 * Convert webpack DefinePlugin's process.env format to utoopack format
 * Webpack format: { 'process.env': { NODE_ENV: '"development"', API_URL: '"https://api.example.com"' } }
 * Utoopack format: { 'process.env': '{"NODE_ENV":"development","API_URL":"https://api.example.com"}' }
 */
function convertProcessEnvForUtoopack(webpackConfig: any): Record<string, any> {
  let processEnvForUtoopack: Record<string, any> = {};

  if (webpackConfig.plugins) {
    const definePlugin = webpackConfig.plugins.find(
      (plugin: any) => plugin.constructor.name === 'DefinePlugin',
    ) as any;

    if (definePlugin?.definitions?.['process.env']) {
      // Convert webpack's individual stringified env values back to objects
      for (const [key, value] of Object.entries(
        definePlugin.definitions['process.env'],
      )) {
        if (
          typeof value === 'string' &&
          value.startsWith('"') &&
          value.endsWith('"')
        ) {
          processEnvForUtoopack[key] = JSON.parse(value);
        } else {
          processEnvForUtoopack[key] = value;
        }
      }
    }
  }

  return processEnvForUtoopack;
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

        acc[libraryName as string] = {
          transform: `${libraryName}/${libraryDirectory}/${transformRule}`,
          preventFullImport: false,
          skipDefaultConversion: false,
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
  // Add wildcard aliases for specific keys
  const keysToExpand = ['react', 'react-dom', '@', '@@'];
  for (const key of keysToExpand) {
    if (newAlias[key]) {
      newAlias[`${key}/*`] = `${newAlias[key]}/*`;
    }
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
        ret[k] = {
          // ['antd', 'Button'] => `antd.Button`
          root: members.join('.'),
          // `script https://example.com/lib/script.js` => `https://example.com/lib/script.js`
          script: url.replace('script ', ''),
        };
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
    compatMode: true,
  } as WebpackConfig);

  const extraBabelPlugins = [
    ...(opts.extraBabelPlugins || []),
    ...(opts.config.extraBabelPlugins || []),
  ];

  const modularizeImports = getModularizeImports(extraBabelPlugins);

  // Convert webpack's process.env format to utoopack format
  const processEnvForUtoopack = convertProcessEnvForUtoopack(webpackConfig);
  const {
    publicPath,
    runtimePublicPath,
    externals: userExternals,
  } = opts.config;

  utooBundlerOpts = {
    ...utooBundlerOpts,
    config: lodash.merge(
      utooBundlerOpts.config,
      {
        output: {
          clean: opts.clean,
          publicPath: runtimePublicPath ? 'runtime' : publicPath || '/',
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
          sass: opts.config.sassLoader ?? undefined,
        },
        // Override process.env for utoopack format
        define: {
          'process.env': JSON.stringify(processEnvForUtoopack),
        },
        nodePolyfill: true,
        externals: getNormalizedExternals(userExternals),
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
    compatMode: true,
  } as WebpackConfig);

  const extraBabelPlugins = [
    ...(opts.extraBabelPlugins || []),
    ...(opts.config.extraBabelPlugins || []),
  ];

  const modularizeImports = getModularizeImports(extraBabelPlugins);

  // Convert webpack's process.env format to utoopack format
  const processEnvForUtoopack = convertProcessEnvForUtoopack(webpackConfig);
  const {
    publicPath,
    runtimePublicPath,
    externals: userExternals,
  } = opts.config;

  utooBundlerOpts = {
    ...utooBundlerOpts,
    config: lodash.merge(
      utooBundlerOpts.config,
      {
        output: {
          // utoopack 的 dev 需要默认清空产物目录
          clean: opts.clean === undefined ? true : opts.clean,
          publicPath: runtimePublicPath ? 'runtime' : publicPath || '/',
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
          sass: opts.config.sassLoader ?? undefined,
        },
        // Override process.env for utoopack format
        define: {
          'process.env': JSON.stringify(processEnvForUtoopack),
        },
        nodePolyfill: true,
        externals: getNormalizedExternals(userExternals),
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
