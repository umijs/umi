import { join } from 'path';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { winPath, winEOL } from 'umi-utils';
import insertComponent from './index';

const fixtures = winPath(join(__dirname, 'fixtures'));

function formatCode(code) {
  return winPath(winEOL(code.trim().replace(/[A-Z]:/g, ''))).replace(/\/\//g, '/');
}

function findFooFile(base) {
  if (existsSync(join(base, 'Foo.jsx'))) return join(base, 'Foo.jsx');
  if (existsSync(join(base, 'Foo.js'))) return join(base, 'Foo.js');
  if (existsSync(join(base, 'Foo.tsx'))) return join(base, 'Foo.tsx');
  if (existsSync(join(base, 'Foo.ts'))) return join(base, 'Foo.ts');
  return null;
}

function testTransform(dir) {
  const filePath = join(fixtures, dir, 'origin.js');
  const filename = existsSync(filePath)
    ? join(fixtures, dir, 'origin.js')
    : join(fixtures, dir, 'origin.tsx');
  const origin = readFileSync(filename, 'utf-8');
  const configFile = join(fixtures, dir, 'config.json');
  const config = existsSync(configFile) ? require(join(configFile)) : {};
  const code = insertComponent(origin, {
    identifier: 'Foo',
    filePath: '',
    relativePath: './Foo',
    absolutePath: findFooFile(join(fixtures, dir)),
    dontRemoveExtractedBlock: true,
    ...config,
  });
  const expectedFile = join(fixtures, dir, 'expected.js');
  if (existsSync(expectedFile)) {
    const expected = readFileSync(expectedFile, 'utf-8');
    // window 专用，去掉一下盘符，其实表现是正常的，但是为了保证测试通过
    expect(formatCode(code)).toEqual(formatCode(expected));
  } else {
    if (process.env.PRINT_CODE) {
      console.log(code);
    }
    writeFileSync(expectedFile, code, 'utf-8');
  }
}

readdirSync(fixtures).forEach(dir => {
  if (dir.charAt(0) !== '.') {
    const fn = dir.endsWith('-only') ? test.only : test;
    fn(dir, () => {
      testTransform(dir);
    });
  }
});
