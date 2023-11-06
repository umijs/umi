import { join } from 'path';
import { getConventionRoutes } from './routesConvention';

const fixtures = join(__dirname, '../../fixtures/route');

test('normal', () => {
  expect(
    getConventionRoutes({
      base: join(fixtures, 'convention-a/pages'),
    }),
  ).toEqual({
    a: {
      path: 'a',
      id: 'a',
      parentId: undefined,
      file: 'a.ts',
      absPath: '/a',
    },
    b: {
      path: 'b',
      id: 'b',
      parentId: undefined,
      file: 'b.ts',
      absPath: '/b',
    },
    'b/index': {
      path: '',
      id: 'b/index',
      parentId: 'b',
      file: 'b/index.ts',
      absPath: '/b/',
    },
    'b/c': {
      path: 'c',
      id: 'b/c',
      parentId: 'b',
      file: 'b/c.ts',
      absPath: '/b/c',
    },
    'c/$index': {
      absPath: '/c/:index',
      file: 'c/$index.ts',
      id: 'c/$index',
      parentId: undefined,
      path: 'c/:index',
    },
    d: {
      path: 'd',
      id: 'd',
      parentId: undefined,
      file: 'd.ts',
      absPath: '/d',
    },
    'e/index': {
      path: 'e',
      id: 'e/index',
      parentId: undefined,
      file: 'e/index.ts',
      absPath: '/e',
    },
    'index/index': {
      absPath: '/',
      file: 'index/index.ts',
      id: 'index/index',
      parentId: undefined,
      path: '/',
    },
    'a-index/index': {
      absPath: '/a-index',
      file: 'a-index/index.ts',
      id: 'a-index/index',
      parentId: undefined,
      path: 'a-index',
    },
    'g/index/index': {
      absPath: '/g',
      file: 'g/index/index.ts',
      id: 'g/index/index',
      parentId: undefined,
      path: 'g',
    },
  });
});

test('exclude', () => {
  expect(
    getConventionRoutes({
      base: join(fixtures, 'convention-a/pages'),
      // only index or 404 file
      exclude: [/(?<!(index|\[index\]|404)(\.(js|jsx|ts|tsx)))$/],
    }),
  ).toEqual({
    'b/index': {
      path: 'b',
      id: 'b/index',
      parentId: undefined,
      file: 'b/index.ts',
      absPath: '/b',
    },
    'c/$index': {
      absPath: '/c/:index',
      file: 'c/$index.ts',
      id: 'c/$index',
      parentId: undefined,
      path: 'c/:index',
    },
    'e/index': {
      path: 'e',
      id: 'e/index',
      parentId: undefined,
      file: 'e/index.ts',
      absPath: '/e',
    },
    'index/index': {
      absPath: '/',
      file: 'index/index.ts',
      id: 'index/index',
      parentId: undefined,
      path: '/',
    },
    'a-index/index': {
      absPath: '/a-index',
      file: 'a-index/index.ts',
      id: 'a-index/index',
      parentId: undefined,
      path: 'a-index',
    },
    'g/index/index': {
      absPath: '/g',
      file: 'g/index/index.ts',
      id: 'g/index/index',
      parentId: undefined,
      path: 'g',
    },
  });
});
