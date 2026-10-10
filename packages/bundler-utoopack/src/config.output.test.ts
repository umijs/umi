import {
  getDevUtooPackConfig,
  getProdUtooPackConfig,
  getSSRUtooPackConfig,
} from './config';

const baseOpts = {
  cwd: process.cwd(),
  rootDir: process.cwd(),
  entry: { umi: './src/index.tsx' },
};

describe('utoopack output defaults', () => {
  test('uses full content hashes for production chunks and CSS', async () => {
    const result = await getProdUtooPackConfig({
      ...baseOpts,
      config: { hash: true },
    });

    expect(result.config.output).toMatchObject({
      filename: '[name].[contenthash:8].js',
      chunkFilename: '[contenthash].async.js',
      cssFilename: '[contenthash].css',
    });
  });

  test.each([false, undefined])('preserves hash=%s', async (hash) => {
    const result = await getProdUtooPackConfig({
      ...baseOpts,
      config: { hash },
    });

    expect(result.config.output).toMatchObject({
      filename: '[name].js',
      chunkFilename: '[name].async.js',
      cssFilename: '[name].css',
    });
  });

  test('preserves development names even with hash enabled', async () => {
    const result = await getDevUtooPackConfig({
      ...baseOpts,
      config: { hash: true },
    });

    expect(result.config.output).toMatchObject({
      filename: '[name].js',
      chunkFilename: '[name].async.js',
    });
  });

  test('lets framework hooks prefix the new defaults', async () => {
    const result = await getProdUtooPackConfig({
      ...baseOpts,
      config: { hash: true },
      chainWebpack: (config: any) => {
        config.output.chunkFilename(`js/${config.output.get('chunkFilename')}`);
        config
          .plugin('mini-css-extract-plugin')
          .tap(([options]: any[]) => [
            { ...options, filename: `css/${options.filename}` },
          ]);
      },
    });

    expect(result.config.output).toMatchObject({
      chunkFilename: 'js/[contenthash].async.js',
      cssFilename: 'css/[contenthash].css',
    });
  });

  test('preserves explicit chainWebpack templates', async () => {
    const result = await getProdUtooPackConfig({
      ...baseOpts,
      config: {
        hash: true,
        chainWebpack(config: any) {
          config.output.filename('entry/[name].js');
          config.output.chunkFilename('chunks/[name].js');
          config
            .plugin('mini-css-extract-plugin')
            .tap(([options]: any[]) => [
              { ...options, filename: 'styles/[name].css' },
            ]);
        },
      },
    });

    expect(result.config.output).toMatchObject({
      filename: 'entry/[name].js',
      chunkFilename: 'chunks/[name].js',
      cssFilename: 'styles/[name].css',
    });
  });

  test('preserves modifyWebpackConfig and utoopack.output overrides', async () => {
    const result = await getProdUtooPackConfig({
      ...baseOpts,
      config: {
        hash: true,
        utoopack: { output: { cssFilename: 'custom/[name].css' } },
      },
      modifyWebpackConfig(config: any) {
        config.output.chunkFilename = 'custom/[name].js';
        return config;
      },
    });

    expect(result.config.output).toMatchObject({
      chunkFilename: 'custom/[name].js',
      cssFilename: 'custom/[name].css',
    });
  });

  test('supports inline styles without an extraction plugin', async () => {
    const result = await getProdUtooPackConfig({
      ...baseOpts,
      config: { hash: true, styleLoader: {} },
    });

    expect(result.config.output?.chunkFilename).toBe('[contenthash].async.js');
    expect(result.config.output?.cssFilename).toBeUndefined();
  });

  test('preserves server output names', async () => {
    const result = await getSSRUtooPackConfig({
      ...baseOpts,
      config: { hash: true },
      serverBuildPath: 'dist/server',
      useHash: true,
    });

    expect(result.config.output).toMatchObject({
      filename: '[name].[contenthash:8].js',
      chunkFilename: '[name].[contenthash:8].js',
    });
  });
});
