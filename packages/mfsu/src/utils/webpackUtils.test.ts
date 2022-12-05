import path from 'path';
import { extractBabelPluginImportOptions, getResolver } from './webpackUtils';

test('extract babel plugin import options: no config', () => {
  const config: any = {
    module: {
      rules: [
        {
          use: [
            {
              loader: 'babel-loader/index.js',
              options: {
                plugins: [
                  'react-refresh/babel.js',
                  [() => null, 1, 2],
                  ['plugin-name', 'param-a', 'param-b'],
                ],
              },
            },
          ],
        },
      ],
    },
  };

  const bpiConfigs = extractBabelPluginImportOptions(config);

  expect(bpiConfigs.size).toEqual(0);
});

test('extract babel plugin import options: 1 config', () => {
  // prettier-ignore
  const config: any = {
    module: { rules: [ { use: [
      {
        loader: 'babel-loader/index.js',
        options: {
          plugins: [
            [
              'babel-plugin-import/lib/index.js',
              {
                libraryName: 'antd',
                libraryDirectory: 'es',
                style: true,
              },
              'antd',
            ],
          ],
        },
      },
    ],
   },],},
  };

  const result = extractBabelPluginImportOptions(config);

  expect(result.size).toEqual(1);
  expect(result.get('antd')).toEqual({
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true,
  });
});

test('extract babel plugin import options: 2 same config', () => {
  // prettier-ignore
  const config: any = {
    module: { rules: [
      { use: [
        {
          loader: 'babel-loader/index.js',
          options: {
            plugins: [
              [
                'babel-plugin-import/lib/index.js',
                {
                  libraryName: 'antd',
                  libraryDirectory: 'es',
                  style: true,
                },
                'antd',
              ],
            ],
          },
        },],
      },
      { use: [
        {
          loader: 'other/babel-loader/index.js',
          options: {
            plugins: [
              [
                'babel-plugin-import/lib/index.js',
                {
                  libraryName: 'antd',
                  libraryDirectory: 'es',
                  style: true,
                },
                'antd',
              ],
            ],
          },
        },],
      },
  ],},};

  const result = extractBabelPluginImportOptions(config);

  expect(result.size).toEqual(1);
  expect(result.get('antd')).toEqual({
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true,
  });
});

test('extract babel plugin import options: 2 different config', () => {
  // prettier-ignore
  const config: any = {
    module: { rules: [
        { use: [
            {
              loader: 'babel-loader/index.js',
              options: {
                plugins: [
                  [
                    'babel-plugin-import/lib/index.js',
                    {
                      libraryName: 'antd',
                      libraryDirectory: 'es',
                      style: true,
                    },
                    'antd',
                  ],
                ],
              },
            },],
        },
        { use: [
            {
              loader: 'other/babel-loader/index.js',
              options: {
                plugins: [
                  [
                    'babel-plugin-import/lib/index.js',
                    {
                      libraryName: '@umijs/max/antd',
                      libraryDirectory: 'es',
                      style: true,
                    },
                    'antd-in-max',
                  ],
                ],
              },
            },],
        },
      ],},};

  const result = extractBabelPluginImportOptions(config);

  expect(result.size).toEqual(2);

  expect(result.get('antd')).toEqual({
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true,
  });
  expect(result.get('@umijs/max/antd')).toEqual({
    libraryName: '@umijs/max/antd',
    libraryDirectory: 'es',
    style: true,
  });
});

describe('resolver', () => {
  const webpackBaseContext = path.join(__dirname, '../../');
  const entryPath = path.join(webpackBaseContext, './fixtures/entry/index.js');
  const resolver = getResolver({
    context: webpackBaseContext,
  });

  test('resolver throw Error if path not exists', () => {
    expect(() => resolver('./fixtures/entry/no-exist-file.js')).toThrow();
  });

  test('resolver with complete path', () => {
    expect(resolver('./fixtures/entry/index.js')).toEqual(entryPath);
    expect(
      resolver(path.join(webpackBaseContext, './fixtures/entry/index.js')),
    ).toEqual(entryPath);
  });

  test('resolver with omit file extension', () => {
    expect(resolver('./fixtures/entry/index')).toEqual(entryPath);
    expect(
      resolver(path.join(webpackBaseContext, './fixtures/entry/index')),
    ).toEqual(entryPath);
  });

  test('resolver with omit path filename', () => {
    expect(resolver('./fixtures/entry')).toEqual(entryPath);
    expect(resolver(path.join(webpackBaseContext, './fixtures/entry'))).toEqual(
      entryPath,
    );
  });

  test('resolver prefer file to same directory name', () => {
    expect(resolver('./fixtures/entry/main')).toEqual(
      path.join(webpackBaseContext, './fixtures/entry/main.js'),
    );
  });

  test('resolver is extensible by webpack.config.js', () => {
    expect(() => resolver('./fixtures/entry/main/app')).toThrow();

    const newResolver = getResolver({
      context: webpackBaseContext,
      resolve: {
        extensions: ['.vue'],
      },
    });

    expect(newResolver('./fixtures/entry/main/app')).toEqual(
      path.join(webpackBaseContext, './fixtures/entry/main/app.vue'),
    );
  });
});
