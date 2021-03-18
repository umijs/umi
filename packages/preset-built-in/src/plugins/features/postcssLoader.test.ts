import postCSSLoaderPlugin from './postcssLoader';

test('postcss-loader deprecates keys', (done) => {
  postCSSLoaderPlugin({
    describe: () => {},
    logger: {
      warn: console.warn,
    },
    modifyConfig: (fn) => {
      const config = fn({
        postcssLoader: {
          plugins: ['postcss-plugin-a'],
          syntax: 'sugarss',
          parser: 'postcss-js',
          stringifier: 'sugarss',
        },
      });
      expect(config).toEqual({
        postcssLoader: {
          postcssOptions: {
            plugins: ['postcss-plugin-a'],
            syntax: 'sugarss',
            parser: 'postcss-js',
            stringifier: 'sugarss',
          },
        },
      });
      done();
    },
  });
});

test('postcss-loader normal keys', (done) => {
  postCSSLoaderPlugin({
    describe: () => {},
    logger: {
      warn: console.warn,
    },
    modifyConfig: (fn) => {
      const userConfig = {
        postcssLoader: {
          postcssOptions: {
            plugins: ['postcss-plugin-a'],
            syntax: 'sugarss',
            parser: 'postcss-js',
            stringifier: 'sugarss',
          },
        },
      };
      const config = fn(userConfig);
      expect(config).toEqual(userConfig);
      done();
    },
  });
});
