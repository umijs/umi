import alias from './alias';

describe('alias config transformer', () => {
  test('no alias', () => {
    expect(alias({}, {})).toEqual({
      resolve: {
        alias: [{ find: /^~/, replacement: '' }],
      },
    });
  });

  test('normal alias replacement', () => {
    expect(
      alias(
        {
          alias: {
            umi: '@@/exports',
            '@': '/umi-next/examples/umi',
          },
        },
        {},
      ),
    ).toEqual({
      resolve: {
        alias: [
          { find: /^~?umi(?=\/|$)/, replacement: '@@/exports' },
          {
            find: /^~?@(?=\/|$)/,
            replacement: '/umi-next/examples/umi',
          },
          { find: /^~/, replacement: '' },
        ],
      },
    });
  });

  //多层递归 alias
  test('Multi-level alias replacement', () => {
    expect(
      alias(
        {
          alias: {
            umi: '@@/exports',
            '@@': '/umi-next/examples/umi',
          },
        },
        {},
      ),
    ).toEqual({
      resolve: {
        alias: [
          {
            find: /^~?umi(?=\/|$)/,
            replacement: '/umi-next/examples/umi/exports',
          },
          {
            find: /^~?@@(?=\/|$)/,
            replacement: '/umi-next/examples/umi',
          },
          { find: /^~/, replacement: '' },
        ],
      },
    });
  });

  //循环 alias ,以最后一次设置为准
  test('dead cycle alias replacement', () => {
    expect(
      alias(
        {
          alias: {
            umi: '@@/exports',
            '@@/exports': 'umi',
          },
        },
        {},
      ),
    ).toEqual({
      resolve: {
        alias: [
          { find: /^~?umi(?=\/|$)/, replacement: 'umi' },
          {
            find: /^~?@@\/exports(?=\/|$)/,
            replacement: 'umi',
          },
          { find: /^~/, replacement: '' },
        ],
      },
    });
  });
});
