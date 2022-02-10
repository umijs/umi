import { join } from 'path';
import { aliasLessImportPath } from './less';

const importer = join(__dirname, '../fixtures/x-plugins-less');
const alias = {
  '@': './symbol',
  '@asset': './symbol-prefix',
  prefix: './prefix',
};

const match = (filePath: string, aliasMap = true) => {
  return aliasLessImportPath(filePath, aliasMap ? alias : {}, importer);
};

test('match alias: symbol', async () => {
  // * success
  expect(await match('@/style.less')).toEqual(
    join(importer, 'symbol/style.less'),
  );
  expect(await match('@')).toEqual(join(importer, 'symbol.less'));

  // * fail
  expect(await match('@not')).toEqual(null);
  /**
   * with scope package case
   * @example import '@scope/pkg/dist/css/index.less'
   */
  expect(await match('@scope/style.less')).toEqual(null);
  expect(await match('@scope/pkg/style.less')).toEqual(null);
});

test('match alias: symbol with prefix', async () => {
  // * success
  expect(await match('@asset/style.less')).toEqual(
    join(importer, 'symbol-prefix/style.less'),
  );
  expect(await match('@asset')).toEqual(join(importer, 'symbol-prefix.less'));
  // should not use `alias` === `some package scope prefix`
  expect(await match('@asset/pkg/style.less')).toEqual(
    join(importer, 'symbol-prefix/pkg/style.less'),
  );

  // * fail
  expect(await match('@asset-not')).toEqual(null);
});

test('match alias: path', async () => {
  // * success
  expect(await match('prefix/style.less')).toEqual(
    join(importer, 'prefix/style.less'),
  );
  expect(await match('prefix')).toEqual(join(importer, 'prefix.less'));

  // * fail
  expect(await match('prefix-not')).toEqual(null);
  expect(await match('@prefix/style.less')).toEqual(null);
  // with scope package case
  expect(await match('@prefix/pkg/style.less')).toEqual(null);
});

test('no alias', async () => {
  expect(await match('@/style.less', false)).toEqual(null);
});
