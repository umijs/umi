import { dirname } from 'path';

function getPackageVersion(packageName: string, from: string) {
  const packagePath = require.resolve(`${packageName}/package.json`, {
    paths: [dirname(from)],
  });
  return require(packagePath).version;
}

test('uses the same esbuild version as bundler-utils', () => {
  const vitePackagePath = require.resolve('vite/package.json');
  const bundlerUtilsPackagePath = require.resolve(
    '@umijs/bundler-utils/package.json',
  );

  expect(getPackageVersion('esbuild', vitePackagePath)).toBe(
    getPackageVersion('esbuild', bundlerUtilsPackagePath),
  );
});
