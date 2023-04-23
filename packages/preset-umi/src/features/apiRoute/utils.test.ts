import { IRoute } from '../../types';
import { matchApiRoute } from './utils';

const apiRoutes: IRoute[] = [
  {
    path: 'users/[userId]/repos/[repoId]',
    id: 'users/[userId]/repos/[repoId]',
    file: 'users/[userId]/repos/[repoId].ts',
    absPath: '',
  },
  {
    path: 'users/[userId]/repos',
    id: 'users/[userId]/repos/index',
    file: 'users/[userId]/repos/index.ts',
    absPath: '',
  },
  {
    path: 'users/[userId]',
    id: 'users/[userId]/index',
    file: 'users/[userId]/index.ts',
    absPath: '',
  },
  {
    path: 'users',
    id: 'users/index',
    file: 'users/index.ts',
    absPath: '',
  },
  {
    path: '/',
    id: 'index',
    file: 'index.ts',
    absPath: '',
  },
];

test('matchApiRoute ``', () => {
  const matched = matchApiRoute(apiRoutes, '');
  expect(matched?.route.path).toBe('/');
});

test('matchApiRoute `/`', () => {
  const matched = matchApiRoute(apiRoutes, '/');
  expect(matched?.route.path).toBe('/');
});

test('matchApiRoute `/api`', () => {
  const matched = matchApiRoute(apiRoutes, '/api');
  expect(matched?.route.path).toBe('/');
});

test('matchApiRoute `api`', () => {
  const matched = matchApiRoute(apiRoutes, 'api');
  expect(matched?.route.path).toBe('/');
});

test('matchApiRoute `/api`', () => {
  const matched = matchApiRoute(apiRoutes, '/api/');
  expect(matched?.route.path).toBe('/');
});

test('matchApiRoute `/api/users`', () => {
  const matched = matchApiRoute(apiRoutes, '/api/users');
  expect(matched?.route.path).toBe('users');
});

test('matchApiRoute `api/users`', () => {
  const matched = matchApiRoute(apiRoutes, 'api/users');
  expect(matched?.route.path).toBe('users');
});

test('matchApiRoute `/api/users/`', () => {
  const matched = matchApiRoute(apiRoutes, '/api/users/');
  expect(matched?.route.path).toBe('users');
});

test('matchApiRoute `api/users/`', () => {
  const matched = matchApiRoute(apiRoutes, 'api/users/');
  expect(matched?.route.path).toBe('users');
});

test('matchApiRoute `/users`', () => {
  const matched = matchApiRoute(apiRoutes, '/users');
  expect(matched?.route.path).toBe('users');
});

test('matchApiRoute `users`', () => {
  const matched = matchApiRoute(apiRoutes, 'users');
  expect(matched?.route.path).toBe('users');
});

test('matchApiRoute `users/`', () => {
  const matched = matchApiRoute(apiRoutes, 'users/');
  expect(matched?.route.path).toBe('users');
});

test('matchApiRoute `/users/`', () => {
  const matched = matchApiRoute(apiRoutes, '/users/');
  expect(matched?.route.path).toBe('users');
});

test('matchApiRoute `/api/users/1`', () => {
  const matched = matchApiRoute(apiRoutes, '/api/users/1');
  expect(matched?.route.path).toBe('users/[userId]');
  expect(matched?.params['userId']).toBe('1');
});

test('matchApiRoute `api/users/1/repos`', () => {
  const matched = matchApiRoute(apiRoutes, 'api/users/1/repos');
  expect(matched?.route.path).toBe('users/[userId]/repos');
  expect(matched?.params['userId']).toBe('1');
});

test('matchApiRoute `api/users/1/repos/2`', () => {
  const matched = matchApiRoute(apiRoutes, 'api/users/1/repos/2');
  expect(matched?.route.path).toBe('users/[userId]/repos/[repoId]');
  expect(matched?.params['userId']).toBe('1');
  expect(matched?.params['repoId']).toBe('2');
});
