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
    },
    b: {
      path: 'b',
      id: 'b',
      parentId: undefined,
      file: 'b.ts',
    },
    'b/c': {
      path: 'c',
      id: 'b/c',
      parentId: 'b',
      file: 'b/c.ts',
    },
    d: {
      path: 'd',
      id: 'd',
      parentId: undefined,
      file: 'd.ts',
    },
  });
});
