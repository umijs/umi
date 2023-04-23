import css from './css';

test('css getBrowserlist', () => {
  const plugins = css({ targets: { chrome: 80, edge: 11 } }, {}).css!.postcss
    .plugins[0].plugins;
  expect(plugins).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ browsers: ['chrome >= 80', 'edge >= 11'] }),
    ]),
  );
});

test('postcssOptions', () => {
  const postcss = css(
    {
      postcssLoader: {
        postcssOptions: { postcss: 'option' },
      },
    },
    {},
  ).css!.postcss;
  expect(postcss).toEqual(
    expect.objectContaining({
      postcss: 'option',
    }),
  );
  const plugins = css(
    {
      postcssLoader: {
        postcssOptions: { postcss: 'option' },
      },
    },
    {},
  ).css!.postcss.plugins;
  expect(plugins).toEqual(expect.arrayContaining([]));
});

test('autoprefixer', () => {
  const cssplugins = css({ autoprefixer: { prefixer: 'auto' } }, {}).css.postcss
    .plugins;
  expect(
    cssplugins.some(({ plugins }) => {
      if (plugins instanceof Array) {
        return plugins.some(
          ({ options }) =>
            options.flexbox === 'no-2009' && options.prefixer === 'auto',
        );
      }
    }),
  ).toBe(true);
});

test('extraPostCSSPlugins plugins', () => {
  const plugins = css({ extraPostCSSPlugins: ['Plugins_1', 'Plugins_2'] }, {})
    .css!.postcss.plugins;
  expect(plugins).toEqual(expect.arrayContaining(['Plugins_1', 'Plugins_2']));
});

test('lessOptions', () => {
  const less = css(
    {
      lessLoader: {
        lessOptions: {
          Options: 'less',
        },
      },
      theme: {
        custom: 'usertheme',
      },
    },
    {},
  ).css!.preprocessorOptions!.less;
  expect(less).toEqual(
    expect.objectContaining({
      javascriptEnabled: true,
      Options: 'less',
      modifyVars: expect.objectContaining({
        custom: 'usertheme',
      }),
    }),
  );
});

test('theme', () => {
  const less = css(
    {
      theme: {
        custom: 'usertheme',
      },
    },
    {},
  ).css!.preprocessorOptions!.less;
  expect.objectContaining({
    javascriptEnabled: true,
    custom: 'usertheme',
  });
});
