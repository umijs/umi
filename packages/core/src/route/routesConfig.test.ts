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

test('child routes', () => {
  expect(
    getConfigRoutes({
      routes: [
        {
          path: '/',
          component: 'index',
          routes: [
            { path: 'bar', component: 'bar' },
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
