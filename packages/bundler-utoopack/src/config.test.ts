jest.mock('@umijs/bundler-webpack', () => ({
  getConfig: jest.fn(async () => ({
    output: {},
    resolve: {
      alias: {},
    },
  })),
}));

jest.mock('@utoo/pack', () => ({
  compatOptionsFromWebpack: jest.fn((webpackConfig) => ({
    config: {
      entry: webpackConfig.entry,
      output: {},
      resolve: {
        alias: webpackConfig.resolve?.alias || {},
      },
    },
  })),
}));

import { getConfig } from '@umijs/bundler-webpack';
import fs from 'fs';
import path from 'path';
import {
  getDevUtooPackConfig,
  getProdUtooPackConfig,
  getSSRUtooPackConfig,
} from './config';

class MiniCssExtractPlugin {
  options: { filename?: string; chunkFilename?: string };

  constructor(options: { filename?: string; chunkFilename?: string }) {
    this.options = options;
  }
}

const mockedGetConfig = getConfig as jest.Mock;

function createWebpackConfig(
  miniCssExtractOptions?: {
    filename?: string;
    chunkFilename?: string;
  },
  alias: Record<string, string> = {},
  entry?: Record<string, string>,
) {
  return {
    entry,
    output: {},
    resolve: {
      alias,
    },
    plugins: miniCssExtractOptions
      ? [new MiniCssExtractPlugin(miniCssExtractOptions)]
      : [],
  };
}

const baseOpts = {
  cwd: process.cwd(),
  rootDir: process.cwd(),
  entry: {
    index: './src/index.tsx',
  },
};

beforeEach(() => {
  mockedGetConfig.mockClear();
  mockedGetConfig.mockResolvedValue(createWebpackConfig());
});

afterEach(() => {
  fs.rmSync(path.join(process.cwd(), 'C:'), { recursive: true, force: true });
  fs.rmSync(path.join(process.cwd(), 'node_modules/.cache/umi'), {
    recursive: true,
    force: true,
  });
});

describe('utoopack mdx config', () => {
  test('allows user css output filename override', async () => {
    const prodConfig = await getProdUtooPackConfig({
      ...baseOpts,
      config: {
        utoopack: {
          output: {
            assetModuleFilename: 'custom/[name].[contenthash:8]',
            cssFilename: 'custom.css',
            cssChunkFilename: 'custom.chunk.css',
          },
        },
      },
    } as any);
    const devConfig = await getDevUtooPackConfig({
      ...baseOpts,
      config: {
        utoopack: {
          output: {
            assetModuleFilename: 'custom/[name].[contenthash:8]',
            cssFilename: 'custom.css',
            cssChunkFilename: 'custom.chunk.css',
          },
        },
      },
    } as any);

    expect(prodConfig.config.output?.assetModuleFilename).toBe(
      'custom/[name].[contenthash:8]',
    );
    expect(prodConfig.config.output?.cssFilename).toBe('custom.css');
    expect(prodConfig.config.output?.cssChunkFilename).toBe('custom.chunk.css');
    expect(devConfig.config.output?.assetModuleFilename).toBe(
      'custom/[name].[contenthash:8]',
    );
    expect(devConfig.config.output?.cssFilename).toBe('custom.css');
    expect(devConfig.config.output?.cssChunkFilename).toBe('custom.chunk.css');
  });

  test('uses webpack-compatible static asset output filename by default', async () => {
    const prodConfig = await getProdUtooPackConfig({
      ...baseOpts,
      config: {},
    } as any);
    const devConfig = await getDevUtooPackConfig({
      ...baseOpts,
      config: {},
    } as any);

    expect(prodConfig.config.output?.assetModuleFilename).toBe(
      'static/[name].[contenthash:8]',
    );
    expect(devConfig.config.output?.assetModuleFilename).toBe(
      'static/[name].[contenthash:8]',
    );
  });

  test('uses staticPathPrefix for default asset output filename', async () => {
    const prodConfig = await getProdUtooPackConfig({
      ...baseOpts,
      config: {},
      staticPathPrefix: 'mf-dep/',
    } as any);
    const devConfig = await getDevUtooPackConfig({
      ...baseOpts,
      config: {},
      staticPathPrefix: 'mf-dep/',
    } as any);

    expect(prodConfig.config.output?.assetModuleFilename).toBe(
      'mf-dep/[name].[contenthash:8]',
    );
    expect(devConfig.config.output?.assetModuleFilename).toBe(
      'mf-dep/[name].[contenthash:8]',
    );
  });

  test('passes mdx flag to production utoopack config', async () => {
    const config = await getProdUtooPackConfig({
      ...baseOpts,
      config: {
        mdx: {
          loader: '/path/to/mdx-loader',
          loaderOptions: {},
        },
      },
    } as any);

    expect(config.config.mdx).toBe(true);
  });

  test('passes mdx flag to development utoopack config', async () => {
    const config = await getDevUtooPackConfig({
      ...baseOpts,
      config: {
        mdx: {
          loader: '/path/to/mdx-loader',
          loaderOptions: {},
        },
      },
    } as any);

    expect(config.config.mdx).toBe(true);
  });
});

describe('utoopack ssr config', () => {
  test('uses native handling instead of SSR style or asset loader rules', async () => {
    const config = await getSSRUtooPackConfig({
      ...baseOpts,
      config: {},
      serverBuildPath: '/tmp/umi.server.js',
    } as any);

    const rules = config.config.module?.rules || {};

    expect(rules['*.css']).toBeUndefined();
    expect(rules['*.less']).toBeUndefined();
    expect(rules['*.sass']).toBeUndefined();
    expect(rules['*.scss']).toBeUndefined();
    expect(rules['*.png']).toBeUndefined();
    expect(rules['*.jpg']).toBeUndefined();
    expect(rules['*.woff']).toBeUndefined();
    expect(config.config.output?.clean).toBe(true);
    expect(config.config.pluginRuntimeStrategy).toBe('childProcesses');
  });
});

describe('utoopack alias config', () => {
  test('normalizes Windows alias paths before passing them to utoopack', async () => {
    mockedGetConfig.mockResolvedValue(
      createWebpackConfig(undefined, {
        '@@': String.raw`C:\Users\demo\app\src\.umi`,
        '@': String.raw`C:\Users\demo\app\src`,
      }),
    );

    const config = await getDevUtooPackConfig({
      ...baseOpts,
      rootDir: String.raw`C:\Users\demo\app`,
      config: {},
    } as any);

    expect(config.config.resolve?.alias).toMatchObject({
      '@@': 'C:/Users/demo/app/src/.umi',
      '@@/*': 'C:/Users/demo/app/src/.umi/*',
      '@': 'C:/Users/demo/app/src',
      '@/*': 'C:/Users/demo/app/src/*',
      'C:/Users/demo/app/*': 'C:/Users/demo/app/*',
    });
    expect(JSON.stringify(config.config.resolve?.alias)).not.toContain('\\');
  });

  test('normalizes Windows cwd, rootDir and entry paths before passing them to utoopack', async () => {
    mockedGetConfig.mockImplementationOnce(async (opts) =>
      createWebpackConfig(undefined, {}, opts.entry),
    );

    const config = await getDevUtooPackConfig({
      ...baseOpts,
      cwd: String.raw`C:\Users\demo\app`,
      rootDir: String.raw`C:\Users\demo\app`,
      entry: {
        umi: 'C:\\Users\\demo\\app\\src\\.umi\\umi.ts',
      },
      config: {},
    } as any);

    expect(mockedGetConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        cwd: 'C:/Users/demo/app',
        rootDir: 'C:/Users/demo/app',
        entry: {
          umi: 'C:/Users/demo/app/src/.umi/umi.ts',
        },
      }),
    );
    expect(config.config.entry.umi).toEqual(
      expect.stringContaining('/utoopack-overlay/umi.js'),
    );
    expect(JSON.stringify(config.config.entry)).not.toContain('\\');
  });

  test('drops non-string webpack aliases before passing them to utoopack', async () => {
    mockedGetConfig.mockResolvedValueOnce(
      createWebpackConfig(undefined, {
        '@': '/project/src',
        react: false as any,
        lodash: undefined as any,
      }),
    );

    const config = await getDevUtooPackConfig({
      ...baseOpts,
      rootDir: '/project',
      config: {},
    } as any);

    expect(config.config.resolve?.alias).toMatchObject({
      '@': '/project/src',
      '@/*': '/project/src/*',
    });
    expect(config.config.resolve?.alias).not.toHaveProperty('react');
    expect(config.config.resolve?.alias).not.toHaveProperty('lodash');
  });

  test('prepends utoopack error overlay client to development entries', async () => {
    mockedGetConfig.mockImplementationOnce(async (opts) =>
      createWebpackConfig(undefined, {}, opts.entry),
    );

    const config = await getDevUtooPackConfig({
      ...baseOpts,
      entry: {
        umi: './src/.umi/umi.ts',
      },
      config: {},
    } as any);

    const overlayEntry = config.config.entry.umi;
    const overlayEntryContent = fs.readFileSync(overlayEntry, 'utf-8');

    expect(overlayEntry).toEqual(
      expect.stringContaining('/utoopack-overlay/umi.js'),
    );
    expect(overlayEntryContent).toContain('void import("./client.js")');
    expect(overlayEntryContent).toContain('.then(() => import(');
    expect(overlayEntryContent).toContain('src/.umi/umi.ts');
    expect(overlayEntryContent).not.toContain('import "./client.js";');
  });

  test('uses separate utoopack error overlay wrapper files for multiple development entries', async () => {
    mockedGetConfig.mockImplementationOnce(async (opts) =>
      createWebpackConfig(undefined, {}, opts.entry),
    );

    const config = await getDevUtooPackConfig({
      ...baseOpts,
      entry: {
        foo: './src/foo.ts',
        bar: './src/bar.ts',
      },
      config: {},
    } as any);

    expect(config.config.entry.foo).toEqual(
      expect.stringContaining('/utoopack-overlay/foo.js'),
    );
    expect(config.config.entry.bar).toEqual(
      expect.stringContaining('/utoopack-overlay/bar.js'),
    );
    expect(fs.readFileSync(config.config.entry.foo, 'utf-8')).toContain(
      'src/foo.ts',
    );
    expect(fs.readFileSync(config.config.entry.bar, 'utf-8')).toContain(
      'src/bar.ts',
    );
  });

  test('does not prepend utoopack error overlay client to production entries', async () => {
    mockedGetConfig.mockImplementationOnce(async (opts) =>
      createWebpackConfig(undefined, {}, opts.entry),
    );

    const config = await getProdUtooPackConfig({
      ...baseOpts,
      entry: {
        umi: './src/.umi/umi.ts',
      },
      config: {},
    } as any);

    expect(config.config.entry).toEqual({
      umi: './src/.umi/umi.ts',
    });
  });
});

describe('utoopack define config', () => {
  test('passes user define values to production utoopack config without stringifying leaves', async () => {
    const routePathEnum = {
      INDEX: '/',
      DETAIL: '/detail',
    };

    const config = await getProdUtooPackConfig({
      ...baseOpts,
      config: {
        define: {
          RoutePathEnum: routePathEnum,
          FEATURE_FLAG: true,
          COUNT: 1,
        },
      },
    } as any);

    expect(config.config.define).toMatchObject({
      RoutePathEnum: routePathEnum,
      FEATURE_FLAG: true,
      COUNT: 1,
    });
    expect(config.config.define?.RoutePathEnum.INDEX).toBe('/');
    expect(config.config.define?.RoutePathEnum.DETAIL).toBe('/detail');
  });

  test('quotes top-level string defines for utoopack expressions', async () => {
    const config = await getProdUtooPackConfig({
      ...baseOpts,
      config: {
        define: {
          testDefine: 'testDefine',
          'process.env.SSR_BUILD_TARGET': 'express',
        },
      },
    } as any);

    expect(config.config.define?.testDefine).toBe('"testDefine"');
    expect(config.config.define?.['process.env.SSR_BUILD_TARGET']).toBe(
      '"express"',
    );
  });

  test('quotes SOCKET_SERVER define but keeps processEnv raw', async () => {
    const prevSocketServer = process.env.SOCKET_SERVER;
    process.env.SOCKET_SERVER = 'http://127.0.0.1:8001';

    try {
      const config = await getDevUtooPackConfig({
        ...baseOpts,
        config: {},
      } as any);

      expect(config.config.define?.['process.env.SOCKET_SERVER']).toBe(
        '"http://127.0.0.1:8001"',
      );
      expect(config.processEnv?.['process.env.SOCKET_SERVER']).toBe(
        'http://127.0.0.1:8001',
      );
    } finally {
      if (prevSocketServer === undefined) {
        delete process.env.SOCKET_SERVER;
      } else {
        process.env.SOCKET_SERVER = prevSocketServer;
      }
    }
  });
});

describe('utoopack extra babel config', () => {
  test('adds babel-loader rules for extraBabelPlugins in production', async () => {
    const babelPreset = ['/path/to/babel-preset-umi', { presetReact: {} }];
    const config = await getProdUtooPackConfig({
      ...baseOpts,
      babelPreset,
      beforeBabelPlugins: [() => null, 'before-plugin'],
      beforeBabelPresets: ['before-preset'],
      extraBabelPlugins: ['api-plugin'],
      extraBabelPresets: ['api-preset'],
      config: {
        targets: {
          chrome: 80,
        },
        babelLoaderCustomize: '/path/to/customize',
        extraBabelPlugins: [['babel-plugin-istanbul', { cwd: '/tmp' }]],
        extraBabelPresets: ['user-preset'],
        utoopack: {
          babelLoader: true,
        },
      },
    } as any);

    const rules = config.config.module?.rules || {};
    const rule = rules['**/*.tsx'] as any;
    const loader = rule.loaders[0];

    expect(Object.keys(rules)).toEqual(
      expect.arrayContaining([
        '**/*.js',
        '**/*.mjs',
        '**/*.cjs',
        '**/*.jsx',
        '**/*.ts',
        '**/*.tsx',
      ]),
    );
    expect(rule.as).toBe('*.js');
    expect(rule.condition).toMatchObject({
      all: [{ not: 'foreign' }, { not: { path: expect.any(RegExp) } }],
    });
    expect(loader.loader).toContain('babel-loader');
    expect(loader.options).toMatchObject({
      sourceType: 'unambiguous',
      babelrc: false,
      configFile: false,
      cacheDirectory: false,
      browserslistConfigFile: false,
      targets: {
        chrome: 80,
      },
      customize: '/path/to/customize',
    });
    expect(loader.options.presets).toEqual([
      babelPreset,
      'before-preset',
      'api-preset',
      'user-preset',
    ]);
    expect(loader.options.plugins).toEqual([
      'before-plugin',
      'api-plugin',
      ['babel-plugin-istanbul', { cwd: '/tmp' }],
    ]);
  });

  test('does not add babel-loader rules unless utoopack babelLoader is enabled', async () => {
    const config = await getProdUtooPackConfig({
      ...baseOpts,
      config: {
        extraBabelPlugins: [
          [
            'babel-plugin-import',
            { libraryName: 'antd', libraryDirectory: 'es' },
          ],
          '@emotion/babel-plugin',
          'babel-plugin-istanbul',
        ],
        utoopack: {},
      },
    } as any);

    expect(config.config.module).toBeUndefined();
    expect(config.config.optimization?.modularizeImports).toEqual({
      antd: {
        transform: 'antd/es/{{ kebabCase member }}',
        preventFullImport: false,
        skipDefaultConversion: false,
        style: undefined,
      },
    });
    expect(config.config.styles?.emotion).toBe(true);
  });

  test('adds babel-loader rules for reactCompiler without utoopack babelLoader', async () => {
    const reactCompilerPlugin = [
      'babel-plugin-react-compiler',
      { target: '18' },
    ];
    const config = await getProdUtooPackConfig({
      ...baseOpts,
      beforeBabelPlugins: [reactCompilerPlugin],
      config: {
        reactCompiler: {
          target: '18',
        },
        utoopack: {},
      },
    } as any);

    const rule = config.config.module?.rules?.['**/*.tsx'] as any;
    const loader = rule.loaders[0];

    expect(loader.loader).toContain('babel-loader');
    expect(loader.options.plugins).toEqual([reactCompilerPlugin]);
  });

  test('keeps native babel plugin adapters when babelLoader is enabled', async () => {
    const config = await getDevUtooPackConfig({
      ...baseOpts,
      config: {
        extraBabelPlugins: [
          [
            'babel-plugin-import',
            { libraryName: 'antd', libraryDirectory: 'es' },
          ],
          '@emotion/babel-plugin',
          'babel-plugin-istanbul',
        ],
        utoopack: {
          babelLoader: true,
        },
      },
    } as any);

    const rule = config.config.module?.rules?.['**/*.tsx'] as any;
    const loader = rule.loaders[0];

    expect(loader.options.plugins).toEqual(['babel-plugin-istanbul']);
    expect(config.config.optimization?.modularizeImports).toEqual({
      antd: {
        transform: 'antd/es/{{ kebabCase member }}',
        preventFullImport: false,
        skipDefaultConversion: false,
        style: undefined,
      },
    });
    expect(config.config.styles?.emotion).toBe(true);
  });

  test('removes antd packageImports for legacy antd with modularized imports', async () => {
    const config = await getProdUtooPackConfig({
      ...baseOpts,
      config: {
        antd: {
          import: true,
        },
        extraBabelPlugins: [
          [
            'babel-plugin-import',
            {
              libraryName: 'antd',
              libraryDirectory: 'es',
              style: true,
            },
          ],
        ],
        utoopack: {
          optimization: {
            packageImports: ['antd', 'lodash'],
          },
        },
      },
    } as any);

    expect(config.config.optimization?.packageImports).toEqual(['lodash']);
  });

  test('keeps antd packageImports for modern antd', async () => {
    const config = await getProdUtooPackConfig({
      ...baseOpts,
      config: {
        antd: {
          import: false,
        },
        extraBabelPlugins: [
          [
            'babel-plugin-import',
            {
              libraryName: 'antd',
              libraryDirectory: 'es',
              style: true,
            },
          ],
        ],
        utoopack: {
          optimization: {
            packageImports: ['antd', 'lodash'],
          },
        },
      },
    } as any);

    expect(config.config.optimization?.packageImports).toEqual([
      'antd',
      'lodash',
    ]);
  });
});

describe('utoopack externals config', () => {
  test('keeps script-prefixed CDN externals as script externals', async () => {
    const config = await getProdUtooPackConfig({
      ...baseOpts,
      config: {
        externals: {
          jszip: [
            'script https://gw.alipayobjects.com/os/lib/jszip/3.10.1/dist/jszip.min.js',
            'JSZip',
          ],
        },
      },
    } as any);

    expect(config.config.externals?.jszip).toEqual({
      root: 'JSZip',
      type: 'script',
      script:
        'https://gw.alipayobjects.com/os/lib/jszip/3.10.1/dist/jszip.min.js',
    });
  });

  test('keeps promise externals as promise externals', async () => {
    const config = await getProdUtooPackConfig({
      ...baseOpts,
      config: {
        externals: {
          'promise-external': [
            'promise',
            'Promise.resolve({ default: "from-promise-external" })',
          ],
        },
      },
    } as any);

    expect(config.config.externals?.['promise-external']).toEqual(
      'promise Promise.resolve({ default: "from-promise-external" })',
    );
  });

  test('keeps string promise externals as promise externals', async () => {
    const config = await getProdUtooPackConfig({
      ...baseOpts,
      config: {
        externals: {
          'promise-external':
            'promise Promise.resolve({ default: "from-promise-external" })',
        },
      },
    } as any);

    expect(config.config.externals?.['promise-external']).toEqual(
      'promise Promise.resolve({ default: "from-promise-external" })',
    );
  });

  test('normalizes webpack-style glob externals into subPath externals', async () => {
    const config = await getProdUtooPackConfig({
      ...baseOpts,
      config: {
        externals: {
          'lodash/*': 'lodash',
          'lodash/fp/*': 'lodash',
          '@scope/pkg/es/*': 'window.ScopePkg',
        },
      },
    } as any);

    expect(config.config.externals?.['lodash/*']).toBeUndefined();
    expect(config.config.externals?.['lodash/fp/*']).toBeUndefined();
    expect(config.config.externals?.['@scope/pkg/es/*']).toBeUndefined();
    expect(config.config.externals?.lodash).toEqual({
      root: 'lodash',
      subPath: {
        rules: [
          {
            regex: '/^\\/.+$/',
            target: '',
          },
          {
            regex: '/^\\/fp\\/.+$/',
            target: '',
          },
        ],
      },
    });
    expect(config.config.externals?.['@scope/pkg']).toEqual({
      root: 'ScopePkg',
      subPath: {
        rules: [
          {
            regex: '/^\\/es\\/.+$/',
            target: '',
          },
        ],
      },
    });
  });
});
