import { getConfigRoutes } from './routesConfig';

test('normal', () => {
  expect(
    getConfigRoutes({
      routes: [
        {
          path: '/',
          component: 'index',
        },
        {
          path: '/foo',
          component: 'foo',
        },
      ],
    }),
  ).toEqual({
    1: {
      file: 'index',
      path: '/',
      absPath: '/',
      id: '1',
      parentId: undefined,
    },
    2: {
      file: 'foo',
      path: '/foo',
      id: '2',
      absPath: '/foo',
      parentId: undefined,
    },
  });
});

test('complex nested children routes', () => {
  expect(
    getConfigRoutes({
      routes: [
        {
          path: '/',
          component: 'index',
          routes: [
            { path: 'bar', component: 'bar' },
            { path: 'foo', component: 'foo' },
            {
              path: 'deep',
              routes: [
                {
                  path: 'foo',
                },
              ],
            },
          ],
        },
        {
          path: '/sub',
          routes: [
            { path: 'bar', component: 'bar' },
            {
              path: '',
            },
            {
              path: 'foo/*',
            },
            {
              path: '*',
            },
          ],
        },
      ],
    }),
  ).toEqual({
    // `/` group
    1: {
      file: 'index',
      path: '/',
      id: '1',
      parentId: undefined,
      absPath: '/',
    },
    2: {
      file: 'bar',
      id: '2',
      parentId: '1',
      path: 'bar',
      absPath: '/bar',
    },
    3: {
      file: 'foo',
      id: '3',
      parentId: '1',
      path: 'foo',
      absPath: '/foo',
    },
    // `/deep` group
    4: {
      id: '4',
      parentId: '1',
      path: 'deep',
      absPath: '/deep',
    },
    5: {
      id: '5',
      parentId: '4',
      path: 'foo',
      absPath: '/deep/foo',
    },
    // `/sub` group
    6: {
      id: '6',
      parentId: undefined,
      path: '/sub',
      absPath: '/sub',
    },
    7: {
      id: '7',
      parentId: '6',
      file: 'bar',
      path: 'bar',
      absPath: '/sub/bar',
    },
    8: {
      id: '8',
      parentId: '6',
      path: '',
      absPath: '/sub',
    },
    9: {
      id: '9',
      parentId: '6',
      path: 'foo/*',
      absPath: '/sub/foo/*',
    },
    10: {
      id: '10',
      parentId: '6',
      path: '*',
      absPath: '/sub/*',
    },
  });
});

test('compatible subpath maybe empty', () => {
  expect(
    getConfigRoutes({
      routes: [
        {
          path: '/foo',
          component: 'index',
          routes: [{ component: 'foo' }],
        },
      ],
    }),
  ).toEqual({
    1: {
      id: '1',
      file: 'index',
      parentId: undefined,
      path: '/foo',
      absPath: '/foo',
    },
    2: {
      id: '2',
      file: 'foo',
      parentId: '1',
      path: undefined,
      absPath: '/foo',
    },
  });
});

test('wrappers', () => {
  expect(
    getConfigRoutes({
      routes: [
        {
          path: '/',
          component: 'index',
          routes: [
            {
              path: 'bar',
              component: 'bar',
              wrappers: ['wrapperA', 'wrapperB'],
            },
            { path: 'foo', component: 'foo' },
          ],
        },
      ],
    }),
  ).toEqual({
    1: {
      file: 'index',
      path: '/',
      id: '1',
      parentId: undefined,
      absPath: '/',
    },
    2: {
      file: 'bar',
      id: '2',
      parentId: '4',
      path: '',
      absPath: '/bar',
      originPath: 'bar',
    },
    3: {
      file: 'wrapperA',
      id: '3',
      parentId: '1',
      path: 'bar',
      absPath: '/bar',
      isWrapper: true,
    },
    4: {
      file: 'wrapperB',
      id: '4',
      parentId: '3',
      path: '',
      absPath: '/bar',
      isWrapper: true,
    },
    5: {
      file: 'foo',
      id: '5',
      parentId: '1',
      path: 'foo',
      absPath: '/foo',
    },
  });
});

test('wrappers should inherit layout: false', () => {
  expect(
    getConfigRoutes({
      routes: [
        {
          path: '/home/*',
          component: 'index',
          wrappers: ['wrapperA', 'wrapperB'],
          layout: false,
        },
      ],
    }),
  ).toEqual({
    '2': {
      id: '2',
      path: '/home/*',
      absPath: '/home/*',
      file: 'wrapperA',
      parentId: undefined,
      isWrapper: true,
      layout: false,
    },
    '3': {
      id: '3',
      path: '*',
      file: 'wrapperB',
      absPath: '/home/*',
      parentId: '2',
      isWrapper: true,
      layout: false,
    },
    '1': {
      id: '1',
      file: 'index',
      path: '*',
      absPath: '/home/*',
      parentId: '3',
      originPath: '/home/*',
      layout: false,
    },
  });
});

test('wrappers path ends with `*`, children should inherit `*` as path', () => {
  // multi wrappers
  expect(
    getConfigRoutes({
      routes: [
        {
          path: '/home/*',
          component: 'index',
          wrappers: ['wrapperA', 'wrapperB'],
        },
      ],
    }),
  ).toEqual({
    '2': {
      id: '2',
      path: '/home/*',
      absPath: '/home/*',
      file: 'wrapperA',
      parentId: undefined,
      isWrapper: true,
    },
    '3': {
      id: '3',
      path: '*',
      file: 'wrapperB',
      absPath: '/home/*',
      parentId: '2',
      isWrapper: true,
    },
    '1': {
      id: '1',
      file: 'index',
      path: '*',
      absPath: '/home/*',
      parentId: '3',
      originPath: '/home/*',
    },
  });
  // single wrapper
  expect(
    getConfigRoutes({
      routes: [
        {
          path: '/*',
          component: 'index',
          wrappers: ['wrapper'],
        },
      ],
    }),
  ).toEqual({
    '2': {
      id: '2',
      path: '/*',
      absPath: '/*',
      file: 'wrapper',
      parentId: undefined,
      isWrapper: true,
    },
    '1': {
      id: '1',
      path: '*',
      absPath: '/*',
      originPath: '/*',
      file: 'index',
      parentId: '2',
    },
  });
});

test('opts.onResolveComponent', () => {
  expect(
    getConfigRoutes({
      routes: [
        {
          path: '/',
          component: 'index',
        },
      ],
      onResolveComponent(component) {
        return `${component}-resolved`;
      },
    }),
  ).toEqual({
    1: {
      file: 'index-resolved',
      path: '/',
      id: '1',
      parentId: undefined,
      absPath: '/',
    },
  });
});
