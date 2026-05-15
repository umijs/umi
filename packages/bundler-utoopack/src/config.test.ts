jest.mock('@umijs/bundler-webpack', () => ({
  getConfig: jest.fn(async () => ({
    output: {},
    resolve: {
      alias: {},
    },
  })),
}));

jest.mock('@utoo/pack', () => ({
  compatOptionsFromWebpack: jest.fn(() => ({
    config: {
      output: {},
      resolve: {
        alias: {},
      },
    },
  })),
}));

import { getConfig } from '@umijs/bundler-webpack';
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

function createWebpackConfig(miniCssExtractOptions?: {
  filename?: string;
  chunkFilename?: string;
}) {
  return {
    output: {},
    resolve: {
      alias: {},
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

describe('utoopack mdx config', () => {
  test('uses name placeholder as default css output filename', async () => {
    const prodConfig = await getProdUtooPackConfig({
      ...baseOpts,
      config: {},
    } as any);
    const devConfig = await getDevUtooPackConfig({
      ...baseOpts,
      config: {},
    } as any);

    expect(prodConfig.config.output?.cssFilename).toBe('[name].css');
    expect(prodConfig.config.output?.cssChunkFilename).toBe('[name].chunk.css');
    expect(devConfig.config.output?.cssFilename).toBe('[name].css');
    expect(devConfig.config.output?.cssChunkFilename).toBe('[name].chunk.css');
  });

  test('uses entry name as ssr css output filename', async () => {
    const config = await getProdUtooPackConfig({
      ...baseOpts,
      config: {
        ssr: {},
      },
    } as any);

    expect(config.config.output?.cssFilename).toBe('index.css');
    expect(config.config.output?.cssChunkFilename).toBe('umi.css');
    expect(config.config.optimization?.splitChunks?.css).toEqual({
      minChunkSize: 100_000_000,
      maxChunkCountPerGroup: 1,
      maxMergeChunkSize: 100_000_000,
    });
  });

  test('allows user ssr css splitChunks override', async () => {
    const config = await getProdUtooPackConfig({
      ...baseOpts,
      config: {
        ssr: {},
        utoopack: {
          optimization: {
            splitChunks: {
              css: {
                maxChunkCountPerGroup: 2,
                maxMergeChunkSize: 200_000_000,
              },
            },
          },
        },
      },
    } as any);

    expect(config.config.optimization?.splitChunks?.css).toEqual({
      minChunkSize: 100_000_000,
      maxChunkCountPerGroup: 2,
      maxMergeChunkSize: 200_000_000,
    });
  });

  test('uses hashed css output filenames in production', async () => {
    const config = await getProdUtooPackConfig({
      ...baseOpts,
      config: {
        hash: true,
      },
    } as any);

    expect(config.config.output?.cssFilename).toBe(
      '[name].[contenthash:8].css',
    );
    expect(config.config.output?.cssChunkFilename).toBe(
      '[name].[contenthash:8].chunk.css',
    );
  });

  test('uses mini-css-extract css output templates from webpack config', async () => {
    mockedGetConfig.mockResolvedValueOnce(
      createWebpackConfig({
        filename: 'css/[name].[hash:8].css',
        chunkFilename: 'css/[name].[chunkhash:8].async.css',
      }),
    );

    const config = await getProdUtooPackConfig({
      ...baseOpts,
      config: {},
    } as any);

    expect(config.config.output?.cssFilename).toBe(
      'css/[name].[contenthash:8].css',
    );
    expect(config.config.output?.cssChunkFilename).toBe(
      'css/[name].[contenthash:8].async.css',
    );
  });

  test('does not use name placeholder for multi-entry css output filename', async () => {
    const config = await getProdUtooPackConfig({
      ...baseOpts,
      entry: {
        foo: './src/foo.tsx',
        bar: './src/bar.tsx',
      },
      config: {},
    } as any);

    expect(config.config.output?.cssFilename).toBe('[name].css');
    expect(config.config.output?.cssChunkFilename).toBe('[name].chunk.css');
  });

  test('allows user css output filename override', async () => {
    const prodConfig = await getProdUtooPackConfig({
      ...baseOpts,
      config: {
        utoopack: {
          output: {
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
            cssFilename: 'custom.css',
            cssChunkFilename: 'custom.chunk.css',
          },
        },
      },
    } as any);

    expect(prodConfig.config.output?.cssFilename).toBe('custom.css');
    expect(prodConfig.config.output?.cssChunkFilename).toBe('custom.chunk.css');
    expect(devConfig.config.output?.cssFilename).toBe('custom.css');
    expect(devConfig.config.output?.cssChunkFilename).toBe('custom.chunk.css');
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
  });

  test('passes NODE_ENV define to production server bundle', async () => {
    const config = await getSSRUtooPackConfig({
      ...baseOpts,
      config: {},
      serverBuildPath: '/tmp/umi.server.js',
    } as any);

    expect(config.config.define?.['process.env.NODE_ENV']).toBe('"production"');
  });

  test('passes NODE_ENV define to development server bundle', async () => {
    const config = await getSSRUtooPackConfig({
      ...baseOpts,
      config: {},
      serverBuildPath: '/tmp/umi.server.js',
      isDev: true,
    } as any);

    expect(config.config.define?.['process.env.NODE_ENV']).toBe(
      '"development"',
    );
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
    const rule = rules['**/src/**/*.tsx'] as any;
    const loader = rule.loaders[0];

    expect(Object.keys(rules)).toEqual(
      expect.arrayContaining([
        '**/src/**/*.js',
        '**/src/**/*.mjs',
        '**/src/**/*.cjs',
        '**/src/**/*.jsx',
        '**/src/**/*.ts',
        '**/src/**/*.tsx',
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

    const rule = config.config.module?.rules?.['**/src/**/*.tsx'] as any;
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
});
