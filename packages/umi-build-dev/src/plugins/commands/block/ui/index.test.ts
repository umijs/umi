import { routeExists } from './index';

test('not exists', () => {
  expect(routeExists('/foo', [{ path: '/bar' }])).toEqual(false);
});

test('exists', () => {
  expect(routeExists('/foo', [{ path: '/bar' }, { path: '/foo' }])).toEqual(true);
});

test('child routes exists', () => {
  expect(routeExists('/foo', [{ routes: [{ path: '/bar' }, { path: '/foo' }] }])).toEqual(true);
});
