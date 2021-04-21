import { getScripts, getStyles } from './utils';

test('getScripts string', () => {
  const option1: string[] = [];
  const option2 = [
    'https://gw.alipayobjects.com/as/g/h5-lib/lottie-web/5.3.4/lottie.min.js',
  ];
  const option3 = [`console.log(1);`];
  const option4 = [
    'https://gw.alipayobjects.com/as/g/h5-lib/lottie-web/5.3.4/lottie.min.js',
    `alert(1);`,
  ];

  expect(getScripts(option1)).toEqual([]);
  expect(getScripts(option2)).toEqual([
    {
      src:
        'https://gw.alipayobjects.com/as/g/h5-lib/lottie-web/5.3.4/lottie.min.js',
    },
  ]);
  expect(getScripts(option3)).toEqual([
    {
      content: 'console.log(1);',
    },
  ]);
  expect(getScripts(option4)).toEqual([
    {
      src:
        'https://gw.alipayobjects.com/as/g/h5-lib/lottie-web/5.3.4/lottie.min.js',
    },
    {
      content: 'alert(1);',
    },
  ]);
});

test('getScripts object', () => {
  const option2 = [
    {
      src:
        'https://gw.alipayobjects.com/as/g/h5-lib/lottie-web/5.3.4/lottie.min.js',
      crossOrigin: 'anonymous',
    },
    'alert(1);',
    'https://gw.alipayobjects.com/as/g/h5-lib/lottie-web/5.3.4/lottie.min.js',
  ];

  expect(getScripts(option2)).toEqual([
    {
      src:
        'https://gw.alipayobjects.com/as/g/h5-lib/lottie-web/5.3.4/lottie.min.js',
      crossOrigin: 'anonymous',
    },
    {
      content: 'alert(1);',
    },
    {
      src:
        'https://gw.alipayobjects.com/as/g/h5-lib/lottie-web/5.3.4/lottie.min.js',
    },
  ]);
});

test('getScripts other', () => {
  const option2 = [
    null,
    'console.log(1);',
    'https://gw.alipayobjects.com/as/g/h5-lib/lottie-web/5.3.4/lottie.min.js',
    '',
    undefined,
    {},
  ] as string[];

  expect(getScripts(option2)).toEqual([
    {
      content: 'console.log(1);',
    },
    {
      src:
        'https://gw.alipayobjects.com/as/g/h5-lib/lottie-web/5.3.4/lottie.min.js',
    },
  ]);
});

test('getStyles', () => {
  expect(
    getStyles(['//g.alipay.com/index.min.css', `.a{color: red};`]),
  ).toEqual([
    [
      {
        charset: 'utf-8',
        rel: 'stylesheet',
        type: 'text/css',
        href: '//g.alipay.com/index.min.css',
      },
    ],
    [{ content: '.a{color: red};' }],
  ]);

  expect(
    getStyles([
      '//g.alipay.com/index.min.css',
      {
        content: `.a{color: red};`,
        type: 'text/css',
        title: 'test',
      },
    ]),
  ).toEqual([
    [
      {
        charset: 'utf-8',
        rel: 'stylesheet',
        type: 'text/css',
        href: '//g.alipay.com/index.min.css',
      },
    ],
    [{ content: '.a{color: red};', type: 'text/css', title: 'test' }],
  ]);
});
