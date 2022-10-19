import { extractBabelPluginImportOptions } from './webpackUtils';

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
