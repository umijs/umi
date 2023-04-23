import { join } from 'path';
import { parseCircleAlias } from './parseCircleAlias';

test('easy case', () => {
  const alias = {
    umi: '@@/parseCircleAlias',
    dir: join(__dirname),
    file: __filename,
    '@@': join(__dirname),
    exact$: join(__dirname),
    '@@@': '@',
    '@': 'end-dep',
  } as const;
  const parsedAlias = parseCircleAlias({ alias });
  expect(parsedAlias.umi).toEqual(join(__dirname, './parseCircleAlias'));
  expect(parsedAlias.dir).toEqual(alias.dir);
  expect(parsedAlias.file).toEqual(alias.file);
  expect(parsedAlias['@@']).toEqual(alias['@@']);
  expect(parsedAlias.exact$).toEqual(alias.exact$);
  expect(parsedAlias['@@@']).toEqual(alias['@']);
  expect(parsedAlias['@']).toEqual(alias['@']);
});

test('complex case', () => {
  const alias = {
    umi: '@@/parseCircleAlias', // current file
    '@@': '@/',
    '@': '@@@/aliasUtils', // current dir
    '@@@': join(__dirname, '../'),
  } as const;
  const parsedAlias = parseCircleAlias({ alias });
  expect(parsedAlias.umi).toEqual(join(__dirname, './parseCircleAlias'));
  expect(parsedAlias['@@']).toEqual(join(__dirname, './'));
  expect(parsedAlias['@']).toEqual(join(__dirname));
  expect(parsedAlias['@@@']).toEqual(alias['@@@']);
});

test('error case', () => {
  const alias = {
    umi: 'preact',
    preact: 'umi/subpath',
  };
  expect(() => parseCircleAlias({ alias })).toThrow('endless loop');
});
