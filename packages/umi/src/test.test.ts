import { getAliasPathWithKey } from './test';

const alias = {
  'react-dom': '/project/node_modules/react-dom',
  umi: '@@/exports',
  react: '/project/node_modules/react',
  '@': '/project/src',
  '@@': '/project/src/.umi-test',
};

test('simple alias to jest moduleNameMapper', () => {
  const p = getAliasPathWithKey(alias, 'react-dom');
  expect(p).toBe('/project/node_modules/react-dom');
});

test('double alias path', () => {
  const p = getAliasPathWithKey(alias, 'umi');
  expect(p).toBe('/project/src/.umi-test/exports');
});
