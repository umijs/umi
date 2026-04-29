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

import { getDevUtooPackConfig, getProdUtooPackConfig } from './config';

const baseOpts = {
  cwd: process.cwd(),
  rootDir: process.cwd(),
  entry: {
    index: './src/index.tsx',
  },
};

describe('utoopack mdx config', () => {
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
