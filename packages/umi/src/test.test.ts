import { getAliasPathWithKey } from './test';

test('simple alias to jest moduleNameMapper', () => {
  const p = getAliasPathWithKey(
    {
      'react-dom': '/path/to/react-dom',
    },
    'react-dom',
  );
  expect(p).toBe('/path/to/react-dom');
});

test('double alias path', () => {
  const p = getAliasPathWithKey(
    {
      alias1: 'alias2/lib',
      alias2: '/path/to/module',
    },
    'alias1',
  );
  expect(p).toBe('/path/to/module/lib');
});

test('double alias path suffixed $', () => {
  const p = getAliasPathWithKey(
    {
      endWith$: '/path/to/index.js',
    },
    'endWith$',
  );
  expect(p).toBe('/path/to/index.js');
});

test('overlapped alias paths', () => {
  const p = getAliasPathWithKey(
    {
      common$: '/path/to/index.js',
      'common/lib': '/path/to/lib',
    },
    'common/lib',
  );
  expect(p).toBe('/path/to/lib');
});
