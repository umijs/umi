import getRoutePaths from './getRoutePaths';

test('normal', () => {
  expect(getRoutePaths([{ path: '/' }, { path: '/users' }])).toEqual(['/', '/users']);
});

test('route without component', () => {
  expect(getRoutePaths([{ path: '/' }, { component: 'Foo' }])).toEqual(['/']);
});

test('empty routes', () => {
  expect(getRoutePaths([])).toEqual([]);
});

test('nested routes', () => {
  expect(
    getRoutePaths([{ path: '/' }, { path: '/users', routes: [{ path: '/users/list' }] }]),
  ).toEqual(['/', '/users', '/users/list']);
});

test('dynamic routes', () => {
  expect(getRoutePaths([{ path: '/' }, { path: '/users/:id' }])).toEqual(['/', '/users/:id']);
});

test('duplicated routes', () => {
  expect(getRoutePaths([{ path: '/' }, { path: '/users' }, { path: '/users' }])).toEqual([
    '/',
    '/users',
  ]);
});

test('duplicated in nested routes', () => {
  expect(getRoutePaths([{ path: '/', routes: [{ path: '/' }, { path: '/users' }] }])).toEqual([
    '/',
    '/users',
  ]);
});
