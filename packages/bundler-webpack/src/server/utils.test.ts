import { join, resolve } from 'path';
import { resolvePathWithinRoot } from './utils';

test('resolve path within root', () => {
  const root = resolve('/tmp/umi-app');

  expect(resolvePathWithinRoot(root, '/src/index.js')).toEqual(
    join(root, 'src/index.js'),
  );
  expect(resolvePathWithinRoot(root, '/src/../index.js')).toEqual(
    join(root, 'index.js'),
  );
  expect(resolvePathWithinRoot(root, '/..foo.js')).toEqual(
    join(root, '..foo.js'),
  );
});

test('reject path traversal outside root', () => {
  const root = resolve('/tmp/umi-app');

  expect(resolvePathWithinRoot(root, '/../secret.js')).toBe(null);
  expect(resolvePathWithinRoot(root, '/../umi-app2/secret.js')).toBe(null);
});
